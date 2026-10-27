import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types.js';
import { AppModule } from './../src/app.module.js';
import { configureApp } from './../src/app.setup.js';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    configureApp(app, {
      port: 3001,
      frontendOrigin: 'http://localhost:3000',
      auth: { sessionDays: 7, loginLimit: 10, loginWindowSeconds: 900, cookieSecure: false },
    });
    await app.init();
  });

  it('/api/v1/health (GET)', () => {
    return request(app.getHttpServer())
      .get('/api/v1/health')
      .expect(200)
      .expect(({ body }: { body: Record<string, unknown> }) => {
        expect(body).toMatchObject({
          status: 'ok',
          service: 'toranj-backend',
          version: expect.any(String),
          timestamp: expect.any(String),
        });
        expect(new Date(String(body.timestamp)).toISOString()).toBe(
          body.timestamp,
        );
      });
  });

  it('/api/v1/ready (GET)', () => {
    return request(app.getHttpServer())
      .get('/api/v1/ready')
      .expect(({ status, body }: { status: number; body: Record<string, unknown> }) => {
        expect([200, 503]).toContain(status);
        expect(body).toMatchObject({
          service: 'toranj-backend',
          version: expect.any(String),
          timestamp: expect.any(String),
          components: {
            database: expect.stringMatching(/^(up|down)$/),
            mediaStorage: expect.stringMatching(/^(up|down)$/),
          },
        });
        expect(JSON.stringify(body)).not.toMatch(/path|secret|password|credential|token/i);
      });
  });

  afterEach(async () => {
    await app.close();
  });
});
