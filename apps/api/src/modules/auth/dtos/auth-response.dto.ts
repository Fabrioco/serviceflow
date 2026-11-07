import { ApiProperty } from '@nestjs/swagger';

export class AuthResponseDto {
  @ApiProperty({
    example: 'access-token-example',
  })
  accessToken: string;

  @ApiProperty({
    type: () => UserResponseDto,
  })
  user: UserResponseDto;
}

export class UserResponseDto {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    example: 'John Doe',
  })
  name: string;

  @ApiProperty({
    example: 'john.doe@example.com',
  })
  email: string;

  @ApiProperty({
    example: 'TECHNICIAN',
  })
  role: string;

  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174001',
  })
  organizationId: string;
}
