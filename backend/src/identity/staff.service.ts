import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import type { AccountStatus, UserRole } from '../generated/prisma/enums.js';
import type { Prisma } from '../generated/prisma/client.js';
import { recordAuditEvent } from '../audit/audit.js';
import { PrismaService } from '../database/prisma.service.js';
import { hashPassword, normalizeIranianMobile } from './identity.security.js';
import type { CreateStaffDto, StaffListQueryDto } from './dto/staff.dto.js';

const staffRoles = ['ADMIN', 'SALES', 'OPERATOR'] as const;
const staffSelect = {
  id: true, mobile: true, displayName: true, role: true, status: true, version: true,
  createdAt: true, updatedAt: true, lastLoginAt: true,
} satisfies Prisma.UserSelect;

const conflict = (code: string, message: string) => new ConflictException({ code, message });

@Injectable()
export class StaffService {
  constructor(private readonly prisma: PrismaService) {}

  async list(query: StaffListQueryDto) {
    const where: Prisma.UserWhereInput = {
      role: query.role ?? { in: [...staffRoles] },
      ...(query.status ? { status: query.status } : {}),
    };
    const [total, items] = await Promise.all([
      this.prisma.user.count({ where }),
      this.prisma.user.findMany({ where, select: staffSelect, orderBy: [{ createdAt: 'desc' }, { id: 'asc' }], skip: (query.page - 1) * query.pageSize, take: query.pageSize }),
    ]);
    return { items, page: query.page, pageSize: query.pageSize, total, pageCount: Math.ceil(total / query.pageSize) };
  }

  listInquiryAssignees() {
    return this.prisma.user.findMany({
      where: { role: { in: ['ADMIN', 'SALES'] }, status: 'ACTIVE' },
      orderBy: [{ displayName: 'asc' }, { id: 'asc' }],
      select: { id: true, displayName: true, mobile: true },
    });
  }

  async get(id: string) {
    const item = await this.prisma.user.findFirst({ where: { id, role: { in: [...staffRoles] } }, select: staffSelect });
    if (!item) throw new NotFoundException('کارمند پیدا نشد.');
    return item;
  }

  async create(input: CreateStaffDto, actorId: string) {
    const mobile = normalizeIranianMobile(input.mobile);
    const passwordHash = await hashPassword(input.password);
    try {
      return await this.prisma.$transaction(async (transaction) => {
        const user = await transaction.user.create({ data: { mobile, displayName: input.displayName.trim(), role: input.role, status: 'ACTIVE', password: { create: { passwordHash } } }, select: staffSelect });
        await recordAuditEvent(transaction, 'STAFF_CREATED', actorId, { targetUserId: user.id, role: user.role, version: user.version });
        return user;
      });
    } catch (error) {
      if (typeof error === 'object' && error && 'code' in error && error.code === 'P2002') throw conflict('STAFF_ACCOUNT_CONFLICT', 'امکان ایجاد حساب با اطلاعات واردشده وجود ندارد.');
      throw error;
    }
  }

  changeRole(id: string, role: UserRole, expectedVersion: number, actorId: string) {
    return this.mutate(id, { role }, expectedVersion, actorId, 'STAFF_ROLE_CHANGED');
  }

  changeStatus(id: string, status: AccountStatus, expectedVersion: number, actorId: string) {
    return this.mutate(id, { status }, expectedVersion, actorId, 'STAFF_STATUS_CHANGED');
  }

  private async mutate(id: string, change: { role?: UserRole; status?: AccountStatus }, expectedVersion: number, actorId: string, action: string) {
    if (id === actorId) throw new ForbiddenException({ code: 'STAFF_SELF_CHANGE_FORBIDDEN', message: 'تغییر نقش یا وضعیت حساب جاری مجاز نیست.' });
    return this.prisma.$transaction(async (transaction) => {
      await transaction.$executeRawUnsafe('SELECT pg_advisory_xact_lock($1)', 20261015);
      const current = await transaction.user.findUnique({ where: { id }, select: staffSelect });
      if (!current || current.role === 'CUSTOMER') throw new NotFoundException('کارمند پیدا نشد.');
      if (current.version !== expectedVersion) throw conflict('STAFF_VERSION_CONFLICT', 'اطلاعات این کارمند تغییر کرده است.');
      const removesActiveAdmin = current.role === 'ADMIN' && current.status === 'ACTIVE' && (change.role && change.role !== 'ADMIN' || change.status && change.status !== 'ACTIVE');
      if (removesActiveAdmin && await transaction.user.count({ where: { role: 'ADMIN', status: 'ACTIVE' } }) <= 1) {
        throw conflict('STAFF_LAST_ADMIN_CONFLICT', 'آخرین مدیر فعال را نمی‌توان غیرفعال یا تنزل داد.');
      }
      const updatedCount = await transaction.user.updateMany({ where: { id, version: expectedVersion }, data: { ...change, version: { increment: 1 } } });
      if (updatedCount.count !== 1) throw conflict('STAFF_VERSION_CONFLICT', 'اطلاعات این کارمند تغییر کرده است.');
      await transaction.authSession.updateMany({ where: { userId: id, revokedAt: null }, data: { revokedAt: new Date() } });
      const updated = await transaction.user.findUniqueOrThrow({ where: { id }, select: staffSelect });
      await recordAuditEvent(transaction, action, actorId, {
        targetUserId: id,
        ...(change.role ? { previousRole: current.role, nextRole: updated.role } : {}),
        ...(change.status ? { previousStatus: current.status, nextStatus: updated.status } : {}),
        version: updated.version,
      });
      return updated;
    });
  }
}
