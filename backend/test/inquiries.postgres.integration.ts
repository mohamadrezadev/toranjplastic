import { randomUUID } from 'node:crypto';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { PrismaService } from '../src/database/prisma.service.js';
import { PrismaInquiryRepository } from '../src/inquiries/prisma-inquiry.repository.js';

function isolatedDatabase(value: string | undefined) {
  if (!value) throw new Error('DATABASE_URL is required for PostgreSQL integration tests.');
  const url = new URL(value);
  const name = url.pathname.slice(1);
  if (!['localhost', '127.0.0.1'].includes(url.hostname) || !/(^|[_-])test($|[_-])/i.test(name)) throw new Error('Refusing PostgreSQL integration test: use a local database whose name contains test.');
  return name;
}

describe('inquiry PostgreSQL atomicity', () => {
  const database = isolatedDatabase(process.env.DATABASE_URL);
  const marker = `inquiry-it-${randomUUID()}`;
  let prisma: PrismaService;
  let repository: PrismaInquiryRepository;
  let userId: string;
  let adminId: string;

  beforeAll(async () => {
    expect(database).toMatch(/test/i);
    prisma = new PrismaService();
    repository = new PrismaInquiryRepository(prisma);
    await prisma.$connect();
    const user = await prisma.user.create({ data: { mobile: `+989${Date.now().toString().slice(-9)}`, displayName: marker } });
    userId = user.id;
    const admin = await prisma.user.create({ data: { mobile: `+988${Date.now().toString().slice(-9)}`, displayName: `${marker}-admin`, role: 'ADMIN' } });
    adminId = admin.id;
  });
  afterAll(async () => {
    if (!prisma) return;
    await prisma.inquiry.deleteMany({ where: { ownerId: userId } });
    await prisma.securityAuditEvent.deleteMany({ where: { userId: { in: [userId, adminId] } } });
    await prisma.user.deleteMany({ where: { id: { in: [userId, adminId] } } });
    await prisma.$disconnect();
  });

  it('commits the request and initial history in one real transaction', async () => {
    const created = await repository.create(userId, { type: 'GENERAL_CONTACT', description: marker });
    expect(created.status).toBe('SUBMITTED');
    expect(created.statusHistory).toHaveLength(1);
    expect(await prisma.inquiryStatusHistory.count({ where: { inquiryId: created.id } })).toBe(1);
  });

  it('rolls back the inquiry if the history actor foreign key fails', async () => {
    await expect(repository.create('missing-user', { type: 'GENERAL_CONTACT', description: marker })).rejects.toThrow();
    expect(await prisma.inquiry.count({ where: { ownerId: 'missing-user' } })).toBe(0);
  });

  it('allows exactly one concurrent mutation for the same expected version', async () => {
    const created = await repository.create(userId, { type: 'GENERAL_CONTACT', description: `${marker}-concurrency` });
    const results = await Promise.all([
      repository.adminTransitionStatus(created.id, 0, 'UNDER_REVIEW', adminId),
      repository.adminTransitionStatus(created.id, 0, 'UNDER_REVIEW', adminId),
    ]);
    expect(results.map((result) => result.kind).sort()).toEqual(['ok', 'version_conflict']);
    expect(await prisma.inquiryStatusHistory.count({ where: { inquiryId: created.id } })).toBe(2);
    expect(await prisma.securityAuditEvent.count({ where: { action: 'INQUIRY_STATUS_CHANGED', metadata: { path: ['inquiryId'], equals: created.id } } })).toBe(1);
  });

  it('stores assignment and note audit metadata without changing version for the note', async () => {
    const created = await repository.create(userId, { type: 'PRODUCT', description: `${marker}-operations` });
    const assigned = await repository.adminAssign(created.id, 0, adminId, adminId);
    expect(assigned.kind).toBe('ok');
    const noted = await repository.adminAddNote(created.id, 'یادداشت داخلی', adminId);
    expect(noted.kind).toBe('ok');
    if (noted.kind === 'ok') expect(noted.inquiry.version).toBe(1);
    expect(await prisma.inquiryAssignmentHistory.count({ where: { inquiryId: created.id } })).toBe(1);
    expect(await prisma.inquiryInternalNote.count({ where: { inquiryId: created.id } })).toBe(1);
  });
});
