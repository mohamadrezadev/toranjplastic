import 'reflect-metadata';
import { describe, expect, it, vi } from 'vitest';
import { StaffRoleDto, StaffStatusDto } from './dto/staff.dto.js';
import type { AuthenticatedRequest } from './identity.types.js';
import { StaffController } from './staff.controller.js';

const request = {
  auth: { account: { id: 'admin-1' } },
} as unknown as AuthenticatedRequest;

describe('StaffController', () => {
  it('delegates every staff query and command with the authenticated actor', async () => {
    const staff = {
      list: vi.fn().mockResolvedValue('list'),
      get: vi.fn().mockResolvedValue('detail'),
      create: vi.fn().mockResolvedValue('created'),
      changeRole: vi.fn().mockResolvedValue('role'),
      changeStatus: vi.fn().mockResolvedValue('status'),
    };
    const controller = new StaffController(staff as never);

    const query = { page: 1, pageSize: 20 };
    const create = {
      mobile: '09121111111',
      displayName: 'کارشناس',
      password: 'strong-password',
      role: StaffRoleDto.SALES,
    };

    await expect(controller.list(query)).resolves.toBe('list');
    await expect(controller.get({ id: 'staff-1' })).resolves.toBe('detail');
    await expect(controller.create(create, request)).resolves.toBe('created');
    await expect(
      controller.role(
        { id: 'staff-1' },
        { role: StaffRoleDto.OPERATOR, expectedVersion: 2 },
        request,
      ),
    ).resolves.toBe('role');
    await expect(
      controller.status(
        { id: 'staff-1' },
        { status: StaffStatusDto.DISABLED, expectedVersion: 3 },
        request,
      ),
    ).resolves.toBe('status');

    expect(staff.list).toHaveBeenCalledWith(query);
    expect(staff.get).toHaveBeenCalledWith('staff-1');
    expect(staff.create).toHaveBeenCalledWith(create, 'admin-1');
    expect(staff.changeRole).toHaveBeenCalledWith(
      'staff-1',
      'OPERATOR',
      2,
      'admin-1',
    );
    expect(staff.changeStatus).toHaveBeenCalledWith(
      'staff-1',
      'DISABLED',
      3,
      'admin-1',
    );
  });
});
