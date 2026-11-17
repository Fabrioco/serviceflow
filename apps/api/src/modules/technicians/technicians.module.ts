import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { HashService } from '../auth/services/hash.service.js';
import { TechniciansController } from './technicians.controller.js';
import { TechniciansService } from './technicians.service.js';

@Module({
  imports: [AuthModule],
  controllers: [TechniciansController],
  providers: [TechniciansService, HashService],
})
export class TechniciansModule {}
