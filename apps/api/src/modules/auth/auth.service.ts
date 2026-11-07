import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateUserDto } from './dtos/create-user.dto.js';
import { AuthResponseDto } from './dtos/auth-response.dto.js';
import { db } from '../../prisma/db.js';
import { HashService } from './services/hash.service.js';
import { TokenService } from './services/token.service.js';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly hash: HashService,
    private readonly token: TokenService,
  ) {}

  async register(dto: CreateUserDto): Promise<AuthResponseDto> {
    const { name, password, confirmPassword, organizationName } = dto;

    const email = dto.email.trim().toLowerCase();

    if (password !== confirmPassword) {
      throw new BadRequestException('Passwords do not match');
    }

    const existingUser = await this.prisma.db.User.where({
      email,
    }).first();

    if (existingUser) {
      throw new ConflictException('Email already in use');
    }

    const passwordHash = await this.hash.hashPassword(password);

    const { organization, user } = await db.transaction(async (tx) => {
      const organization = await tx.orm.public.Organization.create({
        name: organizationName,
      });
      const user = await tx.orm.public.User.create({
        name,
        email,
        passwordHash,
        role: 'OWNER',
        organizationId: organization.id,
      });
      return { organization, user };
    });

    const payload = {
      sub: user.id,
      name: user.name,
      email: user.email,
    };

    const accessToken = await this.token.generateToken(payload);

    return {
      accessToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        organizationId: organization.id,
      },
    };
  }
}
