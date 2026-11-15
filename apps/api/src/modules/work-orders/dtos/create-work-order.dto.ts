import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsISO8601, IsNumber, IsOptional, IsString, IsUUID, Max, MaxLength, Min, MinLength,
} from 'class-validator';

const trim = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim() : value;

export class CreateWorkOrderDto {
  @ApiProperty({ description: 'Cliente da sua empresa.', format: 'uuid' })
  @IsUUID()
  customerId!: string;

  @ApiProperty({ example: 'Manutenção de ar-condicionado', minLength: 2, maxLength: 120 })
  @Transform(trim)
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  serviceName!: string;

  @ApiProperty({ example: 'O ar-condicionado do quarto não está gelando e pinga água.', maxLength: 2000 })
  @Transform(trim)
  @IsString()
  @MinLength(3)
  @MaxLength(2000)
  description!: string;

  @ApiProperty({ example: 180, description: 'Valor em reais, com até 2 casas decimais.', minimum: 0, maximum: 999999.99 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(999999.99)
  price!: number;

  @ApiPropertyOptional({
    description: 'Técnico responsável. Precisa ter o papel TECHNICIAN na sua empresa.',
    format: 'uuid',
  })
  @IsOptional()
  @IsUUID()
  technicianId?: string;

  @ApiPropertyOptional({
    description: 'Data e hora do atendimento (ISO 8601). Se informada, a OS nasce como SCHEDULED. Não pode estar no passado.',
    example: '2026-11-20T14:00:00-03:00',
  })
  @IsOptional()
  @IsISO8601({ strict: true })
  scheduledAt?: string;
}