import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { describe, expect, it, vi } from 'vitest';
import {
  CreateStaffDto,
  StaffFilterStatusDto,
  StaffIdParamDto,
  StaffListQueryDto,
  StaffRoleDto,
  StaffStatusDto,
  UpdateStaffRoleDto,
  UpdateStaffStatusDto,
} from './staff.dto.js';

describe('staff DTO validation', () => {
  it('coerces bounded pagination and accepts approved filters', async () => {
    const defaults = plainToInstance(StaffListQueryDto, {});
    expect(defaults).toMatchObject({ page: 1, pageSize: 20 });
    expect(await validate(defaults)).toEqual([]);

    const query = plainToInstance(StaffListQueryDto, {
      role: StaffRoleDto.SALES,
      status: StaffFilterStatusDto.SUSPENDED,
      page: '2',
      pageSize: '100',
    });
    expect(query).toMatchObject({ page: 2, pageSize: 100 });
    expect(await validate(query)).toEqual([]);
  });

  it('rejects invalid pagination, identifiers, roles, statuses, and fields', async () => {
    const invalidValues = [
      plainToInstance(StaffListQueryDto, {
        role: 'CUSTOMER',
        status: 'DELETED',
        page: 0,
        pageSize: 101,
      }),
      plainToInstance(StaffIdParamDto, { id: '' }),
      plainToInstance(CreateStaffDto, {
        mobile: 'x'.repeat(33),
        displayName: 'x',
        password: 'short',
        role: 'CUSTOMER',
      }),
      plainToInstance(UpdateStaffRoleDto, {
        role: 'CUSTOMER',
        expectedVersion: -1,
      }),
      plainToInstance(UpdateStaffStatusDto, {
        status: 'SUSPENDED',
        expectedVersion: -1,
      }),
    ];

    for (const value of invalidValues) {
      expect(await validate(value)).not.toHaveLength(0);
    }
  });

  it('accepts every approved staff mutation value', async () => {
    const values = [
      plainToInstance(CreateStaffDto, {
        mobile: '09121111111',
        displayName: 'کارشناس فروش',
        password: 'strong-password',
        role: StaffRoleDto.ADMIN,
      }),
      plainToInstance(UpdateStaffRoleDto, {
        role: StaffRoleDto.OPERATOR,
        expectedVersion: 0,
      }),
      plainToInstance(UpdateStaffStatusDto, {
        status: StaffStatusDto.ACTIVE,
        expectedVersion: 0,
      }),
    ];

    for (const value of values) expect(await validate(value)).toEqual([]);
  });

  it('loads decorators through the runtime fallback when Reflect.decorate is absent', async () => {
    const originalDecorate = Reflect.decorate;
    Reflect.decorate = undefined as never;
    vi.resetModules();
    try {
      const module = await import('./staff.dto.js');
      expect(new module.StaffListQueryDto()).toMatchObject({
        page: 1,
        pageSize: 20,
      });
    } finally {
      Reflect.decorate = originalDecorate;
      vi.resetModules();
    }
  });
});
