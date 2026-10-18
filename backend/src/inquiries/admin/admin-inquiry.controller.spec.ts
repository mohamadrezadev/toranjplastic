import { describe, expect, it, vi } from 'vitest';
import type { AuthenticatedRequest } from '../../identity/identity.types.js';
import { AdminInquiryController } from './admin-inquiry.controller.js';

const request = {
  auth: { account: { id: 'sales-1' } },
} as unknown as AuthenticatedRequest;

describe('AdminInquiryController', () => {
  it('delegates every inquiry operation with bounded arguments', async () => {
    const inquiries = {
      list: vi.fn().mockResolvedValue('list'),
      summary: vi.fn().mockResolvedValue('summary'),
      assignees: vi.fn().mockResolvedValue('assignees'),
      get: vi.fn().mockResolvedValue('detail'),
      assign: vi.fn().mockResolvedValue('assigned'),
      transition: vi.fn().mockResolvedValue('transitioned'),
      addNote: vi.fn().mockResolvedValue('noted'),
      addMessage: vi.fn().mockResolvedValue('messaged'),
    };
    const controller = new AdminInquiryController(inquiries as never);
    const query = { page: 1, pageSize: 20 };

    await expect(controller.list(query)).resolves.toBe('list');
    await expect(controller.summary()).resolves.toBe('summary');
    await expect(controller.assignees()).resolves.toBe('assignees');
    await expect(controller.get({ id: 'inquiry-1' })).resolves.toBe('detail');
    await expect(
      controller.assign(
        { id: 'inquiry-1' },
        { assignedAdminId: null, expectedVersion: 1 },
        request,
      ),
    ).resolves.toBe('assigned');
    await expect(
      controller.status(
        { id: 'inquiry-1' },
        { toStatus: 'UNDER_REVIEW', expectedVersion: 2 },
        request,
      ),
    ).resolves.toBe('transitioned');
    await expect(
      controller.note({ id: 'inquiry-1' }, { text: 'یادداشت' }, request),
    ).resolves.toBe('noted');
    await expect(
      controller.message(
        { id: 'inquiry-1' },
        {
          text: 'پیام',
          requestMoreInfo: true,
          expectedVersion: 3,
        },
        request,
      ),
    ).resolves.toBe('messaged');

    expect(inquiries.assign).toHaveBeenCalledWith(
      'inquiry-1',
      null,
      1,
      'sales-1',
    );
    expect(inquiries.transition).toHaveBeenCalledWith(
      'inquiry-1',
      'UNDER_REVIEW',
      2,
      'sales-1',
    );
    expect(inquiries.addNote).toHaveBeenCalledWith(
      'inquiry-1',
      'یادداشت',
      'sales-1',
    );
    expect(inquiries.addMessage).toHaveBeenCalledWith(
      'inquiry-1',
      'پیام',
      'sales-1',
      true,
      3,
    );
  });
});
