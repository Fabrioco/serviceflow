import { ApiProperty } from '@nestjs/swagger';
import {
  WORK_ORDER_STATUSES,
  type WorkOrderStatus,
} from '../work-orders-status.js';

export class CustomerSummaryDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ example: 'Ana Souza' })
  name!: string;

  @ApiProperty({ example: '19999990000', description: 'Somente dígitos.' })
  phone!: string;
}

export class TechnicianSummaryDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ example: 'João Silva' })
  name!: string;
}

export class WorkOrderResponseDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({
    enum: WORK_ORDER_STATUSES,
    enumName: 'WorkOrderStatus',
    example: 'SCHEDULED',
  })
  status!: WorkOrderStatus;

  @ApiProperty({ example: 'Manutenção de ar-condicionado' })
  serviceName!: string;

  @ApiProperty({ example: 'O ar-condicionado do quarto não está gelando.' })
  description!: string;

  @ApiProperty({
    example: '180.00',
    description: 'Valor em reais, como texto, para não perder precisão.',
  })
  price!: string;

  @ApiProperty({
    type: String,
    format: 'date-time',
    nullable: true,
    example: '2026-11-20T17:00:00.000Z',
  })
  scheduledAt!: string | null;

  @ApiProperty({ type: String, format: 'date-time', nullable: true })
  completedAt!: string | null;

  @ApiProperty({ type: String, format: 'date-time' })
  createdAt!: string;

  @ApiProperty({ type: () => CustomerSummaryDto })
  customer!: CustomerSummaryDto;

  @ApiProperty({ type: () => TechnicianSummaryDto, nullable: true })
  technician!: TechnicianSummaryDto | null;
}

export class WorkOrderEventDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ example: 'Técnico João Silva atribuído.' })
  message!: string;

  @ApiProperty({ format: 'uuid', description: 'Quem fez a ação.' })
  actorId!: string;

  @ApiProperty({ type: String, nullable: true, example: 'Maria' })
  actorName!: string | null;

  @ApiProperty({ type: String, format: 'date-time' })
  createdAt!: string;
}

export class WorkOrderDetailResponseDto extends WorkOrderResponseDto {
  @ApiProperty({
    type: () => [WorkOrderEventDto],
    description: 'Histórico, do mais antigo ao mais recente.',
  })
  events!: WorkOrderEventDto[];
}

export class PageMetaDto {
  @ApiProperty({ example: 25 }) total!: number;
  @ApiProperty({ example: 1 }) page!: number;
  @ApiProperty({ example: 10 }) limit!: number;
  @ApiProperty({ example: 3 }) totalPages!: number;
}

export class WorkOrderListResponseDto {
  @ApiProperty({ type: () => [WorkOrderResponseDto] })
  data!: WorkOrderResponseDto[];

  @ApiProperty({ type: () => PageMetaDto })
  meta!: PageMetaDto;
}
