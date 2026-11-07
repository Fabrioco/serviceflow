import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service.js';
import { HashService } from './services/hash.service.js';
import { TokenService } from './services/token.service.js';
import { AuthController } from './auth.controller.js';
import { MeController } from './me.controller.js';

@Module({
  imports: [
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.getOrThrow<string>('JWT_SECRET'),
        signOptions: { expiresIn: '1h' },
      }),
    }),
  ],
  controllers: [AuthController, MeController],
  providers: [AuthService, HashService, TokenService],
  exports: [JwtModule],
})
export class AuthModule {}
