import {
  Controller,
  Get,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from './guards/jwt-auth.guard.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { CurrentUser } from './decorators/current-user.decorator.js';
import type { TokenPayload } from './services/token.service.js';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('me')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class MeController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async me(@CurrentUser() current: TokenPayload) {
    const user = await this.prisma.db.User.where({ id: current.sub }).first();
    if (!user) throw new UnauthorizedException();
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      organizationId: user.organizationId,
    };
  }
}
