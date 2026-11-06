import { Controller, Get } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';

@Controller('health')
export class HealthController {
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
}
