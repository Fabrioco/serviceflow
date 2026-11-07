import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';

export interface TokenPayload {
  sub: string;
  organizationId: string;
  role: string;
}

export interface AuthenticatedRequest extends Request {
  user: TokenPayload;
}

@Injectable()
export class TokenService {
  constructor(private readonly jwt: JwtService) {}
  async generateToken(payload: TokenPayload): Promise<string> {
    return await this.jwt.signAsync({
      sub: payload.sub,
      organizationId: payload.organizationId,
      role: payload.role,
    });
  }
}
