import { ConflictException, NotFoundException } from '@nestjs/common';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { InquiryRepository } from '../inquiry.repository.js';
import type { AdminInquiry } from '../inquiry.types.js';
import { AdminInquiryService } from './admin-inquiry.service.js';
import { allowedInquiryTransitions } from './inquiry-transition.policy.js';

const inquiry = (overrides: Partial<AdminInquiry> = {}): AdminInquiry => ({
  id: 'i1', type: 'PRODUCT', status: 'SUBMITTED', version: 0, catalogItemName: 'محصول',
  description: null, approximateQuantity: null, quantityUnit: null, deliveryCity: null,
  requestedTiming: null, partDescription: null, moldStatus: null, materialName: null,
  color: null, materialRequestKind: null, polymerName: null, grade: null, brand: null,
  materialCondition: null, application: null, specifications: null,
  createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
  ownerSummary: { id: 'c1', displayName: 'مشتری', mobile: '+989123456789', companyName: null },
  assigneeSummary: null, statusHistory: [], assignmentHistory: [], internalNotes: [], messages: [],
  allowedTransitions: ['UNDER_REVIEW', 'REJECTED'], ...overrides,
});

describe('admin inquiry transition policy', () => {
  it('keeps quotation, messaging and cancellation states unreachable', () => {
    expect(allowedInquiryTransitions('PRODUCT', 'SUBMITTED')).toEqual(['UNDER_REVIEW', 'REJECTED']);
    expect(allowedInquiryTransitions('PRODUCT', 'UNDER_REVIEW')).toEqual(['REJECTED']);
    expect(allowedInquiryTransitions('GENERAL_CONTACT', 'UNDER_REVIEW')).toEqual(['COMPLETED', 'REJECTED']);
    expect(allowedInquiryTransitions('PRODUCT', 'ACCEPTED')).toEqual(['IN_PROGRESS']);
    expect(allowedInquiryTransitions('PRODUCT', 'IN_PROGRESS')).toEqual(['COMPLETED']);
    expect(allowedInquiryTransitions('PRODUCT', 'REJECTED')).toEqual([]);
  });
});

describe('AdminInquiryService', () => {
  let repository: InquiryRepository;
  let service: AdminInquiryService;

  beforeEach(() => {
    repository = {
      findPublishedProduct: vi.fn(), findPublishedService: vi.fn(), findPublishedMaterial: vi.fn(),
      create: vi.fn(), list: vi.fn(), getOwned: vi.fn(), customerAddMessage: vi.fn(), adminList: vi.fn(), adminSummary: vi.fn(),
      adminAssignees: vi.fn(), getAdmin: vi.fn(), adminTransitionStatus: vi.fn(), adminAssign: vi.fn(), adminAddNote: vi.fn(), adminAddMessage: vi.fn(),
    };
    service = new AdminInquiryService(repository, { listInquiryAssignees: () => repository.adminAssignees() } as never);
  });

  it('returns safe not found and rejects invalid transitions before persistence', async () => {
    vi.mocked(repository.getAdmin).mockResolvedValue(null);
    await expect(service.get('missing')).rejects.toBeInstanceOf(NotFoundException);
    vi.mocked(repository.getAdmin).mockResolvedValue(inquiry({ status: 'REJECTED', allowedTransitions: [] }));
    await expect(service.transition('i1', 'UNDER_REVIEW', 0, 'a1')).rejects.toMatchObject({ response: expect.objectContaining({ code: 'INQUIRY_INVALID_TRANSITION' }) });
    expect(repository.adminTransitionStatus).not.toHaveBeenCalled();
  });

  it('maps version and assignee failures to stable conflict codes', async () => {
    vi.mocked(repository.getAdmin).mockResolvedValue(inquiry());
    vi.mocked(repository.adminTransitionStatus).mockResolvedValue({ kind: 'version_conflict' });
    await expect(service.transition('i1', 'UNDER_REVIEW', 0, 'a1')).rejects.toMatchObject({ response: expect.objectContaining({ code: 'INQUIRY_VERSION_CONFLICT' }) });
    vi.mocked(repository.adminAssign).mockResolvedValue({ kind: 'invalid_assignee' });
    await expect(service.assign('i1', 'customer', 0, 'a1')).rejects.toBeInstanceOf(ConflictException);
  });

  it('returns an unchanged assignment and maps missing mutation targets', async () => {
    const assigned = inquiry({
      assigneeSummary: { id: 'sales-1', displayName: 'فروش', mobile: '+989121111111' },
    });
    vi.mocked(repository.getAdmin).mockResolvedValue(assigned);
    await expect(service.assign('i1', 'sales-1', 0, 'a1')).resolves.toEqual(assigned);
    expect(repository.adminAssign).not.toHaveBeenCalled();

    vi.mocked(repository.adminAddNote).mockResolvedValue({ kind: 'not_found' });
    await expect(service.addNote('missing', 'یادداشت', 'a1')).rejects.toBeInstanceOf(NotFoundException);
  });

  it('normalizes list filters and delegates summary and eligible assignees', async () => {
    vi.mocked(repository.adminList).mockResolvedValue({
      items: [], page: 2, pageSize: 10, total: 0, pageCount: 0,
    });
    vi.mocked(repository.adminSummary).mockResolvedValue({
      total: 2, unassigned: 1, submitted: 1, underReview: 1,
    });
    vi.mocked(repository.adminAssignees).mockResolvedValue([]);

    await service.list({
      page: 2,
      pageSize: 10,
      from: '2026-10-01T00:00:00.000Z',
      to: '2026-11-01T00:00:00.000Z',
      q: '  09121111111  ',
    });
    await expect(service.summary()).resolves.toMatchObject({ total: 2 });
    await expect(service.assignees()).resolves.toEqual([]);

    expect(repository.adminList).toHaveBeenCalledWith(
      expect.objectContaining({
        page: 2,
        pageSize: 10,
        from: new Date('2026-10-01T00:00:00.000Z'),
        to: new Date('2026-11-01T00:00:00.000Z'),
        q: '09121111111',
      }),
    );
  });

  it('trims notes and does not require or change inquiry version', async () => {
    vi.mocked(repository.adminAddNote).mockResolvedValue({ kind: 'ok', inquiry: inquiry() });
    await service.addNote('i1', '  یادداشت داخلی  ', 'a1');
    expect(repository.adminAddNote).toHaveBeenCalledWith('i1', 'یادداشت داخلی', 'a1');
  });

  it('rejects whitespace-only notes as validation errors', async () => {
    await expect(service.addNote('i1', '   ', 'a1')).rejects.toMatchObject({ status: 400 });
    expect(repository.adminAddNote).not.toHaveBeenCalled();
  });

  it('requires an under-review current version for an information request message', async () => {
    vi.mocked(repository.getAdmin).mockResolvedValue(inquiry({ status: 'SUBMITTED' }));
    await expect(service.addMessage('i1', 'اطلاعات بیشتری ارسال کنید', 'a1', true, 0)).rejects.toMatchObject({ response: expect.objectContaining({ code: 'INQUIRY_MESSAGE_NOT_ALLOWED' }) });
    expect(repository.adminAddMessage).not.toHaveBeenCalled();
  });

  it('rejects empty and terminal-state customer-visible messages', async () => {
    await expect(
      service.addMessage('i1', '   ', 'a1', false),
    ).rejects.toMatchObject({ status: 400 });
    vi.mocked(repository.getAdmin).mockResolvedValue(
      inquiry({ status: 'COMPLETED' }),
    );
    await expect(
      service.addMessage('i1', 'پیام', 'a1', false),
    ).rejects.toMatchObject({
      response: expect.objectContaining({ code: 'INQUIRY_MESSAGE_NOT_ALLOWED' }),
    });
    expect(repository.adminAddMessage).not.toHaveBeenCalled();
  });

  it('keeps a customer-visible message separate from notes', async () => {
    const current = inquiry({ status: 'UNDER_REVIEW', version: 1 });
    vi.mocked(repository.getAdmin).mockResolvedValue(current);
    vi.mocked(repository.adminAddMessage).mockResolvedValue({ kind: 'ok', inquiry: { ...current, status: 'NEED_MORE_INFO', version: 2 } });
    await service.addMessage('i1', '  لطفاً مشخصات را ارسال کنید  ', 'a1', true, 1);
    expect(repository.adminAddMessage).toHaveBeenCalledWith('i1', 'لطفاً مشخصات را ارسال کنید', 'a1', true, 1);
    expect(repository.adminAddNote).not.toHaveBeenCalled();
  });
});
