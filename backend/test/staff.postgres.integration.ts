import { randomUUID } from 'node:crypto';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { PrismaService } from '../src/database/prisma.service.js';
import { StaffService } from '../src/identity/staff.service.js';

function isolatedDatabase(value: string | undefined) {
  if (!value) throw new Error('DATABASE_URL is required for PostgreSQL integration tests.');
  const url = new URL(value); const name = url.pathname.slice(1);
  if (!['localhost', '127.0.0.1'].includes(url.hostname) || !/(^|[_-])test($|[_-])/i.test(name)) throw new Error('Refusing PostgreSQL integration test: use a local database whose name contains test.');
  return name;
}

describe('staff PostgreSQL concurrency and atomicity', () => {
  const database = isolatedDatabase(process.env.DATABASE_URL);
  const marker = `staff-it-${randomUUID()}`;
  let prisma: PrismaService; let service: StaffService; let firstId: string; let secondId: string;
  beforeAll(async () => {
    expect(database).toMatch(/test/i); prisma = new PrismaService(); service = new StaffService(prisma); await prisma.$connect();
    const first = await prisma.user.create({ data: { mobile: `+987${Date.now().toString().slice(-9)}`, displayName: `${marker}-one`, role: 'ADMIN' } });
    const second = await prisma.user.create({ data: { mobile: `+986${Date.now().toString().slice(-9)}`, displayName: `${marker}-two`, role: 'ADMIN' } });
    firstId = first.id; secondId = second.id;
  });
  afterAll(async () => {
    if (!prisma) return;
    await prisma.authSession.deleteMany({ where: { userId: { in: [firstId, secondId] } } });
    await prisma.securityAuditEvent.deleteMany({ where: { userId: { in: [firstId, secondId] } } });
    await prisma.user.deleteMany({ where: { id: { in: [firstId, secondId] } } }); await prisma.$disconnect();
  });

  it('allows only one of two concurrent demotions that would remove all active admins', async () => {
    const results = await Promise.allSettled([
      service.changeRole(secondId, 'SALES', 0, firstId),
      service.changeRole(firstId, 'SALES', 0, secondId),
    ]);
    expect(results.filter((item) => item.status === 'fulfilled')).toHaveLength(1);
    expect(results.filter((item) => item.status === 'rejected')).toHaveLength(1);
    expect(await prisma.user.count({ where: { role: 'ADMIN', status: 'ACTIVE', id: { in: [firstId, secondId] } } })).toBe(1);
    expect(await prisma.securityAuditEvent.count({ where: { action: 'STAFF_ROLE_CHANGED', userId: { in: [firstId, secondId] } } })).toBe(1);
  });
});
