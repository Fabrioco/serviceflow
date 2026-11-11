import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { or } from '@prisma/orm-postgres/orm-client';
import { CreateCustomerDto } from './dtos/create-customer.dto.js';
import { UpdateCustomerDto } from './dtos/update-customer.dto.js';

@Injectable()
export class CustomerService {
  constructor(private readonly prisma: PrismaService) {}

  async getAll(organizationId: string, page = 1, limit = 10, search?: string) {
    const offset = (page - 1) * limit;
    const normalizedSearch = search?.trim();

    const baseQuery = this.prisma.db.Customer.where({
      organizationId,
    });

    const filteredQuery = normalizedSearch
      ? baseQuery.where((customer) =>
          or(
            customer.name.ilike(`%${normalizedSearch}%`),
            customer.phone.ilike(`%${normalizedSearch}%`),
            customer.email.ilike(`%${normalizedSearch}%`),
          ),
        )
      : baseQuery;

    const [customers, result] = await Promise.all([
      filteredQuery
        .orderBy([
          (customer) => customer.createdAt.desc(),
          (customer) => customer.id.desc(),
        ])
        .limit(limit)
        .offset(offset)
        .all(),

      filteredQuery.aggregate((aggregate) => ({
        total: aggregate.count(),
      })),
    ]);
    const totalPages = Math.ceil(result.total / limit);

    return {
      data: customers,
      meta: {
        total: result.total,
        page,
        limit,
        totalPages,
      },
    };
  }

  async getOne(customerId: string, organizationId: string) {
    const customer = await this.prisma.db.Customer.where({
      id: customerId,
      organizationId,
    }).first();

    if (!customer) {
      throw new NotFoundException('Cliente não encontrado.');
    }

    return customer;
  }

  async createCustomer(dto: CreateCustomerDto, organizationId: string) {
    const email = dto.email?.trim().toLowerCase() || null;
    const phone = dto.phone.replace(/\D/g, ''); // só dígitos

    const duplicate = await this.prisma.db.Customer.where({ organizationId })
      .where((customer) =>
        email
          ? or(customer.email.eq(email), customer.phone.eq(phone))
          : customer.phone.eq(phone),
      )
      .first();

    if (duplicate) {
      throw new ConflictException(
        'Já existe um cliente com esse e-mail ou telefone na sua empresa.',
      );
    }

    return this.prisma.db.Customer.create({
      organizationId,
      name: dto.name,
      phone,
      email,
      address: dto.address ?? null,
      notes: dto.notes ?? null,
    });
  }

  async update(
    customerId: string,
    organizationId: string,
    dto: UpdateCustomerDto,
  ) {
    await this.getOne(customerId, organizationId);

    const data: Record<string, string | null> = {};
    if (dto.name !== undefined) data.name = dto.name;
    if (dto.phone !== undefined) data.phone = dto.phone.replace(/\D/g, '');
    if (dto.email !== undefined)
      data.email = dto.email?.trim().toLowerCase() || null;
    if (dto.address !== undefined) data.address = dto.address;
    if (dto.notes !== undefined) data.notes = dto.notes;

    if (data.email)
      await this.assertNotDuplicate(
        organizationId,
        'email',
        data.email,
        customerId,
      );
    if (data.phone)
      await this.assertNotDuplicate(
        organizationId,
        'phone',
        data.phone,
        customerId,
      );

    return this.prisma.db.Customer.where({
      id: customerId,
      organizationId,
    }).update(data);
  }

  async delete(customerId: string, organizationId: string) {
    const customer = await this.getOne(customerId, organizationId);

    return this.prisma.db.Customer.where({
      id: customerId,
      organizationId,
    }).delete();
  }

  private async assertNotDuplicate(
    organizationId: string,
    field: 'email' | 'phone',
    value: string,
    ignoreId: string,
  ) {
    const matches = await this.prisma.db.Customer.where({ organizationId })
      .where((customer) =>
        field === 'email' ? customer.email.eq(value) : customer.phone.eq(value),
      )
      .all();

    if (matches.some((customer) => customer.id !== ignoreId)) {
      throw new ConflictException(
        'Já existe um cliente com esse e-mail ou telefone na sua empresa.',
      );
    }
  }
}
