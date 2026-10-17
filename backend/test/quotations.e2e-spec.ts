import type { INestApplication } from '@nestjs/common';
import { NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';
import { configureApp } from '../src/app.setup.js';
import { DatabaseModule } from '../src/database/database.module.js';
import { PrismaService } from '../src/database/prisma.service.js';
import { digestToken } from '../src/identity/identity.security.js';
import { IdentityModule } from '../src/identity/identity.module.js';
import { QuotationPdfService } from '../src/quotations/quotation-pdf.service.js';
import type { QuotationRow } from '../src/quotations/quotation.mapper.js';
import { QuotationsModule } from '../src/quotations/quotations.module.js';
import { QuotationsService } from '../src/quotations/quotations.service.js';

const account = (role: 'ADMIN' | 'SALES' | 'OPERATOR' | 'CUSTOMER') => ({
  id: `${role.toLowerCase()}-1`,
  mobile: '+989123456789',
  displayName: role,
  email: null,
  companyName: null,
  role,
  status: 'ACTIVE',
  lastLoginAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
});
const now = new Date('2026-10-17T00:00:00.000Z');
const row: QuotationRow = {
  id: 'q1',
  inquiryId: 'i1',
  quotationNumber: 'TP-I1',
  version: 1,
  editVersion: 1,
  status: 'SENT',
  subtotalRials: 1000n,
  discountRials: 0n,
  taxRials: 0n,
  additionalCostRials: 0n,
  totalRials: 1000n,
  validUntil: new Date('2026-11-17T00:00:00.000Z'),
  deliveryTerms: 'تحویل',
  paymentTerms: 'نقدی',
  notes: null,
  sentAt: now,
  createdAt: now,
  updatedAt: now,
  items: [
    {
      id: 'qi1',
      position: 1,
      description: 'قطعه',
      quantity: '1',
      unit: 'عدد',
      unitPriceRials: 1000n,
      lineTotalRials: 1000n,
    },
  ],
};
const dto = {
  ...row,
  editVersion: 1,
  subtotalRials: '1000',
  discountRials: '0',
  taxRials: '0',
  additionalCostRials: '0',
  totalRials: '1000',
  validUntil: row.validUntil.toISOString(),
  sentAt: now.toISOString(),
  createdAt: now.toISOString(),
  updatedAt: now.toISOString(),
  items: [{ ...row.items[0], unitPriceRials: '1000', lineTotalRials: '1000' }],
};

describe('quotation API authorization and privacy', () => {
  let app: INestApplication;
  let sessionAccount = account('ADMIN');
  const prisma = { authSession: { findUnique: vi.fn() } };
  const quotations = {
    adminList: vi.fn(),
    adminGet: vi.fn(),
    createDraft: vi.fn(),
    updateDraft: vi.fn(),
    revise: vi.fn(),
    send: vi.fn(),
    customerList: vi.fn(),
    customerGet: vi.fn(),
    pdfRowForStaff: vi.fn(),
    pdfRowForCustomer: vi.fn(),
  };
  const pdf = { render: vi.fn() };

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [DatabaseModule, IdentityModule, QuotationsModule],
    })
      .overrideProvider(PrismaService)
      .useValue(prisma)
      .overrideProvider(QuotationsService)
      .useValue(quotations)
      .overrideProvider(QuotationPdfService)
      .useValue(pdf)
      .compile();
    app = module.createNestApplication();
    configureApp(app, {
      port: 3001,
      frontendOrigin: 'http://localhost:3000',
      auth: {
        sessionDays: 7,
        loginLimit: 10,
        loginWindowSeconds: 900,
        cookieSecure: false,
      },
    });
    await app.init();
  });

  beforeEach(() => {
    vi.clearAllMocks();
    sessionAccount = account('ADMIN');
    prisma.authSession.findUnique.mockImplementation(async () => ({
      id: 's1',
      expiresAt: new Date(Date.now() + 60_000),
      revokedAt: null,
      csrfDigest: digestToken('csrf'),
      user: sessionAccount,
    }));
    quotations.adminList.mockResolvedValue([dto]);
    quotations.customerList.mockResolvedValue([
      { ...dto, editVersion: undefined },
    ]);
    quotations.createDraft.mockResolvedValue({ ...dto, status: 'DRAFT' });
    quotations.pdfRowForStaff.mockResolvedValue(row);
    quotations.pdfRowForCustomer.mockResolvedValue(row);
    pdf.render.mockResolvedValue(Buffer.from('%PDF-private'));
  });
  afterAll(() => app.close());

  const authenticated = (method: 'get' | 'post' | 'put', path: string) =>
    request(app.getHttpServer())
      [method](path)
      .set('cookie', 'toranj_session=session; toranj_csrf=csrf');

  it('returns 401 anonymously and no-store for authorized staff', async () => {
    await request(app.getHttpServer())
      .get('/api/v1/admin/inquiries/i1/quotations')
      .expect(401);
    const response = await authenticated(
      'get',
      '/api/v1/admin/inquiries/i1/quotations',
    ).expect(200);
    expect(response.headers['cache-control']).toBe('no-store');
  });

  it('allows Admin and Sales while denying Operator and Customer quotation management', async () => {
    sessionAccount = account('SALES');
    await authenticated('get', '/api/v1/admin/inquiries/i1/quotations').expect(
      200,
    );
    sessionAccount = account('OPERATOR');
    await authenticated('get', '/api/v1/admin/inquiries/i1/quotations').expect(
      403,
    );
    sessionAccount = account('CUSTOMER');
    await authenticated('get', '/api/v1/admin/inquiries/i1/quotations').expect(
      403,
    );
  });

  it('requires CSRF and rejects forged or extra commercial fields', async () => {
    const payload = {
      items: [
        {
          description: 'قطعه',
          quantity: '1',
          unit: 'عدد',
          unitPriceRials: '1000',
          lineTotalRials: '1000',
        },
      ],
      subtotalRials: '1000',
      discountRials: '0',
      taxRials: '0',
      additionalCostRials: '0',
      totalRials: '1000',
      validUntil: '2026-11-17T00:00:00.000Z',
      deliveryTerms: 'تحویل',
      paymentTerms: 'نقدی',
    };
    await authenticated('post', '/api/v1/admin/inquiries/i1/quotations')
      .send(payload)
      .expect(401);
    await authenticated('post', '/api/v1/admin/inquiries/i1/quotations')
      .set('x-csrf-token', 'csrf')
      .send({ ...payload, createdById: 'forged' })
      .expect(400);
    await authenticated('post', '/api/v1/admin/inquiries/i1/quotations')
      .set('x-csrf-token', 'csrf')
      .send(payload)
      .expect(201);
    expect(quotations.createDraft).toHaveBeenCalledWith(
      'i1',
      expect.not.objectContaining({ createdById: expect.anything() }),
      'admin-1',
    );
  });

  it('scopes customer reads by authenticated owner id and never exposes editVersion', async () => {
    sessionAccount = account('CUSTOMER');
    const response = await authenticated(
      'get',
      '/api/v1/inquiries/i1/quotations',
    ).expect(200);
    expect(quotations.customerList).toHaveBeenCalledWith('customer-1', 'i1');
    expect(response.body[0]).not.toHaveProperty('editVersion');
  });

  it('streams only authenticated sent PDFs with private no-store headers', async () => {
    const staff = await authenticated(
      'get',
      '/api/v1/admin/inquiries/i1/quotations/q1/pdf',
    ).expect(200);
    expect(staff.headers['content-type']).toContain('application/pdf');
    expect(staff.headers['cache-control']).toBe('private, no-store');
    expect(staff.body.subarray(0, 5).toString()).toBe('%PDF-');
    sessionAccount = account('CUSTOMER');
    await authenticated('get', '/api/v1/inquiries/i1/quotations/q1/pdf').expect(
      200,
    );
    expect(quotations.pdfRowForCustomer).toHaveBeenCalledWith(
      'customer-1',
      'i1',
      'q1',
    );
    quotations.pdfRowForCustomer.mockRejectedValueOnce(
      new NotFoundException('پیشنهاد قیمت پیدا نشد.'),
    );
    await authenticated(
      'get',
      '/api/v1/inquiries/i1/quotations/draft/pdf',
    ).expect(404);
  });
});
