import { ApiProperty } from '@nestjs/swagger';
import { PageMetaDto } from '../../work-orders/dtos/work-order-response.dto.js';

export class TechnicianResponseDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ example: 'João Silva' })
  name!: string;

  @ApiProperty({ example: 'joao@climatech.com' })
  email!: string;

  @ApiProperty({ example: 'TECHNICIAN', enum: ['TECHNICIAN'] })
  role!: 'TECHNICIAN';

  @ApiProperty({ type: String, format: 'date-time' })
  createdAt!: string;
}

export class TechnicianListResponseDto {
  @ApiProperty({ type: () => [TechnicianResponseDto] })
  data!: TechnicianResponseDto[];

  @ApiProperty({ type: () => PageMetaDto })
  meta!: PageMetaDto;
}
