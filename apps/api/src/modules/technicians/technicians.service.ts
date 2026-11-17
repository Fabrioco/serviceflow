import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { or } from '@prisma/orm-postgres/orm-client';
import type { TokenPayload } from '../auth/services/token.service.js';
import { HashService } from '../auth/services/hash.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateTechnicianDto } from './dtos/create-technician.dto.js';
import { ListTechniciansQueryDto } from './dtos/list-technicians-query.dto.js';
import { ResetTechnicianPasswordDto } from './dtos/reset-technician-password.dto.js';
import {
  TechnicianListResponseDto,
  TechnicianResponseDto,
} from './dtos/technician-response.dto.js';
import { UpdateTechnicianDto } from './dtos/update-technician.dto.js';

type UserRow = {
  id: string;
  name: string;
  email: string;
  createdAt: Date | string;
};

@Injectable()
export class TechniciansService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly hash: HashService,
  ) {}

  async create(
    dto: CreateTechnicianDto,
    actor: TokenPayload,
  ): Promise<TechnicianResponseDto> {
    const email = dto.email.trim().toLowerCase();
    await this.assertEmailAvailable(email);

    const passwordHash = await this.hash.hashPassword(dto.password);

    const user = await this.prisma.db.User.create({
      organizationId: actor.organizationId, // sempre a do token
      name: dto.name,
      email,
      passwordHash,
      role: 'TECHNICIAN', // fixo: o corpo não escolhe o papel
    });

    return this.toResponse(user);
  }

  async findAll(
    query: ListTechniciansQueryDto,
    actor: TokenPayload,
  ): Promise<TechnicianListResponseDto> {
    const { page = 1, limit = 10 } = query;
    const offset = (page - 1) * limit;
    const search = query.search?.trim();

    const base = this.prisma.db.User.where({
      organizationId: actor.organizationId,
      role: 'TECHNICIAN',
    });

    const term = search ? `%${search.replace(/[%_\\]/g, '\\$&')}%` : null; // escapa curingas do LIKE
    const filtered = term
      ? base.where((user) => or(user.name.ilike(term), user.email.ilike(term)))
      : base;

    const [rows, result] = await Promise.all([
      filtered
        .orderBy([(user) => user.name.asc(), (user) => user.id.asc()])
        .limit(limit)
        .offset(offset)
        .all(),
      filtered.aggregate((aggregate) => ({ total: aggregate.count() })),
    ]);

    return {
      data: rows.map((row) => this.toResponse(row)),
      meta: {
        total: result.total,
        page,
        limit,
        totalPages: Math.ceil(result.total / limit),
      },
    };
  }

  async findOne(id: string, actor: TokenPayload): Promise<TechnicianResponseDto> {
    return this.toResponse(await this.getTechnician(id, actor.organizationId));
  }

  async update(
    id: string,
    dto: UpdateTechnicianDto,
    actor: TokenPayload,
  ): Promise<TechnicianResponseDto> {
    const { organizationId } = actor;
    const current = await this.getTechnician(id, organizationId);

    const data: { name?: string; email?: string } = {};
    if (dto.name !== undefined) data.name = dto.name;
    if (dto.email !== undefined) {
      const email = dto.email.trim().toLowerCase();
      if (email !== current.email) {
        await this.assertEmailAvailable(email, current.id);
        data.email = email;
      }
    }

    // nada mudou: devolve como está
    if (Object.keys(data).length === 0) return this.toResponse(current);

    const updated = await this.prisma.db.User.where({
      id: current.id,
      organizationId,
      role: 'TECHNICIAN',
    }).update(data);

    // update devolve null se nenhuma linha bateu com o filtro
    if (!updated) throw new NotFoundException('Técnico não encontrado.');
    return this.toResponse(updated);
  }

  async resetPassword(
    id: string,
    dto: ResetTechnicianPasswordDto,
    actor: TokenPayload,
  ): Promise<void> {
    const { organizationId } = actor;
    const technician = await this.getTechnician(id, organizationId);
    const passwordHash = await this.hash.hashPassword(dto.password);

    const updated = await this.prisma.db.User.where({
      id: technician.id,
      organizationId,
      role: 'TECHNICIAN',
    }).update({ passwordHash });

    if (!updated) throw new NotFoundException('Técnico não encontrado.');
  }

  async remove(id: string, actor: TokenPayload): Promise<void> {
    const { organizationId } = actor;
    const technician = await this.getTechnician(id, organizationId);

    const hasOrders = await this.prisma.db.WorkOrder.where({
      organizationId,
      technicianId: technician.id,
    }).first();
    if (hasOrders) {
      throw new ConflictException(
        'Este técnico possui ordens de serviço e não pode ser excluído.',
      );
    }

    await this.prisma.db.User.where({
      id: technician.id,
      organizationId,
      role: 'TECHNICIAN',
    }).delete();
  }

  // ---------- auxiliares ----------
  private async getTechnician(id: string, organizationId: string) {
    // o filtro por papel impede que este módulo enxergue (ou apague) o dono e administradores
    const user = await this.prisma.db.User.where({
      id,
      organizationId,
      role: 'TECHNICIAN',
    }).first();
    if (!user) throw new NotFoundException('Técnico não encontrado.');
    return user;
  }

  // O e-mail é único no sistema inteiro (@unique no contrato), então a busca NÃO filtra por empresa.
  private async assertEmailAvailable(email: string, ignoreId?: string) {
    const existing = await this.prisma.db.User.where({ email }).first();
    if (existing && existing.id !== ignoreId) {
      throw new ConflictException('Este e-mail já está em uso.');
    }
  }

  // monta a resposta campo a campo: o passwordHash nunca sai daqui
  private toResponse(user: UserRow): TechnicianResponseDto {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: 'TECHNICIAN',
      createdAt: new Date(user.createdAt).toISOString(),
    };
  }
}
