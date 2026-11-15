import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsUUID, Max, Min } from 'class-validator';
import {
  WORK_ORDER_STATUSES,
  type WorkOrderStatus,
} from '../work-orders-status.js';

export class ListWorkOrdersQueryDto {
  @ApiPropertyOptional({
    enum: WORK_ORDER_STATUSES,
    enumName: 'WorkOrderStatus',
  })
  @IsOptional()
  @IsIn(WORK_ORDER_STATUSES)
  status?: WorkOrderStatus;

  @ApiPropertyOptional({ format: 'uuid', description: 'Filtra por cliente.' })
  @IsOptional()
  @IsUUID()
  customerId?: string;

  @ApiPropertyOptional({
    format: 'uuid',
    description:
      'Filtra por técnico. Ignorado quando quem consulta é um técnico (ele só vê as próprias OS).',
  })
  @IsOptional()
  @IsUUID()
  technicianId?: string;

  @ApiPropertyOptional({ default: 1, minimum: 1 })
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ default: 10, minimum: 1, maximum: 100 })
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;
}
