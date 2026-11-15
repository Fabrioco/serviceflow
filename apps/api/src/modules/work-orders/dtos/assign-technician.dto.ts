import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class AssignTechnicianDto {
  @ApiProperty({ description: 'Usuário com papel TECHNICIAN na sua empresa.', format: 'uuid' })
  @IsUUID()
  technicianId!: string;
}