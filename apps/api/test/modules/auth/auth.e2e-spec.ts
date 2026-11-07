import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '../../../src/app.module.js';
import request from 'supertest';

describe('Auth POST /api/auth/register (e2e)', () => {
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

  const props = {
    name: 'ana',
    email: `ana+${Date.now()}@teste.com`,
    password: 'teste-123',
    confirmPassword: 'teste-123',
    organizationName: 'Teste Clima',
  };

  it('cria empresa com o dono', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        name: props.name,
        email: props.email,
        password: props.password,
        confirmPassword: props.confirmPassword,
        organizationName: props.organizationName,
      })
      .expect(201);

    expect(res.body.user.role).toBe('OWNER');
    expect(res.body.user).not.toHaveProperty('passwordHash');
  });

  it('erro ao criar usuário já cadastrado', async () => {
    await request(app.getHttpServer()).post('/auth/register').send({
      name: props.name,
      email: props.email,
      password: props.password,
      confirmPassword: props.confirmPassword,
      organizationName: props.organizationName,
    });

    const res = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        name: props.name,
        email: props.email,
        password: props.password,
        confirmPassword: props.confirmPassword,
        organizationName: props.organizationName,
      })
      .expect(409);

    expect(res.body).toMatchObject({
      error: 'Conflict',
      message: 'Email already in use',
      statusCode: 409,
    });
  });
});
