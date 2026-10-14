import { BadRequestException, NotFoundException } from '@nestjs/common';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { InquiryRepository } from './inquiry.repository.js';
import { InquiryService } from './inquiry.service.js';

describe('InquiryService', () => {
  let repository: InquiryRepository;
  let service: InquiryService;

  beforeEach(() => {
    repository = {
      findPublishedProduct: vi.fn(), findPublishedService: vi.fn(), findPublishedMaterial: vi.fn(),
      create: vi.fn(), list: vi.fn(), getOwned: vi.fn(),
      adminList: vi.fn(), adminSummary: vi.fn(), adminAssignees: vi.fn(), getAdmin: vi.fn(),
      adminTransitionStatus: vi.fn(), adminAssign: vi.fn(), adminAddNote: vi.fn(),
    };
    service = new InquiryService(repository);
  });

  it('requires an eligible product and snapshots its approved name', async () => {
    vi.mocked(repository.findPublishedProduct).mockResolvedValue({ id: 'p1', name: 'محصول واقعی' });
    vi.mocked(repository.create).mockResolvedValue({ id: 'i1' } as never);
    await service.createProduct('u1', { productId: 'p1', approximateQuantity: '100' });
    expect(repository.create).toHaveBeenCalledWith('u1', expect.objectContaining({ type: 'PRODUCT', productId: 'p1', catalogItemName: 'محصول واقعی' }));
  });

  it('rejects hidden catalog context and blank required free text', async () => {
    vi.mocked(repository.findPublishedProduct).mockResolvedValue(null);
    await expect(service.createProduct('u1', { productId: 'hidden' })).rejects.toBeInstanceOf(BadRequestException);
    await expect(service.createInjection('u1', { partDescription: '   ' })).rejects.toBeInstanceOf(BadRequestException);
  });

  it('uses an owner-scoped repository lookup and returns uniform not found', async () => {
    vi.mocked(repository.getOwned).mockResolvedValue(null);
    await expect(service.get('owner-a', 'owned-by-b')).rejects.toBeInstanceOf(NotFoundException);
    expect(repository.getOwned).toHaveBeenCalledWith('owner-a', 'owned-by-b');
  });
});
