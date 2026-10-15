import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { configureApp } from '../src/app.setup.js';
import { DatabaseModule } from '../src/database/database.module.js';
import { PrismaService } from '../src/database/prisma.service.js';
import { digestToken } from '../src/identity/identity.security.js';
import { IdentityModule } from '../src/identity/identity.module.js';

const now = new Date('2026-10-15T00:00:00Z');
const staff = { id: 'staff-1', mobile: '+989121111111', displayName: 'Sales', email: null, companyName: null, role: 'SALES', status: 'ACTIVE', version: 0, lastLoginAt: null, createdAt: now, updatedAt: now };
const account = (role: 'ADMIN' | 'SALES') => ({ ...staff, id: `${role.toLowerCase()}-actor`, role, displayName: role });

describe('staff API contract', () => {
  let app: INestApplication;
  let actor = account('ADMIN');
  const prisma = {
    user: { count: vi.fn(), findMany: vi.fn(), findFirst: vi.fn(), findUnique: vi.fn(), findUniqueOrThrow: vi.fn(), create: vi.fn(), updateMany: vi.fn() },
    authSession: { findUnique: vi.fn(), updateMany: vi.fn() }, securityAuditEvent: { create: vi.fn() }, $executeRawUnsafe: vi.fn(), $transaction: vi.fn(),
  };
  beforeAll(async () => {
    prisma.$transaction.mockImplementation(async (work: (tx: typeof prisma) => unknown) => work(prisma));
    const module = await Test.createTestingModule({ imports: [DatabaseModule, IdentityModule] }).overrideProvider(PrismaService).useValue(prisma).compile();
    app = module.createNestApplication(); configureApp(app, { port: 3001, frontendOrigin: 'http://localhost:3000', auth: { sessionDays: 7, loginLimit: 10, loginWindowSeconds: 900, cookieSecure: false } }); await app.init();
  });
  beforeEach(() => {
    vi.clearAllMocks(); actor = account('ADMIN');
    prisma.authSession.findUnique.mockImplementation(async () => ({ id: 'session-1', expiresAt: new Date(Date.now() + 60_000), revokedAt: null, csrfDigest: digestToken('csrf'), user: actor }));
    prisma.user.count.mockResolvedValue(1); prisma.user.findMany.mockResolvedValue([staff]); prisma.user.findFirst.mockResolvedValue(staff);
  });
  afterAll(() => app.close());

  const call = () => request(app.getHttpServer()).get('/api/v1/admin/staff').set('cookie', 'toranj_session=session; toranj_csrf=csrf');
  it('returns a bounded no-store directory to an Administrator', async () => {
    const response = await call().expect(200);
    expect(response.headers['cache-control']).toBe('no-store');
    expect(response.body.items[0]).not.toHaveProperty('password');
    expect(prisma.user.findMany).toHaveBeenCalledWith(expect.objectContaining({ take: 20, skip: 0 }));
  });
  it('denies Sales without disclosing directory data', async () => {
    actor = account('SALES'); const response = await call().expect(403); expect(response.body).not.toHaveProperty('items'); expect(prisma.user.findMany).not.toHaveBeenCalled();
  });
  it('rejects Customer and unknown roles plus extra fields before creation', async () => {
    await request(app.getHttpServer()).post('/api/v1/admin/staff').set('cookie', 'toranj_session=session; toranj_csrf=csrf').set('origin', 'http://localhost:3000').set('x-csrf-token', 'csrf').send({ mobile: '09121111111', displayName: 'User', password: 'strong-password', role: 'CUSTOMER', extra: true }).expect(400);
    expect(prisma.user.create).not.toHaveBeenCalled();
  });
});
