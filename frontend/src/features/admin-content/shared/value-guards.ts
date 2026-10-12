import type { PublicImage, PublicSpecification } from '@/lib/public-content';

export type RecordValue = Record<string, unknown>;

export function isRecord(value: unknown): value is RecordValue {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function isString(value: unknown): value is string {
  return typeof value === 'string';
}

export function isNullableString(value: unknown): value is string | null {
  return value === null || isString(value);
}

function isPositiveInteger(value: unknown): value is number {
  return Number.isInteger(value) && Number(value) > 0;
}

export function isImage(value: unknown): value is PublicImage {
  if (!isRecord(value) || !isString(value.url) || !isString(value.alt)) return false;
  return (value.width === undefined || isPositiveInteger(value.width)) && (value.height === undefined || isPositiveInteger(value.height));
}

export function isSpecification(value: unknown): value is PublicSpecification {
  return isRecord(value) && isString(value.label) && isString(value.value);
}
