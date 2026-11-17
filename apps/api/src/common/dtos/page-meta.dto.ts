import { ApiProperty } from '@nestjs/swagger';

export class PageMetaDto {
  @ApiProperty({ example: 25 }) total!: number;
  @ApiProperty({ example: 1 }) page!: number;
  @ApiProperty({ example: 10 }) limit!: number;
  @ApiProperty({ example: 3 }) totalPages!: number;
}