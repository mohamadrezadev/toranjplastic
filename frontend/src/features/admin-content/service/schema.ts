import { isImage, isNullableString, isRecord, isSpecification, isString } from '../shared/value-guards';
import { hasLifecycle } from '../shared/client';
import type { AdminInjectionService } from './types';

export function isAdminInjectionService(value: unknown): value is AdminInjectionService {
  if (!isRecord(value) || !hasLifecycle(value)) return false;
  return isString(value.name) && isString(value.slug) && isNullableString(value.summary) && isNullableString(value.description) &&
    isNullableString(value.ctaLabel) && isNullableString(value.ctaHref) && Array.isArray(value.images) && value.images.every(isImage) &&
    Array.isArray(value.specifications) && value.specifications.every(isSpecification);
}
