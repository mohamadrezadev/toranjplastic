import { describe, expect, it, vi } from 'vitest';
import { StaffService } from './staff.service.js';
import { StaffFilterStatusDto, StaffRoleDto } from './dto/staff.dto.js';

const now = new Date();
const admin = {
  id: 'a2',
  mobile: '+989121111111',
  displayName: 'Admin Two',
  role: 'ADMIN' as const,
  status: 'ACTIVE' as const,
  version: 0,
  createdAt: now,
  updatedAt: now,
  lastLoginAt: null,
};

function prismaMock() {
  const mock = {
    user: {
      count: vi.fn(),
      findMany: vi.fn(),
      findFirst: vi.fn(),
      findUnique: vi.fn(),
      findUniqueOrThrow: vi.fn(),
      create: vi.fn(),
      updateMany: vi.fn(),
    },
    authSession: { updateMany: vi.fn() },
    securityAuditEvent: { create: vi.fn() },
    $executeRawUnsafe: vi.fn(),
    $transaction: vi.fn(),
  };
  mock.$transaction.mockImplementation(
    async (work: (tx: typeof mock) => unknown) => work(mock),
  );
  return mock;
}

describe('StaffService', () => {
  it('lists only staff with bounded deterministic paging', async () => {
    const prisma = prismaMock();
    prisma.user.count.mockResolvedValue(1);
    prisma.user.findMany.mockResolvedValue([admin]);
    const result = await new StaffService(prisma as never).list({
      page: 1,
      pageSize: 20,
    });
    expect(result.items).toEqual([admin]);
    expect(prisma.user.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        take: 20,
        skip: 0,
        orderBy: [{ createdAt: 'desc' }, { id: 'asc' }],
      }),
    );
    expect(prisma.user.findMany.mock.calls[0][0].where.role.in).toEqual([
      'ADMIN',
      'SALES',
      'OPERATOR',
    ]);
  });

  it('creates staff atomically and audits identifiers without personal data', async () => {
    const prisma = prismaMock();
    prisma.user.create.mockResolvedValue({ ...admin, id: 's1', role: 'SALES' });
    prisma.securityAuditEvent.create.mockResolvedValue({});
    const result = await new StaffService(prisma as never).create(
      {
        mobile: '09121111111',
        displayName: ' Sales ',
        password: 'strong-password',
        role: StaffRoleDto.SALES,
      },
      'a1',
    );
    expect(result.role).toBe('SALES');
    const data = prisma.user.create.mock.calls[0][0].data;
    expect(data.password.create.passwordHash).toMatch(/^\$argon2id\$/);
    expect(
      prisma.securityAuditEvent.create.mock.calls[0][0].data.metadata,
    ).toEqual({ targetUserId: 's1', role: 'SALES', version: 0 });
  });

  it('rejects self changes before persistence', async () => {
    const prisma = prismaMock();
    await expect(
      new StaffService(prisma as never).changeRole('a1', 'SALES', 0, 'a1'),
    ).rejects.toMatchObject({ status: 403 });
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it('protects the last active administrator', async () => {
    const prisma = prismaMock();
    prisma.user.findUnique.mockResolvedValue({ ...admin, id: 'a2' });
    prisma.user.count.mockResolvedValue(1);
    await expect(
      new StaffService(prisma as never).changeStatus('a2', 'DISABLED', 0, 'a1'),
    ).rejects.toMatchObject({
      status: 409,
      response: expect.objectContaining({ code: 'STAFF_LAST_ADMIN_CONFLICT' }),
    });
    expect(prisma.user.updateMany).not.toHaveBeenCalled();
    expect(prisma.authSession.updateMany).not.toHaveBeenCalled();
  });

  it('updates version, revokes sessions, and audits a role change atomically', async () => {
    const prisma = prismaMock();
    prisma.user.findUnique.mockResolvedValue({ ...admin, role: 'SALES' });
    prisma.user.updateMany.mockResolvedValue({ count: 1 });
    prisma.user.findUniqueOrThrow.mockResolvedValue({
      ...admin,
      role: 'OPERATOR',
      version: 1,
    });
    prisma.authSession.updateMany.mockResolvedValue({ count: 2 });
    prisma.securityAuditEvent.create.mockResolvedValue({});
    const result = await new StaffService(prisma as never).changeRole(
      'a2',
      'OPERATOR',
      0,
      'a1',
    );
    expect(result.version).toBe(1);
    expect(prisma.authSession.updateMany).toHaveBeenCalledWith({
      where: { userId: 'a2', revokedAt: null },
      data: { revokedAt: expect.any(Date) },
    });
    expect(
      prisma.securityAuditEvent.create.mock.calls[0][0].data.metadata,
    ).toEqual({
      targetUserId: 'a2',
      previousRole: 'SALES',
      nextRole: 'OPERATOR',
      version: 1,
    });
  });

  it('returns a stable version conflict without side effects', async () => {
    const prisma = prismaMock();
    prisma.user.findUnique.mockResolvedValue({ ...admin, version: 2 });
    await expect(
      new StaffService(prisma as never).changeRole('a2', 'SALES', 1, 'a1'),
    ).rejects.toMatchObject({
      status: 409,
      response: expect.objectContaining({ code: 'STAFF_VERSION_CONFLICT' }),
    });
    expect(prisma.authSession.updateMany).not.toHaveBeenCalled();
    expect(prisma.securityAuditEvent.create).not.toHaveBeenCalled();
  });
  it('applies explicit role, status, and page filters', async () => {
    const prisma = prismaMock();
    prisma.user.count.mockResolvedValue(0);
    prisma.user.findMany.mockResolvedValue([]);
    const result = await new StaffService(prisma as never).list({
      role: StaffRoleDto.SALES,
      status: StaffFilterStatusDto.DISABLED,
      page: 2,
      pageSize: 5,
    });
    expect(result).toEqual({
      items: [],
      page: 2,
      pageSize: 5,
      total: 0,
      pageCount: 0,
    });
    expect(prisma.user.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { role: 'SALES', status: 'DISABLED' },
        skip: 5,
        take: 5,
      }),
    );
  });

  it('lists only active administrators and sales assignees', async () => {
    const prisma = prismaMock();
    prisma.user.findMany.mockResolvedValue([admin]);
    await expect(
      new StaffService(prisma as never).listInquiryAssignees(),
    ).resolves.toEqual([admin]);
    expect(prisma.user.findMany).toHaveBeenCalledWith({
      where: { role: { in: ['ADMIN', 'SALES'] }, status: 'ACTIVE' },
      orderBy: [{ displayName: 'asc' }, { id: 'asc' }],
      select: { id: true, displayName: true, mobile: true },
    });
  });

  it('returns a staff detail and hides missing or customer accounts', async () => {
    const prisma = prismaMock();
    prisma.user.findFirst
      .mockResolvedValueOnce(admin)
      .mockResolvedValueOnce(null);
    const service = new StaffService(prisma as never);
    await expect(service.get('a2')).resolves.toEqual(admin);
    await expect(service.get('missing')).rejects.toMatchObject({ status: 404 });
  });

  it('maps unique staff creation failures to the stable conflict', async () => {
    const prisma = prismaMock();
    prisma.user.create.mockRejectedValue({ code: 'P2002' });
    await expect(
      new StaffService(prisma as never).create(
        {
          mobile: '09121111111',
          displayName: 'Sales',
          password: 'strong-password',
          role: StaffRoleDto.SALES,
        },
        'a1',
      ),
    ).rejects.toMatchObject({
      status: 409,
      response: expect.objectContaining({ code: 'STAFF_ACCOUNT_CONFLICT' }),
    });
  });

  it('preserves unexpected staff creation failures', async () => {
    const prisma = prismaMock();
    const failure = new Error('database unavailable');
    prisma.user.create.mockRejectedValue(failure);
    await expect(
      new StaffService(prisma as never).create(
        {
          mobile: '09121111111',
          displayName: 'Sales',
          password: 'strong-password',
          role: StaffRoleDto.SALES,
        },
        'a1',
      ),
    ).rejects.toBe(failure);
  });

  it.each([null, { ...admin, role: 'CUSTOMER' as const }])(
    'rejects a missing or customer mutation target',
    async (current) => {
      const prisma = prismaMock();
      prisma.user.findUnique.mockResolvedValue(current);
      await expect(
        new StaffService(prisma as never).changeRole('a2', 'SALES', 0, 'a1'),
      ).rejects.toMatchObject({ status: 404 });
    },
  );

  it('detects a concurrent version change at the update boundary', async () => {
    const prisma = prismaMock();
    prisma.user.findUnique.mockResolvedValue({ ...admin, role: 'SALES' });
    prisma.user.updateMany.mockResolvedValue({ count: 0 });
    await expect(
      new StaffService(prisma as never).changeRole('a2', 'OPERATOR', 0, 'a1'),
    ).rejects.toMatchObject({
      status: 409,
      response: expect.objectContaining({ code: 'STAFF_VERSION_CONFLICT' }),
    });
    expect(prisma.authSession.updateMany).not.toHaveBeenCalled();
  });

  it('updates status and records status-only audit metadata', async () => {
    const prisma = prismaMock();
    prisma.user.findUnique.mockResolvedValue({ ...admin, role: 'SALES' });
    prisma.user.updateMany.mockResolvedValue({ count: 1 });
    prisma.user.findUniqueOrThrow.mockResolvedValue({
      ...admin,
      role: 'SALES',
      status: 'DISABLED',
      version: 1,
    });
    prisma.authSession.updateMany.mockResolvedValue({ count: 1 });
    prisma.securityAuditEvent.create.mockResolvedValue({});
    await expect(
      new StaffService(prisma as never).changeStatus('a2', 'DISABLED', 0, 'a1'),
    ).resolves.toMatchObject({ status: 'DISABLED', version: 1 });
    expect(
      prisma.securityAuditEvent.create.mock.calls[0][0].data.metadata,
    ).toEqual({
      targetUserId: 'a2',
      previousStatus: 'ACTIVE',
      nextStatus: 'DISABLED',
      version: 1,
    });
  });

  it('allows an active administrator change when another active administrator remains', async () => {
    const prisma = prismaMock();
    prisma.user.findUnique.mockResolvedValue(admin);
    prisma.user.count.mockResolvedValue(2);
    prisma.user.updateMany.mockResolvedValue({ count: 1 });
    prisma.user.findUniqueOrThrow.mockResolvedValue({
      ...admin,
      role: 'SALES',
      version: 1,
    });
    prisma.authSession.updateMany.mockResolvedValue({ count: 1 });
    prisma.securityAuditEvent.create.mockResolvedValue({});
    await expect(
      new StaffService(prisma as never).changeRole('a2', 'SALES', 0, 'a1'),
    ).resolves.toMatchObject({ role: 'SALES' });
    expect(prisma.user.count).toHaveBeenCalledWith({
      where: { role: 'ADMIN', status: 'ACTIVE' },
    });
  });
});
