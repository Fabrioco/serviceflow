import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

// tira os espaços das pontas
const trim = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim() : value;

// nos campos opcionais, texto vazio vira null
const trimOrNull = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim() || null : value;

export class CreateCustomerDto {
  @ApiProperty({ example: 'Ana Souza' })
  @Transform(trim)
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  name!: string;

  @ApiProperty({ example: '+55 11 91234-5678' })
  @Transform(trim)
  @IsString()
  @Matches(/^[0-9()+\-\s]{8,20}$/, {
    message:
      'phone must contain 8 to 20 characters: digits, spaces, +, - and parentheses',
  })
  phone!: string;

  @ApiPropertyOptional({ example: 'ana@email.com', nullable: true })
  @Transform(trimOrNull)
  @IsOptional()
  @IsEmail()
  @MaxLength(254)
  email?: string | null;

  @ApiPropertyOptional({
    example: 'Rua das Flores, 120 - Sumaré',
    nullable: true,
  })
  @Transform(trimOrNull)
  @IsOptional()
  @IsString()
  @MaxLength(255)
  address?: string | null;

  @ApiPropertyOptional({
    example: 'Prefere atendimento à tarde',
    nullable: true,
  })
  @Transform(trimOrNull)
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string | null;
}
