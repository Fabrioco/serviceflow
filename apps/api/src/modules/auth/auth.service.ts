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
import { LoginUserDto } from './dtos/login-user.dto.js';
import { throwDeprecation } from 'process';

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

    return await this.BuildAuthResponse(user);
  }

  async login(dto: LoginUserDto): Promise<AuthResponseDto> {
    const { password } = dto;
    const email = dto.email.trim().toLowerCase();

    const user = await this.prisma.db.User.where({ email }).first();

    const isValid = user
      ? await this.hash.comparePassword(dto.password, user.passwordHash)
      : false;

    if (!isValid || !user) {
      throw new UnauthorizedException('Credentials incorrect');
    }

    return await this.BuildAuthResponse(user);
  }

  private async BuildAuthResponse(user: {
    id: string;
    name: string;
    email: string;
    role: string;
    organizationId: string;
  }) {
    const accessToken = await this.token.generateToken({
      sub: user.id,
      organizationId: user.organizationId,
      role: user.role,
    });

    return {
      accessToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        organizationId: user.organizationId,
      },
    };
  }
}
