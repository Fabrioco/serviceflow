import { ApiProperty } from '@nestjs/swagger';

export class ErrorResponseDto {
  @ApiProperty({ example: 404 })
  statusCode!: number;

  @ApiProperty({ example: 'Cliente não encontrado.', description: 'Texto ou lista de textos (erros de validação).' })
  message!: string | string[];

  @ApiProperty({ example: 'Not Found' })
  error!: string;
}