import { BadRequestException, ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { InquiryStatus } from '../../generated/prisma/enums.js';
import { INQUIRY_REPOSITORY, type InquiryRepository } from '../inquiry.repository.js';
import type { AdminInquiry, AdminInquiryListQuery } from '../inquiry.types.js';
import type { AdminInquiryListQueryDto } from './admin-inquiry.dto.js';
import { allowedInquiryTransitions, canTransitionInquiry } from './inquiry-transition.policy.js';
import { StaffService } from '../../identity/staff.service.js';

const conflict = (code: string, message: string) => new ConflictException({ code, message });

@Injectable()
export class AdminInquiryService {
  constructor(@Inject(INQUIRY_REPOSITORY) private readonly inquiries: InquiryRepository, private readonly staff: StaffService) {}

  list(query: AdminInquiryListQueryDto) {
    const normalized: AdminInquiryListQuery = {
      page: query.page,
      pageSize: query.pageSize,
      type: query.type,
      status: query.status,
      assignedAdminId: query.assignedAdminId,
      unassigned: query.unassigned,
      from: query.from ? new Date(query.from) : undefined,
      to: query.to ? new Date(query.to) : undefined,
      q: query.q?.trim() || undefined,
    };
    return this.inquiries.adminList(normalized);
  }

  summary() { return this.inquiries.adminSummary(); }
  assignees() { return this.staff.listInquiryAssignees(); }

  async get(id: string): Promise<AdminInquiry> {
    const inquiry = await this.inquiries.getAdmin(id);
    if (!inquiry) throw new NotFoundException('درخواست پیدا نشد.');
    return { ...inquiry, allowedTransitions: allowedInquiryTransitions(inquiry.type, inquiry.status) };
  }

  async transition(id: string, toStatus: InquiryStatus, expectedVersion: number, actorId: string) {
    const current = await this.get(id);
    if (!canTransitionInquiry(current.type, current.status, toStatus)) {
      throw conflict('INQUIRY_INVALID_TRANSITION', 'انتقال وضعیت انتخاب‌شده مجاز نیست.');
    }
    const result = await this.inquiries.adminTransitionStatus(id, expectedVersion, toStatus, actorId);
    return this.resolve(result);
  }

  async assign(id: string, assignedAdminId: string | null, expectedVersion: number, actorId: string) {
    const current = await this.get(id);
    if ((current.assigneeSummary?.id ?? null) === assignedAdminId) return current;
    const result = await this.inquiries.adminAssign(id, expectedVersion, assignedAdminId, actorId);
    return this.resolve(result);
  }

  async addNote(id: string, text: string, actorId: string) {
    const normalized = text.trim();
    if (!normalized) throw new BadRequestException({ code: 'INQUIRY_INVALID_NOTE', message: 'متن یادداشت نمی‌تواند خالی باشد.' });
    return this.resolve(await this.inquiries.adminAddNote(id, normalized, actorId));
  }

  async addMessage(id: string, text: string, actorId: string, requestMoreInfo: boolean, expectedVersion?: number) {
    const normalized = text.trim();
    if (!normalized) throw new BadRequestException({ code: 'INQUIRY_INVALID_MESSAGE', message: 'متن پیام نمی‌تواند خالی باشد.' });
    const current = await this.get(id);
    if (['COMPLETED', 'REJECTED', 'CANCELLED'].includes(current.status)) {
      throw conflict('INQUIRY_MESSAGE_NOT_ALLOWED', 'ارسال پیام برای این درخواست مجاز نیست.');
    }
    if (requestMoreInfo && (expectedVersion === undefined || current.status !== 'UNDER_REVIEW')) {
      throw conflict('INQUIRY_MESSAGE_NOT_ALLOWED', 'درخواست اطلاعات تکمیلی فقط در وضعیت بررسی و با نسخه فعلی مجاز است.');
    }
    return this.resolve(await this.inquiries.adminAddMessage(id, normalized, actorId, requestMoreInfo, expectedVersion));
  }

  private resolve(result: Awaited<ReturnType<InquiryRepository['adminAssign']>>) {
    if (result.kind === 'ok') return { ...result.inquiry, allowedTransitions: allowedInquiryTransitions(result.inquiry.type, result.inquiry.status) };
    if (result.kind === 'not_found') throw new NotFoundException('درخواست پیدا نشد.');
    if (result.kind === 'invalid_assignee') throw conflict('INQUIRY_INVALID_ASSIGNEE', 'مسئول انتخاب‌شده یک مدیر فعال نیست.');
    throw conflict('INQUIRY_VERSION_CONFLICT', 'این درخواست توسط شخص دیگری تغییر کرده است.');
  }
}
