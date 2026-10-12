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

  beforeAll(async () => {
    expect(database).toMatch(/test/i);
    prisma = new PrismaService();
    repository = new PrismaInquiryRepository(prisma);
    await prisma.$connect();
    const user = await prisma.user.create({ data: { mobile: `+989${Date.now().toString().slice(-9)}`, displayName: marker } });
    userId = user.id;
  });
  afterAll(async () => {
    if (!prisma) return;
    await prisma.inquiry.deleteMany({ where: { ownerId: userId } });
    await prisma.user.deleteMany({ where: { id: userId } });
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
});
