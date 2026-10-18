import type { AdminMediaAsset, AdminMediaPage, AdminMediaVariant, MediaAssetStatus, MediaVariantName } from './types';

const statuses: MediaAssetStatus[] = ['PROCESSING', 'READY', 'FAILED', 'DELETION_PENDING', 'DELETED'];
const variantNames: MediaVariantName[] = ['thumb', 'card', 'detail'];
const record = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null && !Array.isArray(value);
const nullableString = (value: unknown): value is string | null => value === null || typeof value === 'string';

function isVariant(value: unknown): value is AdminMediaVariant {
  return record(value) && variantNames.includes(value.name as MediaVariantName) &&
    typeof value.width === 'number' && typeof value.height === 'number' && typeof value.bytes === 'number';
}

export function isAdminMediaAsset(value: unknown): value is AdminMediaAsset {
  return record(value) && typeof value.id === 'string' && statuses.includes(value.status as MediaAssetStatus) &&
    nullableString(value.defaultAlt) && nullableString(value.sourceMimeType) &&
    (value.sourceWidth === null || typeof value.sourceWidth === 'number') &&
    (value.sourceHeight === null || typeof value.sourceHeight === 'number') &&
    Array.isArray(value.variants) && value.variants.every(isVariant) &&
    typeof value.referenceCount === 'number' && typeof value.createdAt === 'string' && typeof value.updatedAt === 'string';
}

export function isAdminMediaPage(value: unknown): value is AdminMediaPage {
  return record(value) && Array.isArray(value.items) && value.items.every(isAdminMediaAsset) &&
    typeof value.page === 'number' && typeof value.pageSize === 'number' &&
    typeof value.total === 'number' && typeof value.totalPages === 'number';
}
