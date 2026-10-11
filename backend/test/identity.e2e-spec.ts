import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { configureApp } from '../src/app.setup.js';
import { DatabaseModule } from '../src/database/database.module.js';
import { PrismaService } from '../src/database/prisma.service.js';
import { IdentityModule } from '../src/identity/identity.module.js';

const user = { id: 'u1', mobile: '+989123456789', displayName: 'Test', email: null, companyName: null, role: 'CUSTOMER', status: 'ACTIVE', lastLoginAt: null, createdAt: new Date('2026-10-11'), updatedAt: new Date('2026-10-11') };
const prisma = {
  user: { create: vi.fn(), findUnique: vi.fn(), update: vi.fn(), count: vi.fn() },
  authSession: { create: vi.fn(), update: vi.fn(), updateMany: vi.fn(), findUnique: vi.fn() },
  securityAuditEvent: { create: vi.fn() },
  $transaction: vi.fn(),
};

describe('identity API contract', () => {
  let app: INestApplication;
  beforeAll(async () => {
    prisma.$transaction.mockImplementation(async (work: unknown) => typeof work === 'function' ? (work as (value: typeof prisma) => unknown)(prisma) : Promise.all(work as Promise<unknown>[]));
    const module = await Test.createTestingModule({ imports: [DatabaseModule, IdentityModule] }).overrideProvider(PrismaService).useValue(prisma).compile();
    app = module.createNestApplication();
    configureApp(app, { port: 3001, frontendOrigin: 'http://localhost:3000', auth: { sessionDays: 7, loginLimit: 10, loginWindowSeconds: 900, cookieSecure: false } });
    await app.init();
  });
  beforeEach(() => {
    vi.clearAllMocks();
    prisma.user.create.mockResolvedValue(user);
    prisma.user.findUnique.mockResolvedValue(null);
  });
  afterAll(() => app.close());

  it('rejects role injection before account creation', async () => {
    await request(app.getHttpServer()).post('/api/v1/auth/register').set('origin', 'http://localhost:3000').send({ mobile: '09123456789', displayName: 'Test', password: 'strong-password', role: 'ADMIN' }).expect(400);
    expect(prisma.user.create).not.toHaveBeenCalled();
  });

  it('returns an explicit account DTO without credentials', async () => {
    const response = await request(app.getHttpServer()).post('/api/v1/auth/register').set('origin', 'http://localhost:3000').send({ mobile: '09123456789', displayName: 'Test', password: 'strong-password' }).expect(201);
    expect(response.headers['cache-control']).toBe('no-store');
    expect(response.body).not.toHaveProperty('password');
    expect(response.body).not.toHaveProperty('passwordHash');
  });

  it('uses generic 401 and rejects forged admin headers', async () => {
    await request(app.getHttpServer()).post('/api/v1/auth/login/password').set('origin', 'http://localhost:3000').send({ mobile: '09123456789', password: 'wrong-password' }).expect(401);
    await request(app.getHttpServer()).get('/api/v1/admin/access').set('x-role', 'ADMIN').expect(401);
  });

  it('returns 403 for an authenticated customer', async () => {
    prisma.authSession.findUnique.mockResolvedValue({ id: 's1', expiresAt: new Date(Date.now() + 60_000), revokedAt: null, csrfDigest: 'c1', user });
    await request(app.getHttpServer()).get('/api/v1/admin/access').set('cookie', 'toranj_session=customer-token').expect(403);
  });
});
