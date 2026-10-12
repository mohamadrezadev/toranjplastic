import { isImage, isNullableString, isRecord, isString } from '../shared/value-guards';
import { hasLifecycle } from '../shared/client';
import type { AdminArticle } from './types';

export function isAdminArticle(value: unknown): value is AdminArticle {
  if (!isRecord(value) || !hasLifecycle(value)) return false;
  return isString(value.title) && isString(value.slug) && isNullableString(value.summary) && isString(value.body) &&
    (value.featuredImage === null || isImage(value.featuredImage));
}
