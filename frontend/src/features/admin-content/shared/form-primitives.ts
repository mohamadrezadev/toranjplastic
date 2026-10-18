import { AdminContentError } from './errors';
import type { PublicImage, PublicSpecification } from '@/lib/public-content';

export function text(form: FormData, name: string): string {
  return String(form.get(name) ?? '').trim();
}

export function optionalText(form: FormData, name: string): string | null {
  const value = text(form, name);
  return value === '' ? null : value;
}

export function optionalInteger(form: FormData, name: string): number | undefined {
  const value = text(form, name);
  if (value === '') return undefined;
  const parsed = Number(value);
  return Number.isInteger(parsed) ? parsed : undefined;
}

export type ContentImageInput =
  | PublicImage
  | { mediaAssetId: string; alt: string };

export function singleImage(form: FormData, prefix: string): PublicImage | null {
  const url = text(form, `${prefix}Url`);
  const alt = text(form, `${prefix}Alt`);
  return url === '' && alt === '' ? null : { url, alt };
}

export function imageRows(form: FormData): PublicImage[] {
  const images: PublicImage[] = [];
  for (let index = 1; index <= 6; index += 1) {
    const image = singleImage(form, `image${index}`);
    if (image) images.push(image);
  }
  return images;
}

export function managedImageRows(form: FormData): ContentImageInput[] {
  const images: ContentImageInput[] = [];
  for (let index = 1; index <= 6; index += 1) {
    const prefix = `image${index}`;
    if (form.get(`${prefix}Remove`) === 'on') continue;
    const mediaAssetId = text(form, `${prefix}MediaAssetId`);
    const alt = text(form, `${prefix}Alt`);
    const image = mediaAssetId ? { mediaAssetId, alt } : singleImage(form, prefix);
    if (image) images.push(image);
  }
  return images;
}

export function managedSingleImage(form: FormData, prefix: string): ContentImageInput | null {
  if (form.get(`${prefix}Clear`) === 'on') return null;
  const mediaAssetId = text(form, `${prefix}MediaAssetId`);
  return mediaAssetId
    ? { mediaAssetId, alt: text(form, `${prefix}Alt`) }
    : singleImage(form, prefix);
}

export function specificationRows(form: FormData): PublicSpecification[] {
  const specifications: PublicSpecification[] = [];
  for (let index = 1; index <= 10; index += 1) {
    const label = text(form, `spec${index}Label`);
    const value = text(form, `spec${index}Value`);
    if (label !== '' || value !== '') specifications.push({ label, value });
  }
  return specifications;
}

export function errorKind(error: unknown): string {
  return error instanceof AdminContentError ? error.kind : 'failed';
}
