import type { ProductInput } from './types';
import { managedImageRows, optionalInteger, optionalText, specificationRows, text } from '../shared/form-primitives';

export function productInputFromForm(form: FormData): ProductInput {
  const categoryId = text(form, 'categoryId');
  return { name: text(form, 'name'), slug: text(form, 'slug'), summary: optionalText(form, 'summary'), description: optionalText(form, 'description'), categoryId: categoryId === '' ? null : categoryId, images: managedImageRows(form), specifications: specificationRows(form), featured: form.get('featured') === 'on', metaTitle: optionalText(form, 'metaTitle'), metaDescription: optionalText(form, 'metaDescription'), expectedVersion: optionalInteger(form, 'expectedVersion') };
}
