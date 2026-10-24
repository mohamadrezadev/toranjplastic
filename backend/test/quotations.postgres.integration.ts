import { randomUUID } from 'node:crypto';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { PrismaService } from '../src/database/prisma.service.js';
import { QuotationsService } from '../src/quotations/quotations.service.js';

function isolatedDatabase(value: string | undefined) {
  if (!value)
    throw new Error(
      'DATABASE_URL is required for PostgreSQL integration tests.',
    );
  const url = new URL(value);
  const name = url.pathname.slice(1);
  if (
    !['localhost', '127.0.0.1'].includes(url.hostname) ||
    !/(^|[_-])test($|[_-])/i.test(name)
  )
    throw new Error(
      'Refusing PostgreSQL integration test: use a local database whose name contains test.',
    );
  return name;
}

const draft = (suffix = '') => ({
  items: [
    {
      description: `قطعه نمونه${suffix}`,
      quantity: '2.500',
      unit: 'عدد',
      unitPriceRials: '1000',
      lineTotalRials: '2500',
    },
  ],
  subtotalRials: '2500',
  discountRials: '100',
  taxRials: '240',
  additionalCostRials: '60',
  totalRials: '2700',
  validUntil: new Date(Date.now() + 86_400_000).toISOString(),
  deliveryTerms: 'تحویل پس از تأیید کتبی',
  paymentTerms: 'پرداخت طبق توافق',
  notes: undefined,
});

describe('quotation PostgreSQL concurrency, ownership, and atomicity', () => {
  const database = isolatedDatabase(process.env.DATABASE_URL);
  const marker = `quotation-it-${randomUUID()}`;
  let prisma: PrismaService;
  let service: QuotationsService;
  let customerId: string;
  let foreignCustomerId: string;
  let salesId: string;
  let inquiryId: string;
  let firstQuotationId: string;
  let revisionId: string;

  beforeAll(async () => {
    expect(database).toMatch(/test/i);
    prisma = new PrismaService();
    service = new QuotationsService(prisma);
    await prisma.$connect();
    const [customer, foreignCustomer, sales] = await Promise.all([
      prisma.user.create({
        data: {
          mobile: `+984${Date.now().toString().slice(-9)}`,
          displayName: `${marker}-customer`,
        },
      }),
      prisma.user.create({
        data: {
          mobile: `+983${Date.now().toString().slice(-9)}`,
          displayName: `${marker}-foreign`,
        },
      }),
      prisma.user.create({
        data: {
          mobile: `+982${Date.now().toString().slice(-9)}`,
          displayName: `${marker}-sales`,
          role: 'SALES',
        },
      }),
    ]);
    customerId = customer.id;
    foreignCustomerId = foreignCustomer.id;
    salesId = sales.id;
    const inquiry = await prisma.inquiry.create({
      data: { type: 'PRODUCT', ownerId: customerId, catalogItemName: marker },
    });
    inquiryId = inquiry.id;
    await prisma.inquiryStatusHistory.create({
      data: {
        inquiryId,
        fromStatus: null,
        toStatus: 'SUBMITTED',
        actorId: customerId,
      },
    });
  });

  afterAll(async () => {
    if (!prisma) return;
    await prisma.$executeRawUnsafe(
      'DROP TRIGGER IF EXISTS "quotation_audit_failure" ON "SecurityAuditEvent"',
    );
    await prisma.$executeRawUnsafe(
      'DROP FUNCTION IF EXISTS fail_quotation_audit()',
    );
    await prisma.securityAuditEvent.deleteMany({
      where: { userId: { in: [customerId, foreignCustomerId, salesId] } },
    });
    await prisma.inquiry.deleteMany({
      where: { ownerId: { in: [customerId, foreignCustomerId] } },
    });
    await prisma.user.deleteMany({
      where: { id: { in: [customerId, foreignCustomerId, salesId] } },
    });
    await prisma.$disconnect();
  });

  it('enforces one draft and exactly one concurrent optimistic update', async () => {
    const created = await service.createDraft(inquiryId, draft(), salesId);
    firstQuotationId = created.id;
    expect(created).toMatchObject({
      status: 'DRAFT',
      version: 1,
      editVersion: 0,
      totalRials: '2700',
    });
    await expect(
      service.createDraft(inquiryId, draft(' duplicate'), salesId),
    ).rejects.toMatchObject({ status: 409 });
    const results = await Promise.allSettled([
      service.updateDraft(inquiryId, created.id, draft(' الف'), 0, salesId),
      service.updateDraft(inquiryId, created.id, draft(' ب'), 0, salesId),
    ]);
    expect(results.filter((item) => item.status === 'fulfilled')).toHaveLength(
      1,
    );
    expect(results.filter((item) => item.status === 'rejected')).toHaveLength(
      1,
    );
    expect((await service.adminGet(inquiryId, created.id)).editVersion).toBe(1);
  });

  it('atomically sends and exposes only sent DTOs to the owner', async () => {
    const sent = await service.send(inquiryId, firstQuotationId, 1, 0, salesId);
    expect(sent).toMatchObject({ status: 'SENT', editVersion: 2 });
    expect(
      await prisma.inquiry.findUniqueOrThrow({
        where: { id: inquiryId },
        select: { status: true, version: true },
      }),
    ).toEqual({ status: 'QUOTED', version: 1 });
    expect(
      await prisma.inquiryStatusHistory.count({
        where: { inquiryId, toStatus: 'QUOTED' },
      }),
    ).toBe(1);
    const ownerRows = await service.customerList(customerId, inquiryId);
    expect(ownerRows).toHaveLength(1);
    expect(ownerRows[0]).not.toHaveProperty('editVersion');
    expect(await service.customerList(foreignCustomerId, inquiryId)).toEqual(
      [],
    );
    await expect(
      service.updateDraft(
        inquiryId,
        firstQuotationId,
        draft(' immutable'),
        2,
        salesId,
      ),
    ).rejects.toMatchObject({ status: 409 });
  });

  it('rolls back supersede, send, inquiry version, history, and audit when audit persistence fails', async () => {
    const revision = await service.revise(
      inquiryId,
      firstQuotationId,
      2,
      salesId,
    );
    revisionId = revision.id;
    expect(revision).toMatchObject({
      status: 'DRAFT',
      version: 2,
      editVersion: 0,
    });
    await prisma.$executeRawUnsafe(`
      CREATE FUNCTION fail_quotation_audit() RETURNS trigger AS $trigger$
      BEGIN
        IF NEW.action = 'QUOTATION_SENT' THEN RAISE EXCEPTION 'forced quotation audit failure'; END IF;
        RETURN NEW;
      END;
      $trigger$ LANGUAGE plpgsql
    `);
    await prisma.$executeRawUnsafe(
      'CREATE TRIGGER "quotation_audit_failure" BEFORE INSERT ON "SecurityAuditEvent" FOR EACH ROW EXECUTE FUNCTION fail_quotation_audit()',
    );
    try {
      await expect(
        service.send(inquiryId, revisionId, 0, 1, salesId),
      ).rejects.toThrow();
    } finally {
      await prisma.$executeRawUnsafe(
        'DROP TRIGGER IF EXISTS "quotation_audit_failure" ON "SecurityAuditEvent"',
      );
      await prisma.$executeRawUnsafe(
        'DROP FUNCTION IF EXISTS fail_quotation_audit()',
      );
    }
    expect(
      await prisma.quotation.findUniqueOrThrow({
        where: { id: revisionId },
        select: { status: true, editVersion: true },
      }),
    ).toEqual({ status: 'DRAFT', editVersion: 0 });
    expect(
      await prisma.quotation.findUniqueOrThrow({
        where: { id: firstQuotationId },
        select: { status: true },
      }),
    ).toEqual({ status: 'SENT' });
    expect(
      await prisma.inquiry.findUniqueOrThrow({
        where: { id: inquiryId },
        select: { status: true, version: true },
      }),
    ).toEqual({ status: 'QUOTED', version: 1 });
    expect(
      await prisma.securityAuditEvent.count({
        where: {
          action: 'QUOTATION_SENT',
          metadata: { path: ['quotationId'], equals: revisionId },
        },
      }),
    ).toBe(0);
  });

  it('sends a revision and supersedes the previous immutable snapshot', async () => {
    await expect(
      service.send(inquiryId, revisionId, 0, 1, salesId),
    ).resolves.toMatchObject({ status: 'SENT', version: 2 });
    expect(
      await prisma.quotation.findUniqueOrThrow({
        where: { id: firstQuotationId },
        select: { status: true },
      }),
    ).toEqual({ status: 'SUPERSEDED' });
    const rows = await service.customerList(customerId, inquiryId);
    expect(rows.map((item) => [item.version, item.status])).toEqual([
      [2, 'SENT'],
      [1, 'SUPERSEDED'],
    ]);
  });

  it('rejects foreign customer response, stale versions, and expired quotes', async () => {
    await expect(
      service.customerAccept(inquiryId, revisionId, 2, 2, foreignCustomerId),
    ).rejects.toMatchObject({ status: 404 });

    await expect(
      service.customerAccept(inquiryId, revisionId, 1, 2, customerId),
    ).rejects.toMatchObject({
      response: expect.objectContaining({ code: 'QUOTATION_VERSION_CONFLICT' }),
    });

    await expect(
      service.customerAccept(inquiryId, revisionId, 2, 0, customerId),
    ).rejects.toMatchObject({
      response: expect.objectContaining({ code: 'INQUIRY_VERSION_CONFLICT' }),
    });

    await expect(
      service.customerAccept(inquiryId, firstQuotationId, 1, 2, customerId),
    ).rejects.toMatchObject({
      response: expect.objectContaining({ code: 'QUOTATION_NOT_ELIGIBLE' }),
    });

    await prisma.quotation.update({
      where: { id: revisionId },
      data: { validUntil: new Date(Date.now() - 1000) },
    });
    await expect(
      service.customerAccept(inquiryId, revisionId, 2, 2, customerId),
    ).rejects.toMatchObject({
      response: expect.objectContaining({ code: 'QUOTATION_EXPIRED' }),
    });
    // restore validity
    await prisma.quotation.update({
      where: { id: revisionId },
      data: { validUntil: new Date(Date.now() + 86_400_000) },
    });
  });

  it('atomically accepts quotation, transitions inquiry to ACCEPTED, and supports idempotent replay', async () => {
    const accepted = await service.customerAccept(
      inquiryId,
      revisionId,
      2,
      2,
      customerId,
    );
    expect(accepted.status).toBe('ACCEPTED');
    expect(accepted.respondedAt).toBeDefined();

    const inq = await prisma.inquiry.findUniqueOrThrow({
      where: { id: inquiryId },
      select: { status: true, version: true },
    });
    expect(inq).toEqual({ status: 'ACCEPTED', version: 3 });

    const historyCount = await prisma.inquiryStatusHistory.count({
      where: { inquiryId, fromStatus: 'QUOTED', toStatus: 'ACCEPTED' },
    });
    expect(historyCount).toBe(1);

    const auditCount = await prisma.securityAuditEvent.count({
      where: {
        action: 'QUOTATION_ACCEPTED',
        metadata: { path: ['quotationId'], equals: revisionId },
      },
    });
    expect(auditCount).toBe(1);

    // Idempotent same-result replay returns same result without duplicate history/audit
    const replayed = await service.customerAccept(
      inquiryId,
      revisionId,
      2,
      3,
      customerId,
    );
    expect(replayed.status).toBe('ACCEPTED');
    expect(
      await prisma.inquiryStatusHistory.count({
        where: { inquiryId, fromStatus: 'QUOTED', toStatus: 'ACCEPTED' },
      }),
    ).toBe(1);

    // Opposite-result rejection throws conflict
    await expect(
      service.customerReject(inquiryId, revisionId, 2, 3, 'علت', customerId),
    ).rejects.toMatchObject({
      response: expect.objectContaining({ code: 'QUOTATION_ALREADY_ANSWERED' }),
    });
  });

  it('rejects an offer with reason, returns inquiry to UNDER_REVIEW, and allows revision', async () => {
    const rejectInq = await prisma.inquiry.create({
      data: {
        ownerId: customerId,
        type: 'PRODUCT',
        status: 'SUBMITTED',
      },
    });
    const draftRow = await service.createDraft(rejectInq.id, draft('-reject'), salesId);
    await service.send(rejectInq.id, draftRow.id, 0, 0, salesId);

    const rejected = await service.customerReject(
      rejectInq.id,
      draftRow.id,
      1,
      1,
      'قیمت بالا است',
      customerId,
    );
    expect(rejected.status).toBe('REJECTED');
    expect(rejected.rejectionReason).toBe('قیمت بالا است');

    const inq = await prisma.inquiry.findUniqueOrThrow({
      where: { id: rejectInq.id },
      select: { status: true, version: true },
    });
    expect(inq).toEqual({ status: 'UNDER_REVIEW', version: 2 });

    const historyCount = await prisma.inquiryStatusHistory.count({
      where: { inquiryId: rejectInq.id, fromStatus: 'QUOTED', toStatus: 'UNDER_REVIEW' },
    });
    expect(historyCount).toBe(1);

    // Replay returns same result
    const replayed = await service.customerReject(
      rejectInq.id,
      draftRow.id,
      1,
      2,
      'قیمت بالا است',
      customerId,
    );
    expect(replayed.status).toBe('REJECTED');

    // Opposite accept throws conflict
    await expect(
      service.customerAccept(rejectInq.id, draftRow.id, 1, 2, customerId),
    ).rejects.toMatchObject({
      response: expect.objectContaining({ code: 'QUOTATION_ALREADY_ANSWERED' }),
    });

    // Staff can create revision from the REJECTED offer!
    const newDraft = await service.revise(rejectInq.id, draftRow.id, 2, salesId);
    expect(newDraft.status).toBe('DRAFT');
    expect(newDraft.version).toBe(2);
  });
});
