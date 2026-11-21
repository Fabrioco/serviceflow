import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { AssignTechnicianDto } from './dtos/assign-technician.dto.js';
import { CreateWorkOrderDto } from './dtos/create-work-order.dto.js';
import { ListWorkOrdersQueryDto } from './dtos/list-work-orders-query.dto.js';
import { ScheduleWorkOrderDto } from './dtos/schedule-work-order.dto.js';
import { UpdateWorkOrderDto } from './dtos/update-work-order.dto.js';
import {
  WorkOrderDetailResponseDto,
  WorkOrderListResponseDto,
  WorkOrderResponseDto,
} from './dtos/work-order-response.dto.js';
import type { WorkOrderStatus } from './work-orders-status.js';
import { db } from '../../prisma/db.js';
import { TokenPayload } from '../auth/services/token.service.js';

type Summary = { id: string; name: string };
type CustomerRow = Summary & { phone: string };
type OrderRow = {
  id: string;
  customerId: string;
  technicianId: string | null;
  serviceName: string;
  description: string;
  price: string | number;
  status: WorkOrderStatus;
  scheduledAt: Date | string | null;
  completedAt: Date | string | null;
  createdAt: Date | string;
};

const iso = (value: Date | string | null) =>
  value === null ? null : new Date(value).toISOString();
const formatDateTime = (date: Date) =>
  date.toLocaleString('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    dateStyle: 'short',
    timeStyle: 'short',
  });
const toMinute = (date: Date) => Math.floor(date.getTime() / 60_000);

const TOLERANCE_MS = 5 * 60 * 1000;
const TECHNICIAN_CHANGE_ALLOWED: WorkOrderStatus[] = ['OPEN', 'SCHEDULED'];
const EDITABLE: WorkOrderStatus[] = ['OPEN', 'SCHEDULED'];
const CANCELABLE: WorkOrderStatus[] = ['OPEN', 'SCHEDULED', 'IN_PROGRESS'];
const STARTABLE: WorkOrderStatus[] = ['OPEN', 'SCHEDULED'];
const COMPLETABLE: WorkOrderStatus[] = ['IN_PROGRESS'];

@Injectable()
export class WorkOrdersService {
  constructor(private readonly prisma: PrismaService) {}

  // ---------- criar ----------
  async create(
    dto: CreateWorkOrderDto,
    actor: TokenPayload,
  ): Promise<WorkOrderResponseDto> {
    const { organizationId } = actor;

    const customer = await this.getCustomer(dto.customerId, organizationId);
    const technician = dto.technicianId
      ? await this.getTechnician(dto.technicianId, organizationId)
      : null;
    const scheduledAt = dto.scheduledAt
      ? this.parseSchedule(dto.scheduledAt)
      : null;
    const status: WorkOrderStatus = scheduledAt ? 'SCHEDULED' : 'OPEN';

    // OS e histórico: tudo ou nada
    const order = await db.transaction(async (tx) => {
      const created = await tx.orm.public.WorkOrder.create({
        organizationId,
        customerId: customer.id,
        technicianId: technician?.id ?? null,
        serviceName: dto.serviceName,
        description: dto.description,
        price: dto.price.toFixed(2), // Numeric do Prisma 8: se pedir número, troque por dto.price
        status,
        scheduledAt,
        completedAt: null,
      });

      const messages = ['Ordem de serviço criada.'];
      if (technician) messages.push(`Técnico ${technician.name} atribuído.`);
      if (scheduledAt)
        messages.push(
          `Atendimento agendado para ${formatDateTime(scheduledAt)}.`,
        );

      // createdAt explícito: dentro da transação o now() do banco é igual para todos,
      // e a ordem do histórico se perderia
      const base = Date.now();
      for (const [index, message] of messages.entries()) {
        await tx.orm.public.WorkOrderEvent.create({
          workOrderId: created.id,
          actorId: actor.sub,
          message,
          createdAt: new Date(base + index),
        });
      }
      return created;
    });

    return this.toResponse(order, customer, technician);
  }

  // ---------- listar ----------
  async findAll(
    query: ListWorkOrdersQueryDto,
    actor: TokenPayload,
  ): Promise<WorkOrderListResponseDto> {
    const { status, customerId, page = 1, limit = 10 } = query;
    const offset = (page - 1) * limit;

    // técnico só enxerga as próprias OS; os demais podem filtrar por técnico
    const technicianId =
      actor.role === 'TECHNICIAN' ? actor.sub : query.technicianId;

    const filtered = this.prisma.db.WorkOrder.where({
      organizationId: actor.organizationId,
      ...(status ? { status } : {}),
      ...(customerId ? { customerId } : {}),
      ...(technicianId ? { technicianId } : {}),
    });

    const [rows, result] = await Promise.all([
      filtered
        .orderBy([(o) => o.createdAt.desc(), (o) => o.id.desc()])
        .limit(limit)
        .offset(offset)
        .all(),
      filtered.aggregate((aggregate) => ({ total: aggregate.count() })),
    ]);

    const customers = await this.customersById(
      actor.organizationId,
      rows.map((r) => r.customerId),
    );
    const technicians = await this.usersById(
      actor.organizationId,
      rows.flatMap((r) => (r.technicianId ? [r.technicianId] : [])),
    );

    return {
      data: rows.map((row) =>
        this.toResponse(
          row,
          customers.get(row.customerId) ?? {
            id: row.customerId,
            name: 'Cliente removido',
            phone: '',
          },
          row.technicianId ? (technicians.get(row.technicianId) ?? null) : null,
        ),
      ),
      meta: {
        total: result.total,
        page,
        limit,
        totalPages: Math.ceil(result.total / limit),
      },
    };
  }

  // ---------- detalhar ----------
  async findOne(
    id: string,
    actor: TokenPayload,
  ): Promise<WorkOrderDetailResponseDto> {
    const order = await this.getOrder(id, actor);

    const events = await this.prisma.db.WorkOrderEvent.where({
      workOrderId: order.id,
    })
      .orderBy((e) => e.createdAt.asc())
      .all();

    const customer = await this.getCustomer(
      order.customerId,
      actor.organizationId,
    );
    const users = await this.usersById(actor.organizationId, [
      ...events.map((e) => e.actorId),
      ...(order.technicianId ? [order.technicianId] : []),
    ]);

    return {
      ...this.toResponse(
        order,
        customer,
        order.technicianId ? (users.get(order.technicianId) ?? null) : null,
      ),
      events: events.map((e) => ({
        id: e.id,
        message: e.message,
        actorId: e.actorId,
        actorName: users.get(e.actorId)?.name ?? null,
        createdAt: new Date(e.createdAt).toISOString(),
      })),
    };
  }

  // ---------- editar ----------
  async update(
    id: string,
    dto: UpdateWorkOrderDto,
    actor: TokenPayload,
  ): Promise<WorkOrderResponseDto> {
    const { organizationId } = actor;
    const order = await this.getOrder(id, actor);

    if (!EDITABLE.includes(order.status)) {
      throw new ConflictException(
        'Só é possível editar ordens abertas ou agendadas.',
      );
    }

    const customer = await this.getCustomer(order.customerId, organizationId);
    const messages: string[] = [];
    const data: Record<string, unknown> = {};

    if (
      dto.serviceName !== undefined &&
      dto.serviceName !== order.serviceName
    ) {
      data.serviceName = dto.serviceName;
      messages.push('Serviço alterado.');
    }
    if (
      dto.description !== undefined &&
      dto.description !== order.description
    ) {
      data.description = dto.description;
      messages.push('Descrição alterada.');
    }
    if (
      dto.price !== undefined &&
      dto.price.toFixed(2) !== String(order.price)
    ) {
      data.price = dto.price.toFixed(2);
      messages.push('Valor alterado.');
    }

    let technician: Summary | null = null;
    if (order.technicianId) {
      technician =
        (await this.usersById(organizationId, [order.technicianId])).get(
          order.technicianId,
        ) ?? null;
    }

    // técnico: undefined = não mexe | null = remove | id = troca
    if (dto.technicianId === null) {
      if (order.technicianId) {
        data.technicianId = null;
        messages.push(
          technician
            ? `Técnico ${technician.name} removido.`
            : 'Técnico removido.',
        );
        technician = null;
      }
    } else if (dto.technicianId && dto.technicianId !== order.technicianId) {
      const next = await this.getTechnician(dto.technicianId, organizationId);
      data.technicianId = next.id;
      messages.push(
        technician
          ? `Técnico alterado de ${technician.name} para ${next.name}.`
          : `Técnico ${next.name} atribuído.`,
      );
      technician = next;
    }

    // agendamento: undefined = não mexe | null = remove | data = só valida se mudou
    if (dto.scheduledAt === null) {
      if (order.scheduledAt) {
        data.scheduledAt = null;
        data.status = 'OPEN';
        messages.push('Agendamento removido.');
      }
    } else if (dto.scheduledAt) {
      const unchanged =
        order.scheduledAt &&
        toMinute(new Date(dto.scheduledAt)) ===
          toMinute(new Date(order.scheduledAt));

      if (!unchanged) {
        const scheduledAt = this.parseSchedule(dto.scheduledAt); // só valida quando mudou
        data.scheduledAt = scheduledAt;
        data.status = 'SCHEDULED';
        messages.push(
          `Atendimento agendado para ${formatDateTime(scheduledAt)}.`,
        );
      }
    }

    // nada mudou: não registra histórico
    if (messages.length === 0)
      return this.toResponse(order, customer, technician);

    const updated = await db.transaction(async (tx) => {
      const result = await tx.orm.public.WorkOrder.where({
        id: order.id,
        organizationId,
        status: order.status, // evita corrida: só atualiza se o status não mudou
      }).update(data);

      if (!result)
        throw new ConflictException(
          'A ordem foi alterada por outra pessoa. Recarregue.',
        );

      const base = Date.now();
      for (const [index, message] of messages.entries()) {
        await tx.orm.public.WorkOrderEvent.create({
          workOrderId: order.id,
          actorId: actor.sub,
          message,
          createdAt: new Date(base + index),
        });
      }
      return result;
    });

    return this.toResponse(updated, customer, technician);
  }

  // ---------- cancelar ----------
  cancel(id: string, actor: TokenPayload) {
    return this.transition(id, actor, {
      from: CANCELABLE,
      to: 'CANCELED',
      message: 'Ordem de serviço cancelada.',
      conflictMessage: 'Não é possível cancelar esta ordem.',
    });
  }

  // ---------- iniciar ----------
  start(id: string, actor: TokenPayload) {
    return this.transition(id, actor, {
      from: STARTABLE,
      to: 'IN_PROGRESS',
      message: 'Atendimento iniciado.',
      conflictMessage: 'Só é possível iniciar ordens abertas ou agendadas.',
    });
  }

  // ---------- reagendar ----------
  reschedule(id: string, dto: ScheduleWorkOrderDto, actor: TokenPayload) {
    const scheduledAt = this.parseSchedule(dto.scheduledAt);
    return this.transition(id, actor, {
      from: EDITABLE,
      to: 'SCHEDULED',
      data: { scheduledAt },
      message: `Atendimento reagendado para ${formatDateTime(scheduledAt)}.`,
      conflictMessage: 'Só é possível reagendar ordens abertas ou agendadas.',
    });
  }

  // ---------- concluir ----------
  complete(id: string, actor: TokenPayload) {
    return this.transition(id, actor, {
      from: COMPLETABLE,
      to: 'COMPLETED',
      data: { completedAt: new Date() },
      message: 'Ordem de serviço concluída.',
      conflictMessage: 'Só é possível concluir ordens em andamento.',
    });
  }

  // ---------- atribuir técnico ----------
  async assignTechnician(
    id: string,
    dto: AssignTechnicianDto,
    actor: TokenPayload,
  ): Promise<WorkOrderResponseDto> {
    const { organizationId } = actor;
    const order = await this.getOrder(id, actor);

    if (!TECHNICIAN_CHANGE_ALLOWED.includes(order.status)) {
      throw new ConflictException(
        'Só é possível alterar o técnico de ordens abertas ou agendadas.',
      );
    }

    const technician = await this.getTechnician(
      dto.technicianId,
      organizationId,
    );
    const customer = await this.getCustomer(order.customerId, organizationId);

    // já é o técnico da OS: nada a fazer, nada a registrar
    if (order.technicianId === technician.id)
      return this.toResponse(order, customer, technician);

    const previous = order.technicianId
      ? (await this.usersById(organizationId, [order.technicianId])).get(
          order.technicianId,
        )
      : undefined;

    const updated = await db.transaction(async (tx) => {
      const result = await tx.orm.public.WorkOrder.where({
        id: order.id,
        organizationId,
      }).update({
        technicianId: technician.id,
      });

      // update devolve null se nenhuma linha bateu com o filtro
      if (!result)
        throw new NotFoundException('Ordem de serviço não encontrada.');

      await tx.orm.public.WorkOrderEvent.create({
        workOrderId: order.id,
        actorId: actor.sub,
        message: previous
          ? `Técnico alterado de ${previous.name} para ${technician.name}.`
          : `Técnico ${technician.name} atribuído.`,
      });

      return result;
    });

    return this.toResponse(updated, customer, technician);
  }

  // ---------- auxiliares ----------
  private async getOrder(id: string, actor: TokenPayload) {
    const order = await this.prisma.db.WorkOrder.where({
      id,
      organizationId: actor.organizationId,
    }).first();

    // 404 também para OS de outro técnico: não revela que existe
    if (
      !order ||
      (actor.role === 'TECHNICIAN' && order.technicianId !== actor.sub)
    ) {
      throw new NotFoundException('Ordem de serviço não encontrada.');
    }
    return order;
  }

  private async getCustomer(
    id: string,
    organizationId: string,
  ): Promise<CustomerRow> {
    const customer = await this.prisma.db.Customer.where({
      id,
      organizationId,
    }).first();
    if (!customer) throw new NotFoundException('Cliente não encontrado.');
    return customer;
  }

  private async getTechnician(
    id: string,
    organizationId: string,
  ): Promise<Summary> {
    const user = await this.prisma.db.User.where({
      id,
      organizationId,
      role: 'TECHNICIAN',
    }).first();
    if (!user) throw new NotFoundException('Técnico não encontrado.');
    return user;
  }

  private parseSchedule(value: string): Date {
    const date = new Date(value);
    if (Number.isNaN(date.getTime()))
      throw new BadRequestException('Data de agendamento inválida.');
    if (date.getTime() < Date.now() - TOLERANCE_MS) {
      throw new BadRequestException(
        'A data do agendamento não pode estar no passado.',
      );
    }
    return date;
  }

  // Uma busca por id único (limitado pela página). Se o Prisma 8 oferecer filtro "in",
  // dá para trocar por uma consulta só.
  private async customersById(organizationId: string, ids: string[]) {
    const rows = await Promise.all(
      [...new Set(ids)].map((id) =>
        this.prisma.db.Customer.where({ id, organizationId }).first(),
      ),
    );
    return new Map(
      rows.flatMap((row) =>
        row ? [[row.id, row as CustomerRow] as const] : [],
      ),
    );
  }

  private async usersById(organizationId: string, ids: string[]) {
    const rows = await Promise.all(
      [...new Set(ids)].map((id) =>
        this.prisma.db.User.where({ id, organizationId }).first(),
      ),
    );
    return new Map(
      rows.flatMap((row) => (row ? [[row.id, row as Summary] as const] : [])),
    );
  }

  private toResponse(
    order: OrderRow,
    customer: CustomerRow,
    technician: Summary | null,
  ): WorkOrderResponseDto {
    return {
      id: order.id,
      status: order.status,
      serviceName: order.serviceName,
      description: order.description,
      price: String(order.price),
      scheduledAt: iso(order.scheduledAt),
      completedAt: iso(order.completedAt),
      createdAt: new Date(order.createdAt).toISOString(),
      customer: { id: customer.id, name: customer.name, phone: customer.phone },
      technician: technician
        ? { id: technician.id, name: technician.name }
        : null,
    };
  }

  // muda o status de forma atômica e registra o histórico
  private async transition(
    id: string,
    actor: TokenPayload,
    opts: {
      from: WorkOrderStatus[];
      to: WorkOrderStatus;
      message: string;
      conflictMessage: string;
      data?: Record<string, unknown>;
    },
  ): Promise<WorkOrderResponseDto> {
    const { organizationId } = actor;
    const order = await this.getOrder(id, actor);

    if (!opts.from.includes(order.status)) {
      throw new ConflictException(opts.conflictMessage);
    }

    const customer = await this.getCustomer(order.customerId, organizationId);
    const technician = order.technicianId
      ? ((await this.usersById(organizationId, [order.technicianId])).get(
          order.technicianId,
        ) ?? null)
      : null;

    const updated = await db.transaction(async (tx) => {
      const result = await tx.orm.public.WorkOrder.where({
        id: order.id,
        organizationId,
        status: order.status,
      }).update({ status: opts.to, ...opts.data });

      if (!result)
        throw new ConflictException(
          'A ordem foi alterada por outra pessoa. Recarregue.',
        );

      await tx.orm.public.WorkOrderEvent.create({
        workOrderId: order.id,
        actorId: actor.sub,
        message: opts.message,
      });
      return result;
    });

    return this.toResponse(updated, customer, technician);
  }
}
