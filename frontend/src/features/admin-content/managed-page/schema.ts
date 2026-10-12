import { isImage, isNullableString, isRecord, isString } from '../shared/value-guards';
import { hasLifecycle } from '../shared/client';
import type { AdminManagedPage } from './types';

export function isAdminManagedPage(value: unknown): value is AdminManagedPage {
  if (!isRecord(value) || !hasLifecycle(value)) return false;
  return isString(value.title) && isString(value.slug) && isNullableString(value.summary) && isString(value.body) &&
    Array.isArray(value.images) && value.images.every(isImage);
}
