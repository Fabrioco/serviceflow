import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

const trim = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim() : value;
const trimLower = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim().toLowerCase() : value;

export class CreateTechnicianDto {
  @ApiProperty({ example: 'João Silva', minLength: 2, maxLength: 120 })
  @Transform(trim)
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  name!: string;

  @ApiProperty({
    example: 'joao@climatech.com',
    description: 'Único no sistema inteiro. Guardado em minúsculas.',
  })
  @Transform(trimLower)
  @IsEmail()
  @MaxLength(254)
  email!: string;

  @ApiProperty({
    example: 'senha-inicial-123',
    minLength: 8,
    maxLength: 128,
    description:
      'Senha inicial, definida pelo proprietário e repassada ao técnico.',
  })
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  password!: string;
}
