import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '../../../src/app.module.js';
import request from 'supertest';

describe('Auth (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleRef.createNestApplication();

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /api/auth/register cria empresa com o dono', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        name: 'Ana',
        email: `ana+${Date.now()}@teste.com`,
        password: 'senha-forte-123',
        confirmPassword: 'senha-forte-123',
        organizationName: 'ClimaTech',
      })
      .expect(201);

    expect(res.body.user.role).toBe('OWNER');
    expect(res.body.user).not.toHaveProperty('passwordHash');
  });
});
