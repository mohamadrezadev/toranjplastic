import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { configureApp } from '../src/app.setup.js';
import { DatabaseModule } from '../src/database/database.module.js';
import { PrismaService } from '../src/database/prisma.service.js';
import { digestToken } from '../src/identity/identity.security.js';
import { IdentityModule } from '../src/identity/identity.module.js';
import { InquiriesModule } from '../src/inquiries/inquiries.module.js';

const user = { id: 'u1', mobile: '+989123456789', displayName: 'Test', email: null, companyName: null, role: 'CUSTOMER', status: 'ACTIVE', lastLoginAt: null, createdAt: new Date(), updatedAt: new Date() };
const history = { id: 'h1', fromStatus: null, toStatus: 'SUBMITTED', createdAt: new Date() };
const inquiry = { id: 'i1', type: 'PRODUCT', status: 'SUBMITTED', ownerId: 'u1', catalogItemName: 'ظرف نمونه', description: null, approximateQuantity: '100', quantityUnit: null, deliveryCity: null, requestedTiming: null, partDescription: null, moldStatus: null, materialName: null, color: null, materialRequestKind: null, polymerName: null, grade: null, brand: null, materialCondition: null, application: null, specifications: null, createdAt: new Date(), updatedAt: new Date(), statusHistory: [history] };
const prisma = {
  authSession: { findUnique: vi.fn() },
  product: { findFirst: vi.fn() }, injectionService: { findFirst: vi.fn() }, material: { findFirst: vi.fn() },
  inquiry: { create: vi.fn(), findUniqueOrThrow: vi.fn(), count: vi.fn(), findMany: vi.fn(), findFirst: vi.fn() },
  inquiryStatusHistory: { create: vi.fn() },
  $transaction: vi.fn(),
};

describe('customer inquiries API contract', () => {
  let app: INestApplication;
  beforeAll(async () => {
    const module = await Test.createTestingModule({ imports: [DatabaseModule, IdentityModule, InquiriesModule] }).overrideProvider(PrismaService).useValue(prisma).compile();
    app = module.createNestApplication();
    configureApp(app, { port: 3001, frontendOrigin: 'http://localhost:3000', auth: { sessionDays: 7, loginLimit: 10, loginWindowSeconds: 900, cookieSecure: false } });
    await app.init();
  });
  beforeEach(() => {
    vi.clearAllMocks();
    prisma.authSession.findUnique.mockResolvedValue({ id: 's1', expiresAt: new Date(Date.now() + 60_000), revokedAt: null, csrfDigest: digestToken('csrf'), user });
    prisma.product.findFirst.mockResolvedValue({ id: 'p1', name: 'ظرف نمونه' });
    prisma.inquiry.create.mockResolvedValue({ id: 'i1' });
    prisma.inquiryStatusHistory.create.mockResolvedValue(history);
    prisma.inquiry.findUniqueOrThrow.mockResolvedValue(inquiry);
    prisma.inquiry.count.mockResolvedValue(1);
    prisma.inquiry.findMany.mockResolvedValue([inquiry]);
    prisma.inquiry.findFirst.mockResolvedValue(inquiry);
    prisma.$transaction.mockImplementation((work: (client: typeof prisma) => unknown) => work(prisma));
  });
  afterAll(() => app.close());

  const authenticated = (method: 'get' | 'post', path: string) => request(app.getHttpServer())[method](path).set('cookie', 'toranj_session=session; toranj_csrf=csrf');

  it('creates an inquiry and history with CSRF proof and no-store response', async () => {
    const response = await authenticated('post', '/api/v1/inquiries/product').set('x-csrf-token', 'csrf').send({ productId: 'p1', approximateQuantity: '100' }).expect(201);
    expect(response.headers['cache-control']).toBe('no-store');
    expect(response.body).not.toHaveProperty('ownerId');
    expect(response.body).not.toHaveProperty('internalNote');
    expect(prisma.inquiryStatusHistory.create).toHaveBeenCalledWith({ data: expect.objectContaining({ toStatus: 'SUBMITTED', actorId: 'u1' }) });
  });

  it('rejects missing CSRF and forged ownership fields without persistence', async () => {
    await authenticated('post', '/api/v1/inquiries/product').send({ productId: 'p1' }).expect(401);
    await authenticated('post', '/api/v1/inquiries/product').set('x-csrf-token', 'csrf').send({ productId: 'p1', ownerId: 'other' }).expect(400);
    expect(prisma.inquiry.create).not.toHaveBeenCalled();
  });

  it('does not disclose a non-owned inquiry', async () => {
    prisma.inquiry.findFirst.mockResolvedValue(null);
    await authenticated('get', '/api/v1/inquiries/i-other').expect(404);
    expect(prisma.inquiry.findFirst).toHaveBeenCalledWith(expect.objectContaining({ where: { id: 'i-other', ownerId: 'u1' } }));
  });
});
