import { isImage, isNullableString, isRecord, isSpecification, isString } from '../shared/value-guards';
import { hasLifecycle } from '../shared/client';
import type { AdminMaterial } from './types';

export function isAdminMaterial(value: unknown): value is AdminMaterial {
  if (!isRecord(value) || !hasLifecycle(value)) return false;
  return isString(value.name) && isString(value.slug) && isNullableString(value.family) && isNullableString(value.grade) &&
    isNullableString(value.manufacturer) && isNullableString(value.summary) && isNullableString(value.description) &&
    typeof value.inquiryAvailable === 'boolean' && Array.isArray(value.images) && value.images.every(isImage) &&
    Array.isArray(value.specifications) && value.specifications.every(isSpecification);
}
