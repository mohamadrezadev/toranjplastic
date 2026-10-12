import { ConflictException, NotFoundException } from '@nestjs/common';
import type { ContentStatus } from '../../generated/prisma/enums.js';
import { recordAuditEvent, type AuditEventWriter } from '../../audit/audit.js';

export interface LifecycleRecord {
  id: string;
  slug: string;
  status: ContentStatus;
}

export function requireFound<T>(value: T | null): T {
  if (value === null) throw new NotFoundException('محتوا یافت نشد.');
  return value;
}

function isUniqueConstraintError(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as { code: unknown }).code === 'P2002'
  );
}

export async function withConflictHandling<T>(
  operation: () => Promise<T>,
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    if (isUniqueConstraintError(error))
      throw new ConflictException('اسلاگ وارد شده قبلاً استفاده شده است.');
    throw error;
  }
}

export async function recordContentAudit(
  audit: AuditEventWriter,
  action: string,
  actorId: string,
  record: LifecycleRecord,
  fromStatus?: ContentStatus,
) {
  const entity = action
    .split('_')
    .slice(0, -1)
    .map((part) => part.charAt(0) + part.slice(1).toLowerCase())
    .join('');
  return recordAuditEvent(audit, action, actorId, {
    entity,
    id: record.id,
    slug: record.slug,
    ...(fromStatus === undefined
      ? {}
      : { fromStatus, toStatus: record.status }),
  });
}

export async function transitionStatus<T extends LifecycleRecord>(options: {
  id: string;
  target: ContentStatus;
  publishedAt: Date | null;
  actorId: string;
  action: string;
  audit: AuditEventWriter;
  get: (id: string) => Promise<T | null>;
  setStatus: (
    id: string,
    status: ContentStatus,
    publishedAt: Date | null,
  ) => Promise<T | null>;
}): Promise<T> {
  const current = requireFound(await options.get(options.id));
  if (current.status === options.target) {
    await recordContentAudit(
      options.audit,
      options.action,
      options.actorId,
      current,
      current.status,
    );
    return current;
  }
  const updated = requireFound(
    await options.setStatus(options.id, options.target, options.publishedAt),
  );
  await recordContentAudit(
    options.audit,
    options.action,
    options.actorId,
    updated,
    current.status,
  );
  return updated;
}
