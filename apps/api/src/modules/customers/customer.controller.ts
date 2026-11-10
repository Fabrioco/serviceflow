import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import type { TokenPayload } from '../auth/services/token.service.js';

import { CustomerService } from './customer.service.js';
import { ListCustomersQueryDto } from './dtos/list-customers-query.dto.js';
import { listCustomersResponseExample } from './dtos/list-customers-response.dto.js';
import { CreateCustomerDto } from './dtos/create-customer.dto.js';

@ApiTags('Clientes')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('customers')
export class CustomerController {
  constructor(private readonly service: CustomerService) {}

  @Get()
  @ApiOkResponse({
    description: 'Clientes listados com sucesso.',
    schema: {
      example: listCustomersResponseExample,
    },
  })
  @ApiOkResponse({ description: 'Lista de clientes retornada com sucesso.' })
  @ApiBadRequestResponse({ description: 'Parâmetros inválidos.' })
  @ApiUnauthorizedResponse({
    description: 'Token ausente, inválido ou expirado.',
  })
  getAll(
    @CurrentUser() user: TokenPayload,
    @Query() query: ListCustomersQueryDto,
  ) {
    return this.service.getAll(
      user.organizationId,
      query.page,
      query.limit,
      query.search,
    );
  }

  @Post('new')
  create(@CurrentUser() user: TokenPayload, @Body() dto: CreateCustomerDto) {
    return this.service.createCustomer(dto, user.organizationId);
  }
}
