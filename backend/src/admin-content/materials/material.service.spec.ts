import { describe, expect, it, vi } from 'vitest';
import type { AuditEventWriter } from '../../audit/audit.js';
import { ContentStatus } from '../../generated/prisma/enums.js';
import type { AdminContentUnitOfWork } from '../unit-of-work.js';
import { AdminMaterialService } from './material.service.js';
import type { AdminMaterialRepository } from './repository.js';

const record = {
  id: 'material-1',
  name: 'ماده',
  slug: 'material',
  family: null,
  grade: null,
  manufacturer: null,
  summary: null,
  description: null,
  images: [],
  specifications: [],
  inquiryAvailable: true,
  displayOrder: 0,
  status: ContentStatus.DRAFT,
  publishedAt: null,
  createdAt: '2026-10-11T00:00:00.000Z',
  updatedAt: '2026-10-11T00:00:00.000Z',
  metaTitle: null,
  metaDescription: null,
};
function fixture(overrides: Partial<AdminMaterialRepository> = {}) {
  const create = vi.fn(async () => record);
  const update = vi.fn(async () => record);
  const repository: AdminMaterialRepository = {
    list: vi.fn(),
    get: vi.fn(async () => record),
    create,
    update,
    setStatus: vi.fn(),
    ...overrides,
  };
  const auditCreate = vi.fn(async () => ({}));
  const audit = {
    securityAuditEvent: { create: auditCreate },
  } as AuditEventWriter;
  const unitOfWork = {
    run: vi.fn(async (work: (context: unknown) => Promise<unknown>) =>
      work({ materials: repository, audit }),
    ),
  } as unknown as AdminContentUnitOfWork;
  return {
    service: new AdminMaterialService(repository, unitOfWork),
    create,
    update,
    auditCreate,
  };
}

describe('AdminMaterialService', () => {
  it('creates a material with resource-specific defaults and audit', async () => {
    const { service, create, auditCreate } = fixture();
    await service.create(
      { name: ' ماده ', slug: 'material', family: ' پلیمر ' },
      'admin-1',
    );
    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'ماده',
        family: 'پلیمر',
        inquiryAvailable: true,
      }),
    );
    expect(auditCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({ action: 'MATERIAL_CREATED' }),
    });
  });
  it('updates material attributes and audits', async () => {
    const { service, update, auditCreate } = fixture();
    await service.update(
      record.id,
      { grade: ' A ', inquiryAvailable: false },
      'admin-1',
    );
    expect(update).toHaveBeenCalledWith(record.id, {
      grade: 'A',
      inquiryAvailable: false,
    });
    expect(auditCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({ action: 'MATERIAL_UPDATED' }),
    });
  });
  it('audits an idempotent archive without writing status', async () => {
    const archived = { ...record, status: ContentStatus.ARCHIVED };
    const setStatus = vi.fn();
    const { service, auditCreate } = fixture({
      get: vi.fn(async () => archived),
      setStatus,
    });
    await service.archive(record.id, 'admin-1');
    expect(setStatus).not.toHaveBeenCalled();
    expect(auditCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({ action: 'MATERIAL_ARCHIVED' }),
    });
  });
});
