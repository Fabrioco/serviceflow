import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { CreateUserDto } from './dtos/create-user.dto.js';
import { LoginUserDto } from './dtos/login-user.dto.js';

@Controller('auth')
export class AuthController {
  constructor(private readonly service: AuthService) {}

  @Post('register')
  register(@Body() dto: CreateUserDto) {
    return this.service.register(dto);
  }

  @Post('login')
  login(@Body() dto: LoginUserDto) {
    return this.service.login(dto)
  }
}
