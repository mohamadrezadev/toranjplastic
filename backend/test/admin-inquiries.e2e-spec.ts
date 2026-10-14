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
import { INQUIRY_REPOSITORY, type InquiryRepository } from '../src/inquiries/inquiry.repository.js';
import type { AdminInquiry } from '../src/inquiries/inquiry.types.js';

const account = (role: 'ADMIN' | 'CUSTOMER') => ({ id: role === 'ADMIN' ? 'admin-1' : 'customer-1', mobile: '+989123456789', displayName: role === 'ADMIN' ? 'مدیر' : 'مشتری', email: null, companyName: null, role, status: 'ACTIVE', lastLoginAt: null, createdAt: new Date(), updatedAt: new Date() });
const detail: AdminInquiry = {
  id: 'i1', type: 'PRODUCT', status: 'SUBMITTED', version: 0, catalogItemName: 'محصول نمونه',
  description: null, approximateQuantity: null, quantityUnit: null, deliveryCity: null,
  requestedTiming: null, partDescription: null, moldStatus: null, materialName: null,
  color: null, materialRequestKind: null, polymerName: null, grade: null, brand: null,
  materialCondition: null, application: null, specifications: null,
  createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
  ownerSummary: { id: 'customer-1', displayName: 'مشتری', mobile: '+989123456789', companyName: null },
  assigneeSummary: null, statusHistory: [], assignmentHistory: [], internalNotes: [], allowedTransitions: [],
};

describe('admin inquiry API contract', () => {
  let app: INestApplication;
  let sessionAccount = account('ADMIN');
  const repository: InquiryRepository = {
    findPublishedProduct: vi.fn(), findPublishedService: vi.fn(), findPublishedMaterial: vi.fn(), create: vi.fn(), list: vi.fn(), getOwned: vi.fn(),
    adminList: vi.fn(), adminSummary: vi.fn(), adminAssignees: vi.fn(), getAdmin: vi.fn(), adminTransitionStatus: vi.fn(), adminAssign: vi.fn(), adminAddNote: vi.fn(),
  };
  const prisma = { authSession: { findUnique: vi.fn() } };

  beforeAll(async () => {
    const module = await Test.createTestingModule({ imports: [DatabaseModule, IdentityModule, InquiriesModule] })
      .overrideProvider(PrismaService).useValue(prisma)
      .overrideProvider(INQUIRY_REPOSITORY).useValue(repository)
      .compile();
    app = module.createNestApplication();
    configureApp(app, { port: 3001, frontendOrigin: 'http://localhost:3000', auth: { sessionDays: 7, loginLimit: 10, loginWindowSeconds: 900, cookieSecure: false } });
    await app.init();
  });

  beforeEach(() => {
    vi.clearAllMocks();
    sessionAccount = account('ADMIN');
    prisma.authSession.findUnique.mockImplementation(async () => ({ id: 's1', expiresAt: new Date(Date.now() + 60_000), revokedAt: null, csrfDigest: digestToken('csrf'), user: sessionAccount }));
    vi.mocked(repository.adminList).mockResolvedValue({ items: [], page: 1, pageSize: 20, total: 0, pageCount: 0 });
    vi.mocked(repository.adminSummary).mockResolvedValue({ total: 1, unassigned: 1, submitted: 1, underReview: 0 });
    vi.mocked(repository.adminAssignees).mockResolvedValue([{ id: 'admin-1', displayName: 'مدیر', mobile: '+989123456789' }]);
    vi.mocked(repository.getAdmin).mockResolvedValue(detail);
  });

  afterAll(() => app.close());

  const admin = (method: 'get' | 'post' | 'patch', path: string) => request(app.getHttpServer())[method](path).set('cookie', 'toranj_session=session; toranj_csrf=csrf');

  it('protects list and returns no-store real summary for an Admin', async () => {
    const list = await admin('get', '/api/v1/admin/inquiries').expect(200);
    expect(list.headers['cache-control']).toBe('no-store');
    expect(list.body).toMatchObject({ page: 1, total: 0 });
    await admin('get', '/api/v1/admin/inquiries/summary').expect(200, { total: 1, unassigned: 1, submitted: 1, underReview: 0 });
  });

  it('rejects Customer access and mutation without CSRF', async () => {
    sessionAccount = account('CUSTOMER');
    await admin('get', '/api/v1/admin/inquiries').expect(403);
    sessionAccount = account('ADMIN');
    await admin('post', '/api/v1/admin/inquiries/i1/status').send({ toStatus: 'UNDER_REVIEW', expectedVersion: 0 }).expect(401);
  });

  it('returns stable version conflict and rejects forged note metadata', async () => {
    vi.mocked(repository.adminTransitionStatus).mockResolvedValue({ kind: 'version_conflict' });
    const conflict = await admin('post', '/api/v1/admin/inquiries/i1/status').set('x-csrf-token', 'csrf').send({ toStatus: 'UNDER_REVIEW', expectedVersion: 0 }).expect(409);
    expect(conflict.body).toMatchObject({ code: 'INQUIRY_VERSION_CONFLICT' });
    await admin('post', '/api/v1/admin/inquiries/i1/notes').set('x-csrf-token', 'csrf').send({ text: 'یادداشت', authorId: 'forged' }).expect(400);
  });
});
