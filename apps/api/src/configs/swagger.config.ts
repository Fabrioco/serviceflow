import { DocumentBuilder } from '@nestjs/swagger';

export const swaggerConfig = new DocumentBuilder()
  .setTitle('ServiceFlow API')
  .setDescription('ServiceFlow API documentation')
  .setVersion('1.0.0')
  .addBearerAuth()
  .build();
