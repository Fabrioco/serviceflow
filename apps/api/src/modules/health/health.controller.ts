import { Controller, Get } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';
import { PrismaService } from '../prisma/prisma.service.js';

@Controller('health')
export class HealthController {
  constructor(private readonly db: PrismaService) {}
  @Get()
  @ApiResponse({
    status: 200,
    description: 'Health check endpoint',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string' },
      },
    },
  })
  checkHealth(): { status: string } {
    return { status: 'ok' };
  }

  @Get('db')
  @ApiResponse({
    status: 200,
    description: 'Database health check endpoint',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string' },
        db: { type: 'string' },
      },
    },
  })
  async checkDbHealth() {
    await this.db.db.Organization.first();
    return { status: 'ok', db: 'up' };
  }
}
