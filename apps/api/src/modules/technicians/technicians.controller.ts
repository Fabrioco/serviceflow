import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
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
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CreateTechnicianDto } from './dtos/create-technician.dto.js';
import { ListTechniciansQueryDto } from './dtos/list-technicians-query.dto.js';
import { ResetTechnicianPasswordDto } from './dtos/reset-technician-password.dto.js';
import {
  TechnicianListResponseDto,
  TechnicianResponseDto,
} from './dtos/technician-response.dto.js';
import { UpdateTechnicianDto } from './dtos/update-technician.dto.js';
import { TechniciansService } from './technicians.service.js';
import { errorSchema } from '../work-orders/dtos/error-schema.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { UseRoles } from '../../common/decorators/roles.decorator.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import type { TokenPayload } from '../auth/services/token.service.js';

const NOT_FOUND = errorSchema(404, 'Técnico não encontrado.', 'Not Found');
const FORBIDDEN_OWNER = errorSchema(403, 'Forbidden');
const BAD_UUID = errorSchema(
  400,
  'Validation failed (uuid is expected)',
  'Bad Request',
);

@ApiTags('technicians')
@ApiBearerAuth()
@ApiUnauthorizedResponse({
  description: 'Token ausente, inválido ou expirado.',
  schema: errorSchema(401, 'Unauthorized'),
})
@Controller('technicians')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TechniciansController {
  constructor(private readonly technicians: TechniciansService) {}

  @Post()
  @UseRoles('OWNER')
  @ApiOperation({
    summary: 'Cria um técnico',
    description: [
      'Cria um usuário com o papel TECHNICIAN na empresa do proprietário.',
      '- Quem define a senha inicial é o proprietário, e ele a repassa ao técnico.',
      '- O e-mail é único no sistema inteiro e guardado em minúsculas.',
      '- O papel é sempre TECHNICIAN: não é enviado no corpo.',
    ].join('\n'),
  })
  @ApiCreatedResponse({
    type: TechnicianResponseDto,
    description: 'Técnico criado.',
  })
  @ApiBadRequestResponse({
    description: 'Dados inválidos.',
    schema: errorSchema(
      400,
      [
        'email must be an email',
        'password must be longer than or equal to 8 characters',
      ],
      'Bad Request',
    ),
  })
  @ApiForbiddenResponse({
    description: 'Somente OWNER.',
    schema: FORBIDDEN_OWNER,
  })
  @ApiConflictResponse({
    description: 'E-mail já em uso.',
    schema: errorSchema(409, 'Este e-mail já está em uso.', 'Conflict'),
  })
  create(@CurrentUser() user: TokenPayload, @Body() dto: CreateTechnicianDto) {
    return this.technicians.create(dto, user);
  }

  @Get()
  @UseRoles('OWNER', 'ADMIN')
  @ApiOperation({
    summary: 'Lista os técnicos da empresa',
    description:
      'Paginada, em ordem alfabética, com busca por nome ou e-mail. Usada para escolher o técnico de uma ordem de serviço.',
  })
  @ApiOkResponse({ type: TechnicianListResponseDto })
  @ApiBadRequestResponse({
    description: 'Paginação inválida.',
    schema: errorSchema(
      400,
      ['limit must not be greater than 100'],
      'Bad Request',
    ),
  })
  @ApiForbiddenResponse({
    description: 'Somente OWNER e ADMIN.',
    schema: FORBIDDEN_OWNER,
  })
  findAll(
    @CurrentUser() user: TokenPayload,
    @Query() query: ListTechniciansQueryDto,
  ) {
    return this.technicians.findAll(query, user);
  }

  @Get(':id')
  @UseRoles('OWNER', 'ADMIN')
  @ApiOperation({ summary: 'Detalha um técnico' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiOkResponse({ type: TechnicianResponseDto })
  @ApiBadRequestResponse({
    description: 'O id não é um UUID.',
    schema: BAD_UUID,
  })
  @ApiForbiddenResponse({
    description: 'Somente OWNER e ADMIN.',
    schema: FORBIDDEN_OWNER,
  })
  @ApiNotFoundResponse({
    description: 'Não existe, é de outra empresa ou não é técnico.',
    schema: NOT_FOUND,
  })
  findOne(
    @CurrentUser() user: TokenPayload,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.technicians.findOne(id, user);
  }

  @Patch(':id')
  @UseRoles('OWNER')
  @ApiOperation({
    summary: 'Altera nome e e-mail do técnico',
    description: 'Campos opcionais. A senha tem endpoint próprio.',
  })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiOkResponse({ type: TechnicianResponseDto })
  @ApiBadRequestResponse({
    description: 'Dados inválidos ou id que não é UUID.',
    schema: errorSchema(400, ['email must be an email'], 'Bad Request'),
  })
  @ApiForbiddenResponse({
    description: 'Somente OWNER.',
    schema: FORBIDDEN_OWNER,
  })
  @ApiNotFoundResponse({
    description: 'Técnico não encontrado na sua empresa.',
    schema: NOT_FOUND,
  })
  @ApiConflictResponse({
    description: 'E-mail já em uso por outro usuário.',
    schema: errorSchema(409, 'Este e-mail já está em uso.', 'Conflict'),
  })
  update(
    @CurrentUser() user: TokenPayload,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateTechnicianDto,
  ) {
    return this.technicians.update(id, dto, user);
  }

  @Patch(':id/password')
  @UseRoles('OWNER')
  @HttpCode(204)
  @ApiOperation({
    summary: 'Define uma nova senha para o técnico',
    description:
      'Quem define é o proprietário. Tokens já emitidos continuam valendo até expirar (1 hora).',
  })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiNoContentResponse({ description: 'Senha alterada.' })
  @ApiBadRequestResponse({
    description: 'Senha inválida ou id que não é UUID.',
    schema: errorSchema(
      400,
      ['password must be longer than or equal to 8 characters'],
      'Bad Request',
    ),
  })
  @ApiForbiddenResponse({
    description: 'Somente OWNER.',
    schema: FORBIDDEN_OWNER,
  })
  @ApiNotFoundResponse({
    description: 'Técnico não encontrado na sua empresa.',
    schema: NOT_FOUND,
  })
  resetPassword(
    @CurrentUser() user: TokenPayload,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ResetTechnicianPasswordDto,
  ) {
    return this.technicians.resetPassword(id, dto, user);
  }

  @Delete(':id')
  @UseRoles('OWNER')
  @HttpCode(204)
  @ApiOperation({
    summary: 'Exclui um técnico',
    description:
      'Só é possível se o técnico não tiver nenhuma ordem de serviço atribuída (de qualquer status).',
  })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiNoContentResponse({ description: 'Técnico excluído.' })
  @ApiBadRequestResponse({
    description: 'O id não é um UUID.',
    schema: BAD_UUID,
  })
  @ApiForbiddenResponse({
    description: 'Somente OWNER.',
    schema: FORBIDDEN_OWNER,
  })
  @ApiNotFoundResponse({
    description: 'Técnico não encontrado na sua empresa.',
    schema: NOT_FOUND,
  })
  @ApiConflictResponse({
    description: 'O técnico possui ordens de serviço.',
    schema: errorSchema(
      409,
      'Este técnico possui ordens de serviço e não pode ser excluído.',
      'Conflict',
    ),
  })
  remove(
    @CurrentUser() user: TokenPayload,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.technicians.remove(id, user);
  }
}
