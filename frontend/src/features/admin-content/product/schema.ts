import { isImage, isNullableString, isRecord, isSpecification, isString } from '../shared/value-guards';
import { hasLifecycle } from '../shared/client';
import type { AdminProduct } from './types';

export function isAdminProduct(value: unknown): value is AdminProduct {
  if (!isRecord(value) || !hasLifecycle(value)) return false;
  return isString(value.name) && isString(value.slug) && isNullableString(value.summary) && isNullableString(value.description) &&
    (value.categoryId === null || isString(value.categoryId)) && typeof value.featured === 'boolean' &&
    Array.isArray(value.images) && value.images.every(isImage) && Array.isArray(value.specifications) && value.specifications.every(isSpecification);
}
