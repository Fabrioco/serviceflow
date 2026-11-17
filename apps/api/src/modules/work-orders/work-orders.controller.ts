import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AssignTechnicianDto } from './dtos/assign-technician.dto.js';
import { CreateWorkOrderDto } from './dtos/create-work-order.dto.js';
import { ListWorkOrdersQueryDto } from './dtos/list-work-orders-query.dto.js';
import {
  WorkOrderDetailResponseDto,
  WorkOrderListResponseDto,
  WorkOrderResponseDto,
} from './dtos/work-order-response.dto.js';
import { WorkOrdersService } from './work-orders.service.js';
import { errorSchema } from './dtos/error-schema.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { UseRoles } from '../../common/decorators/roles.decorator.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import type { TokenPayload } from '../auth/services/token.service.js';

@ApiTags('Ordens de Serviço')
@ApiBearerAuth()
@ApiUnauthorizedResponse({
  description: 'Token ausente, inválido ou expirado.',
  schema: errorSchema(401, 'Unauthorized'),
})
@Controller('work-orders')
@UseGuards(JwtAuthGuard, RolesGuard)
export class WorkOrdersController {
  constructor(private readonly workOrders: WorkOrdersService) {}

  @Post()
  @UseRoles('OWNER', 'ADMIN')
  @ApiOperation({
    summary: 'Cria uma ordem de serviço',
    description: [
      'Regras:',
      '- O cliente e o técnico (se informado) precisam ser da sua empresa. O técnico precisa ter o papel TECHNICIAN.',
      '- A OS nasce como OPEN. Se `scheduledAt` for informado, nasce como SCHEDULED (a data não pode estar no passado).',
      '- A criação, a atribuição do técnico e o agendamento ficam registrados no histórico.',
      '- A empresa vem do token: não é enviada no corpo.',
    ].join('\n'),
  })
  @ApiCreatedResponse({
    type: WorkOrderResponseDto,
    description: 'Ordem de serviço criada.',
  })
  @ApiBadRequestResponse({
    description:
      'Dados inválidos (lista de mensagens de validação) ou data de agendamento no passado ("A data do agendamento não pode estar no passado.").',
    schema: errorSchema(400, ['price must not be less than 0'], 'Bad Request'),
  })
  @ApiForbiddenResponse({
    description: 'Somente OWNER e ADMIN.',
    schema: errorSchema(403, 'Forbidden'),
  })
  @ApiNotFoundResponse({
    description:
      'Cliente ou técnico não encontrado na sua empresa ("Técnico não encontrado.").',
    schema: errorSchema(404, 'Cliente não encontrado.', 'Not Found'),
  })
  create(@CurrentUser() user: TokenPayload, @Body() dto: CreateWorkOrderDto) {
    return this.workOrders.create(dto, user);
  }

  @Get()
  @ApiOperation({
    summary: 'Lista as ordens de serviço',
    description:
      'Paginada, da mais recente para a mais antiga. Filtros por status, cliente e técnico. Um TECHNICIAN vê somente as OS atribuídas a ele.',
  })
  @ApiOkResponse({ type: WorkOrderListResponseDto })
  @ApiBadRequestResponse({
    description: 'Filtro inválido (status, ids ou paginação).',
    schema: errorSchema(
      400,
      [
        'status must be one of the following values: OPEN, SCHEDULED, IN_PROGRESS, COMPLETED, CANCELED',
      ],
      'Bad Request',
    ),
  })
  findAll(
    @CurrentUser() user: TokenPayload,
    @Query() query: ListWorkOrdersQueryDto,
  ) {
    return this.workOrders.findAll(query, user);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Detalha uma ordem de serviço',
    description:
      'Inclui o cliente, o técnico e o histórico de eventos, do mais antigo ao mais recente.',
  })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiOkResponse({ type: WorkOrderDetailResponseDto })
  @ApiBadRequestResponse({
    description: 'O id não é um UUID.',
    schema: errorSchema(
      400,
      'Validation failed (uuid is expected)',
      'Bad Request',
    ),
  })
  @ApiNotFoundResponse({
    description:
      'Não existe, é de outra empresa ou (para técnicos) é de outro técnico.',
    schema: errorSchema(404, 'Ordem de serviço não encontrada.', 'Not Found'),
  })
  findOne(
    @CurrentUser() user: TokenPayload,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.workOrders.findOne(id, user);
  }

  @Patch(':id/technician')
  @UseRoles('OWNER', 'ADMIN')
  @ApiOperation({
    summary: 'Atribui ou troca o técnico da ordem de serviço',
    description: [
      'Regras:',
      '- Só enquanto a OS está OPEN ou SCHEDULED.',
      '- O técnico precisa ter o papel TECHNICIAN na sua empresa.',
      '- Atribuir o técnico que já está na OS não altera nada nem gera evento.',
    ].join('\n'),
  })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiOkResponse({ type: WorkOrderResponseDto })
  @ApiBadRequestResponse({
    description:
      'O id da OS não é um UUID, ou o `technicianId` do corpo é inválido.',
    schema: errorSchema(400, ['technicianId must be a UUID'], 'Bad Request'),
  })
  @ApiForbiddenResponse({
    description: 'Somente OWNER e ADMIN.',
    schema: errorSchema(403, 'Forbidden'),
  })
  @ApiNotFoundResponse({
    description:
      'OS ou técnico não encontrado na sua empresa ("Técnico não encontrado.").',
    schema: errorSchema(404, 'Ordem de serviço não encontrada.', 'Not Found'),
  })
  @ApiConflictResponse({
    description: 'A OS não está mais aberta nem agendada.',
    schema: errorSchema(
      409,
      'Só é possível alterar o técnico de ordens abertas ou agendadas.',
      'Conflict',
    ),
  })
  assignTechnician(
    @CurrentUser() user: TokenPayload,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AssignTechnicianDto,
  ) {
    return this.workOrders.assignTechnician(id, dto, user);
  }
}
