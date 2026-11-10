import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { or } from '@prisma/orm-postgres/orm-client';
import { CreateCustomerDto } from './dtos/create-customer.dto.js';

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
}
