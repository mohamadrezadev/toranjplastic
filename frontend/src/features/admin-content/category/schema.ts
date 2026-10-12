import { isImage, isNullableString, isRecord, isString } from '../shared/value-guards';
import { hasLifecycle } from '../shared/client';
import type { AdminCategory } from './types';

export function isAdminCategory(value: unknown): value is AdminCategory {
  if (!isRecord(value) || !hasLifecycle(value)) return false;
  return isString(value.name) && isString(value.slug) && isNullableString(value.description) && (value.image === null || isImage(value.image));
}
