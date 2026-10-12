import { AdminContentError } from './errors';
import type { PublicImage, PublicSpecification } from '@/lib/public-content';

export function text(form: FormData, name: string): string {
  return String(form.get(name) ?? '').trim();
}

export function optionalText(form: FormData, name: string): string | null {
  const value = text(form, name);
  return value === '' ? null : value;
}

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
