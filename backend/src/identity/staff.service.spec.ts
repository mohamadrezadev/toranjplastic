import { describe, expect, it, vi } from 'vitest';
import { StaffService } from './staff.service.js';
import { StaffRoleDto } from './dto/staff.dto.js';

const now = new Date();
const admin = { id: 'a2', mobile: '+989121111111', displayName: 'Admin Two', role: 'ADMIN' as const, status: 'ACTIVE' as const, version: 0, createdAt: now, updatedAt: now, lastLoginAt: null };

function prismaMock() {
  const mock = {
    user: { count: vi.fn(), findMany: vi.fn(), findFirst: vi.fn(), findUnique: vi.fn(), findUniqueOrThrow: vi.fn(), create: vi.fn(), updateMany: vi.fn() },
    authSession: { updateMany: vi.fn() },
    securityAuditEvent: { create: vi.fn() },
    $executeRawUnsafe: vi.fn(),
    $transaction: vi.fn(),
  };
  mock.$transaction.mockImplementation(async (work: (tx: typeof mock) => unknown) => work(mock));
  return mock;
}

describe('StaffService', () => {
  it('lists only staff with bounded deterministic paging', async () => {
    const prisma = prismaMock(); prisma.user.count.mockResolvedValue(1); prisma.user.findMany.mockResolvedValue([admin]);
    const result = await new StaffService(prisma as never).list({ page: 1, pageSize: 20 });
    expect(result.items).toEqual([admin]);
    expect(prisma.user.findMany).toHaveBeenCalledWith(expect.objectContaining({ take: 20, skip: 0, orderBy: [{ createdAt: 'desc' }, { id: 'asc' }] }));
    expect(prisma.user.findMany.mock.calls[0][0].where.role.in).toEqual(['ADMIN', 'SALES', 'OPERATOR']);
  });

  it('creates staff atomically and audits identifiers without personal data', async () => {
    const prisma = prismaMock(); prisma.user.create.mockResolvedValue({ ...admin, id: 's1', role: 'SALES' }); prisma.securityAuditEvent.create.mockResolvedValue({});
    const result = await new StaffService(prisma as never).create({ mobile: '09121111111', displayName: ' Sales ', password: 'strong-password', role: StaffRoleDto.SALES }, 'a1');
    expect(result.role).toBe('SALES');
    const data = prisma.user.create.mock.calls[0][0].data;
    expect(data.password.create.passwordHash).toMatch(/^\$argon2id\$/);
    expect(prisma.securityAuditEvent.create.mock.calls[0][0].data.metadata).toEqual({ targetUserId: 's1', role: 'SALES', version: 0 });
  });

  it('rejects self changes before persistence', async () => {
    const prisma = prismaMock();
    await expect(new StaffService(prisma as never).changeRole('a1', 'SALES', 0, 'a1')).rejects.toMatchObject({ status: 403 });
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it('protects the last active administrator', async () => {
    const prisma = prismaMock(); prisma.user.findUnique.mockResolvedValue({ ...admin, id: 'a2' }); prisma.user.count.mockResolvedValue(1);
    await expect(new StaffService(prisma as never).changeStatus('a2', 'DISABLED', 0, 'a1')).rejects.toMatchObject({ status: 409, response: expect.objectContaining({ code: 'STAFF_LAST_ADMIN_CONFLICT' }) });
    expect(prisma.user.updateMany).not.toHaveBeenCalled();
    expect(prisma.authSession.updateMany).not.toHaveBeenCalled();
  });

  it('updates version, revokes sessions, and audits a role change atomically', async () => {
    const prisma = prismaMock();
    prisma.user.findUnique.mockResolvedValue({ ...admin, role: 'SALES' });
    prisma.user.updateMany.mockResolvedValue({ count: 1 });
    prisma.user.findUniqueOrThrow.mockResolvedValue({ ...admin, role: 'OPERATOR', version: 1 });
    prisma.authSession.updateMany.mockResolvedValue({ count: 2 }); prisma.securityAuditEvent.create.mockResolvedValue({});
    const result = await new StaffService(prisma as never).changeRole('a2', 'OPERATOR', 0, 'a1');
    expect(result.version).toBe(1);
    expect(prisma.authSession.updateMany).toHaveBeenCalledWith({ where: { userId: 'a2', revokedAt: null }, data: { revokedAt: expect.any(Date) } });
    expect(prisma.securityAuditEvent.create.mock.calls[0][0].data.metadata).toEqual({ targetUserId: 'a2', previousRole: 'SALES', nextRole: 'OPERATOR', version: 1 });
  });

  it('returns a stable version conflict without side effects', async () => {
    const prisma = prismaMock(); prisma.user.findUnique.mockResolvedValue({ ...admin, version: 2 });
    await expect(new StaffService(prisma as never).changeRole('a2', 'SALES', 1, 'a1')).rejects.toMatchObject({ status: 409, response: expect.objectContaining({ code: 'STAFF_VERSION_CONFLICT' }) });
    expect(prisma.authSession.updateMany).not.toHaveBeenCalled();
    expect(prisma.securityAuditEvent.create).not.toHaveBeenCalled();
  });
});
