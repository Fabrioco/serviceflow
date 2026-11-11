import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiParam,
} from '@nestjs/swagger';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import type { TokenPayload } from '../auth/services/token.service.js';

import { CustomerService } from './customer.service.js';
import { ListCustomersQueryDto } from './dtos/list-customers-query.dto.js';
import { listCustomersResponseExample } from './dtos/list-customers-response.dto.js';
import { CreateCustomerDto } from './dtos/create-customer.dto.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { UseRoles } from '../../common/decorators/roles.decorator.js';
import { UpdateCustomerDto } from './dtos/update-customer.dto.js';

@ApiTags('Clientes')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@UseRoles('ADMIN', 'OWNER')
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

  @Get(':customerId')
  @ApiParam({
    name: 'customerId',
    description: 'Id do cliente',
    type: 'string',
    required: true,
    example: '55ff6643-251a-4904-b414-296766f3164e',
  })
  getOne(
    @Param('customerId') customerId: string,
    @CurrentUser() user: TokenPayload,
  ) {
    return this.service.getOne(customerId, user.organizationId);
  }

  @Post('new')
  create(@CurrentUser() user: TokenPayload, @Body() dto: CreateCustomerDto) {
    return this.service.createCustomer(dto, user.organizationId);
  }

  @Patch(':customerId')
  @ApiParam({
    name: 'customerId',
    description: 'Id do cliente',
    type: 'string',
    required: true,
    example: '55ff6643-251a-4904-b414-296766f3164e',
  })
  update(
    @Body() dto: UpdateCustomerDto,
    @Param('customerId') customerId: string,
    @CurrentUser() user: TokenPayload,
  ) {
    return this.service.update(customerId, user.organizationId, dto);
  }
}
