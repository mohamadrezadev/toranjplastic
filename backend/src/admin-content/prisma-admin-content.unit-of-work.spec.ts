import { describe, expect, it, vi } from 'vitest';
import type { PrismaService } from '../database/prisma.service.js';
import { PrismaAdminContentUnitOfWork } from './prisma-admin-content.unit-of-work.js';

const rawCategory = {
  id: 'category-1',
  name: 'دسته',
  slug: 'category',
  description: null,
  image: null,
  displayOrder: 0,
  status: 'DRAFT',
  publishedAt: null,
  metaTitle: null,
  metaDescription: null,
  createdAt: new Date('2026-10-11T00:00:00.000Z'),
  updatedAt: new Date('2026-10-11T00:00:00.000Z'),
};

function transactionalPrisma(
  options: { failContent?: boolean; failAudit?: boolean } = {},
) {
  const committed = { content: 0, audit: 0 };
  const auditCreate = vi.fn(async (_args: unknown) => {
    if (options.failAudit) throw new Error('audit failed');
    return {};
  });
  const categoryCreate = vi.fn(async (_args: unknown) => {
    if (options.failContent) throw new Error('content failed');
    return rawCategory;
  });
  const transaction = vi.fn(
    async (work: (client: unknown) => Promise<unknown>) => {
      const pending = { content: 0, audit: 0 };
      const client = {
        category: {
          create: async (args: unknown) => {
            const result = await categoryCreate(args);
            pending.content += 1;
            return result;
          },
        },
        securityAuditEvent: {
          create: async (args: unknown) => {
            const result = await auditCreate(args);
            pending.audit += 1;
            return result;
          },
        },
      };
      const result = await work(client);
      committed.content += pending.content;
      committed.audit += pending.audit;
      return result;
    },
  );
  return {
    prisma: { $transaction: transaction } as unknown as PrismaService,
    committed,
    categoryCreate,
    auditCreate,
    transaction,
  };
}

describe('PrismaAdminContentUnitOfWork', () => {
  const mediaConfig = { publicOrigin: 'https://media.example' };

  it('commits content and audit writes together on success', async () => {
    const fixture = transactionalPrisma();
    const unitOfWork = new PrismaAdminContentUnitOfWork(fixture.prisma, mediaConfig);

    await unitOfWork.run(async ({ categories, audit }) => {
      await categories.create({ name: 'دسته', slug: 'category' });
      await audit.securityAuditEvent.create({
        data: { action: 'CATEGORY_CREATED', userId: 'admin-1' },
      });
    });

    expect(fixture.committed).toEqual({ content: 1, audit: 1 });
    expect(fixture.transaction).toHaveBeenCalledOnce();
  });

  it('rolls back the content write when audit persistence fails', async () => {
    const fixture = transactionalPrisma({ failAudit: true });
    const unitOfWork = new PrismaAdminContentUnitOfWork(fixture.prisma, mediaConfig);

    await expect(
      unitOfWork.run(async ({ categories, audit }) => {
        await categories.create({ name: 'دسته', slug: 'category' });
        await audit.securityAuditEvent.create({
          data: { action: 'CATEGORY_CREATED', userId: 'admin-1' },
        });
      }),
    ).rejects.toThrow('audit failed');

    expect(fixture.committed).toEqual({ content: 0, audit: 0 });
  });

  it('does not attempt or commit an audit write when content persistence fails', async () => {
    const fixture = transactionalPrisma({ failContent: true });
    const unitOfWork = new PrismaAdminContentUnitOfWork(fixture.prisma, mediaConfig);

    await expect(
      unitOfWork.run(async ({ categories, audit }) => {
        await categories.create({ name: 'دسته', slug: 'category' });
        await audit.securityAuditEvent.create({
          data: { action: 'CATEGORY_CREATED', userId: 'admin-1' },
        });
      }),
    ).rejects.toThrow('content failed');

    expect(fixture.auditCreate).not.toHaveBeenCalled();
    expect(fixture.committed).toEqual({ content: 0, audit: 0 });
  });
});
