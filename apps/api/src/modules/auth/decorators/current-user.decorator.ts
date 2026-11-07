import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import {
  AuthenticatedRequest,
  TokenPayload,
} from '../services/token.service.js';

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): TokenPayload =>
    ctx.switchToHttp().getRequest<AuthenticatedRequest>().user,
);
