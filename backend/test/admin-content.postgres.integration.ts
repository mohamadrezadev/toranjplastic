import { randomUUID } from 'node:crypto';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { PrismaService } from '../src/database/prisma.service.js';
import { PrismaAdminContentUnitOfWork } from '../src/admin-content/prisma-admin-content.unit-of-work.js';

function assertIsolatedTestDatabase(connectionString: string | undefined): string {
  if (!connectionString) {
    throw new Error('DATABASE_URL is required for PostgreSQL integration tests. Use the disposable toranj_test database.');
  }

  const url = new URL(connectionString);
  const database = url.pathname.slice(1);
  const hostIsLocal = ['localhost', '127.0.0.1'].includes(url.hostname);
  if (!hostIsLocal || !/(^|[_-])test($|[_-])/i.test(database)) {
    throw new Error('Refusing PostgreSQL integration test: DATABASE_URL must target a local database whose name contains "test".');
  }
  return database;
}

describe('admin content PostgreSQL transaction integration', () => {
  const testDatabase = assertIsolatedTestDatabase(process.env.DATABASE_URL);
  const marker = `admin-content-it-${randomUUID()}`;
  const auditMarkers = [`${marker}-commit`, `${marker}-audit-failure`, `${marker}-content-failure`];
  let prisma: PrismaService;
  let unitOfWork: PrismaAdminContentUnitOfWork;

  beforeAll(async () => {
    expect(testDatabase).toMatch(/test/i);
    prisma = new PrismaService();
    unitOfWork = new PrismaAdminContentUnitOfWork(prisma);
    await prisma.$connect();
    await prisma.category.deleteMany({ where: { slug: { startsWith: marker } } });
    await prisma.securityAuditEvent.deleteMany({ where: { OR: auditMarkers.map((value) => ({ metadata: { path: ['integrationMarker'], equals: value } })) } });
  });

  afterAll(async () => {
    if (!prisma) return;
    await prisma.category.deleteMany({ where: { slug: { startsWith: marker } } });
    await prisma.securityAuditEvent.deleteMany({ where: { OR: auditMarkers.map((value) => ({ metadata: { path: ['integrationMarker'], equals: value } })) } });
    await prisma.$disconnect();
  });

  it('commits a real content row and its audit row together', async () => {
    const testMarker = `${marker}-commit`;
    const slug = testMarker;
    const created = await unitOfWork.run(async ({ categories, audit }) => {
      const category = await categories.create({ name: 'Integration test', slug });
      await audit.securityAuditEvent.create({
        data: { action: 'CATEGORY_CREATED', userId: null, metadata: { integrationMarker: testMarker, recordId: category.id } },
      });
      return category;
    });

    expect(await prisma.category.findUnique({ where: { id: created.id } })).not.toBeNull();
    expect(await prisma.securityAuditEvent.count({
      where: { metadata: { path: ['recordId'], equals: created.id } },
    })).toBe(1);
  });

  it('rolls back a real content write when audit persistence fails', async () => {
    const testMarker = `${marker}-audit-failure`;
    const slug = testMarker;
    await expect(unitOfWork.run(async ({ categories, audit }) => {
      const category = await categories.create({ name: 'Integration test', slug });
      await audit.securityAuditEvent.create({
        data: { action: 'CATEGORY_CREATED', userId: 'missing-integration-user', metadata: { integrationMarker: testMarker, recordId: category.id } },
      });
      return category;
    })).rejects.toThrow();

    expect(await prisma.category.findUnique({ where: { slug } })).toBeNull();
    expect(await prisma.securityAuditEvent.count({ where: { metadata: { path: ['integrationMarker'], equals: testMarker } } })).toBe(0);
  });

  it('does not persist an audit row when the content write fails', async () => {
    const testMarker = `${marker}-content-failure`;
    const slug = testMarker;
    await prisma.category.create({ data: { name: 'Existing integration row', slug } });

    await expect(unitOfWork.run(async ({ categories, audit }) => {
      const category = await categories.create({ name: 'Duplicate integration row', slug });
      await audit.securityAuditEvent.create({
        data: { action: 'CATEGORY_CREATED', userId: null, metadata: { integrationMarker: testMarker, recordId: category.id } },
      });
      return category;
    })).rejects.toThrow();

    expect(await prisma.securityAuditEvent.count({ where: { metadata: { path: ['integrationMarker'], equals: testMarker } } })).toBe(0);
  });
});
