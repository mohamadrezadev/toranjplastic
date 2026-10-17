import { randomUUID } from 'node:crypto';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { PrismaService } from '../src/database/prisma.service.js';
import { StaffService } from '../src/identity/staff.service.js';

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

describe('staff PostgreSQL concurrency and atomicity', () => {
  const database = isolatedDatabase(process.env.DATABASE_URL);
  const marker = `staff-it-${randomUUID()}`;
  let prisma: PrismaService;
  let service: StaffService;
  let firstId: string;
  let secondId: string;
  let rollbackTargetId: string;
  beforeAll(async () => {
    expect(database).toMatch(/test/i);
    prisma = new PrismaService();
    service = new StaffService(prisma);
    await prisma.$connect();
    const first = await prisma.user.create({
      data: {
        mobile: `+987${Date.now().toString().slice(-9)}`,
        displayName: `${marker}-one`,
        role: 'ADMIN',
      },
    });
    const second = await prisma.user.create({
      data: {
        mobile: `+986${Date.now().toString().slice(-9)}`,
        displayName: `${marker}-two`,
        role: 'ADMIN',
      },
    });
    const rollbackTarget = await prisma.user.create({
      data: {
        mobile: `+985${Date.now().toString().slice(-9)}`,
        displayName: `${marker}-rollback`,
        role: 'SALES',
      },
    });
    firstId = first.id;
    secondId = second.id;
    rollbackTargetId = rollbackTarget.id;
    await prisma.authSession.create({
      data: {
        tokenDigest: randomUUID(),
        csrfDigest: randomUUID(),
        userId: rollbackTargetId,
        expiresAt: new Date(Date.now() + 60_000),
      },
    });
  });
  afterAll(async () => {
    if (!prisma) return;
    await prisma.$executeRawUnsafe(
      'DROP TRIGGER IF EXISTS "staff_audit_failure" ON "SecurityAuditEvent"',
    );
    await prisma.$executeRawUnsafe(
      'DROP FUNCTION IF EXISTS fail_staff_role_audit()',
    );
    await prisma.authSession.deleteMany({
      where: { userId: { in: [firstId, secondId, rollbackTargetId] } },
    });
    await prisma.securityAuditEvent.deleteMany({
      where: { userId: { in: [firstId, secondId, rollbackTargetId] } },
    });
    await prisma.user.deleteMany({
      where: { id: { in: [firstId, secondId, rollbackTargetId] } },
    });
    await prisma.$disconnect();
  });

  it('allows only one of two concurrent demotions that would remove all active admins', async () => {
    expect(
      await prisma.user.count({ where: { role: 'ADMIN', status: 'ACTIVE' } }),
    ).toBe(2);
    const results = await Promise.allSettled([
      service.changeRole(secondId, 'SALES', 0, firstId),
      service.changeRole(firstId, 'SALES', 0, secondId),
    ]);
    expect(results.filter((item) => item.status === 'fulfilled')).toHaveLength(
      1,
    );
    expect(results.filter((item) => item.status === 'rejected')).toHaveLength(
      1,
    );
    expect(
      await prisma.user.count({
        where: {
          role: 'ADMIN',
          status: 'ACTIVE',
          id: { in: [firstId, secondId] },
        },
      }),
    ).toBe(1);
    expect(
      await prisma.securityAuditEvent.count({
        where: {
          action: 'STAFF_ROLE_CHANGED',
          userId: { in: [firstId, secondId] },
        },
      }),
    ).toBe(1);
  });

  it('rolls back account, version, session revocation, and audit when audit persistence fails', async () => {
    const actor = await prisma.user.findFirstOrThrow({
      where: {
        id: { in: [firstId, secondId] },
        role: 'ADMIN',
        status: 'ACTIVE',
      },
    });
    const auditCountBefore = await prisma.securityAuditEvent.count({
      where: { action: 'STAFF_ROLE_CHANGED' },
    });
    await prisma.$executeRawUnsafe(`
      CREATE FUNCTION fail_staff_role_audit() RETURNS trigger AS $trigger$
      BEGIN
        IF NEW.action = 'STAFF_ROLE_CHANGED' THEN RAISE EXCEPTION 'forced staff audit failure'; END IF;
        RETURN NEW;
      END;
      $trigger$ LANGUAGE plpgsql
    `);
    await prisma.$executeRawUnsafe(
      'CREATE TRIGGER "staff_audit_failure" BEFORE INSERT ON "SecurityAuditEvent" FOR EACH ROW EXECUTE FUNCTION fail_staff_role_audit()',
    );

    try {
      await expect(
        service.changeRole(rollbackTargetId, 'OPERATOR', 0, actor.id),
      ).rejects.toThrow();
    } finally {
      await prisma.$executeRawUnsafe(
        'DROP TRIGGER IF EXISTS "staff_audit_failure" ON "SecurityAuditEvent"',
      );
      await prisma.$executeRawUnsafe(
        'DROP FUNCTION IF EXISTS fail_staff_role_audit()',
      );
    }

    expect(
      await prisma.user.findUniqueOrThrow({
        where: { id: rollbackTargetId },
        select: { role: true, version: true },
      }),
    ).toEqual({ role: 'SALES', version: 0 });
    expect(
      await prisma.authSession.count({
        where: { userId: rollbackTargetId, revokedAt: null },
      }),
    ).toBe(1);
    expect(
      await prisma.securityAuditEvent.count({
        where: { action: 'STAFF_ROLE_CHANGED' },
      }),
    ).toBe(auditCountBefore);
  });
});
