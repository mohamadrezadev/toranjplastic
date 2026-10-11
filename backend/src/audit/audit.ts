import type { Prisma } from '../generated/prisma/client.js';

export interface AuditEventWriter {
  securityAuditEvent: {
    create(args: {
      data: { action: string; userId: string | null; metadata?: Prisma.InputJsonValue };
    }): Promise<unknown>;
  };
}

export function recordAuditEvent(
  client: AuditEventWriter,
  action: string,
  userId: string | null,
  metadata?: Record<string, unknown>,
) {
  return client.securityAuditEvent.create({ data: { action, userId, metadata: metadata as Prisma.InputJsonValue | undefined } });
}
