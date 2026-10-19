import type { INestApplication } from '@nestjs/common';
import { NotFoundException } from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';
import { Readable } from 'node:stream';
import request from 'supertest';
import type { App } from 'supertest/types.js';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AppModule } from '../src/app.module.js';
import { configureApp } from '../src/app.setup.js';
import { PrismaService } from '../src/database/prisma.service.js';
import { digestToken } from '../src/identity/identity.security.js';
import { MediaService } from '../src/media/media.service.js';

const csrfToken = 'media-csrf-token';
const csrfDigest = digestToken(csrfToken);
const account = {
  id: 'staff-1', mobile: '+989121111111', displayName: 'Staff', email: null,
  companyName: null, role: 'ADMIN', status: 'ACTIVE', lastLoginAt: null,
  createdAt: new Date('2026-10-18'), updatedAt: new Date('2026-10-18'),
};

describe('media HTTP boundaries (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: { authSession: { findUnique: ReturnType<typeof vi.fn> } };
  let media: {
    list: ReturnType<typeof vi.fn>;
    get: ReturnType<typeof vi.fn>;
    updateDefaultAlt: ReturnType<typeof vi.fn>;
    upload: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
    privateVariant: ReturnType<typeof vi.fn>;
    publicVariant: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    prisma = { authSession: { findUnique: vi.fn(async () => null) } };
    media = {
      list: vi.fn(async () => ({ items: [], page: 1, pageSize: 20, total: 0, totalPages: 0 })),
      get: vi.fn(async () => ({ id: 'media-1', status: 'READY' })),
      updateDefaultAlt: vi.fn(async (_id: string, defaultAlt: string) => ({ id: 'media-1', defaultAlt })),
      upload: vi.fn(async (stream: Readable, defaultAlt: Promise<string>) => {
        // Production processing consumes the stream while Busboy continues to
        // parse the following defaultAlt field. Drain it here to preserve that
        // streaming/backpressure contract in the HTTP boundary test.
        stream.resume();
        return { id: 'media-1', status: 'READY', defaultAlt: await defaultAlt };
      }),
      delete: vi.fn(async () => undefined),
      privateVariant: vi.fn(async () => ({ stream: Readable.from(Buffer.from('private')), etag: 'private-etag' })),
      publicVariant: vi.fn(async (id: string) => {
        if (['draft', 'archived', 'future', 'category-blocked', 'unknown'].includes(id)) {
          throw new NotFoundException();
        }
        return { stream: Readable.from(Buffer.from('public')), etag: 'public-etag' };
      }),
    };
    const moduleFixture: TestingModule = await Test.createTestingModule({ imports: [AppModule] })
      .overrideProvider(PrismaService).useValue(prisma)
      .overrideProvider(MediaService).useValue(media)
      .compile();
    app = moduleFixture.createNestApplication();
    configureApp(app, { frontendOrigin: 'http://localhost:3000' });
    await app.init();
  });

  afterEach(async () => app.close());

  function withRole(test: request.Test, role: string) {
    prisma.authSession.findUnique.mockResolvedValue({
      id: `session-${role}`, expiresAt: new Date(Date.now() + 60_000),
      revokedAt: null, csrfDigest, user: { ...account, role },
    });
    return test.set('cookie', `toranj_session=${role}; toranj_csrf=${csrfToken}`);
  }

  it('enforces anonymous, Customer/Sales and Admin/Operator access without trusting body roles', async () => {
    await request(app.getHttpServer()).get('/api/v1/admin/media').expect(401);
    await withRole(request(app.getHttpServer()).get('/api/v1/admin/media'), 'CUSTOMER').expect(403);
    await withRole(request(app.getHttpServer()).get('/api/v1/admin/media'), 'SALES').expect(403);
    await withRole(request(app.getHttpServer()).get('/api/v1/admin/media'), 'ADMIN').expect(200);
    await withRole(request(app.getHttpServer()).get('/api/v1/admin/media'), 'OPERATOR').expect(200);
    await withRole(
      request(app.getHttpServer()).patch('/api/v1/admin/media/media-1')
        .set('x-csrf-token', csrfToken)
        .send({ defaultAlt: 'تصویر', role: 'ADMIN' }),
      'CUSTOMER',
    ).expect(403);
  });

  it('requires valid CSRF for mutations and returns no-store for private responses', async () => {
    const list = await withRole(request(app.getHttpServer()).get('/api/v1/admin/media'), 'ADMIN').expect(200);
    expect(list.headers['cache-control']).toBe('no-store');
    await withRole(
      request(app.getHttpServer()).patch('/api/v1/admin/media/media-1')
        .send({ defaultAlt: 'تصویر' }),
      'ADMIN',
    ).expect(401);
    await withRole(
      request(app.getHttpServer()).patch('/api/v1/admin/media/media-1')
        .set('x-csrf-token', csrfToken)
        .send({ defaultAlt: 'تصویر' }),
      'OPERATOR',
    ).expect(200);
  });

  it('rejects excess multipart fields without terminating the backend', async () => {
    await withRole(
      request(app.getHttpServer()).post('/api/v1/admin/media')
        .set('x-csrf-token', csrfToken)
        .attach('file', Buffer.from('image'), { filename: 'image.webp', contentType: 'image/webp' })
        .field('defaultAlt', 'تصویر')
        .field('$ACTION_ID_internal', 'unexpected'),
      'ADMIN',
    ).expect(400);

    await withRole(request(app.getHttpServer()).get('/api/v1/admin/media'), 'ADMIN').expect(200);
  });

  it('accepts the exact file and default-alt multipart contract', async () => {
    const response = await withRole(
      request(app.getHttpServer()).post('/api/v1/admin/media')
        .set('x-csrf-token', csrfToken)
        .attach('file', Buffer.from('image'), { filename: 'image.webp', contentType: 'image/webp' })
        .field('defaultAlt', 'تصویر محصول'),
      'ADMIN',
    ).expect(201);

    expect(response.body).toMatchObject({
      id: 'media-1',
      status: 'READY',
      defaultAlt: 'تصویر محصول',
    });
    expect(media.upload).toHaveBeenCalledOnce();
  });

  it.each(['draft', 'archived', 'future', 'category-blocked', 'unknown'])
  ('conceals an ineligible public asset: %s', async (id) => {
    await request(app.getHttpServer()).get(`/api/v1/media/public/${id}/card`).expect(404);
  });

  it('serves eligible shared assets with safe cache/content headers and rejects unknown variants', async () => {
    const first = await request(app.getHttpServer()).get('/api/v1/media/public/shared/card').expect(200);
    const second = await request(app.getHttpServer()).get('/api/v1/media/public/shared/card').expect(200);
    expect(first.headers).toMatchObject({
      'cache-control': 'public, max-age=300',
      'content-type': 'image/webp',
      'x-content-type-options': 'nosniff',
      etag: '"public-etag"',
    });
    expect(second.body).toEqual(first.body);
    await request(app.getHttpServer()).get('/api/v1/media/public/shared/original').expect(400);
  });
});
