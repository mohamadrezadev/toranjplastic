import type { Prisma } from '../../generated/prisma/client.js';
import type { PageResult } from './types.js';

export type AdminContentPrismaClient = Pick<
  Prisma.TransactionClient,
  | 'category'
  | 'product'
  | 'injectionService'
  | 'material'
  | 'article'
  | 'managedPage'
  | 'securityAuditEvent'
>;

export function pagination<T>(
  items: T[],
  request: { page: number; pageSize: number },
  total: number,
): PageResult<T> {
  return {
    items,
    pageInfo: {
      page: request.page,
      pageSize: request.pageSize,
      total,
      totalPages: total === 0 ? 0 : Math.ceil(total / request.pageSize),
    },
  };
}

export function windowFor({
  page,
  pageSize,
}: {
  page: number;
  pageSize: number;
}) {
  return { skip: (page - 1) * pageSize, take: pageSize };
}

export async function handleMissing<T>(
  operation: Promise<T>,
): Promise<T | null> {
  try {
    return await operation;
  } catch (error) {
    if (
      typeof error === 'object' &&
      error &&
      'code' in error &&
      error.code === 'P2025'
    )
      return null;
    throw error;
  }
}
