import type { ProductInput } from './types';
import { imageRows, optionalText, specificationRows, text } from '../shared/form-primitives';

export function productInputFromForm(form: FormData): ProductInput {
  const categoryId = text(form, 'categoryId');
  return { name: text(form, 'name'), slug: text(form, 'slug'), summary: optionalText(form, 'summary'), description: optionalText(form, 'description'), categoryId: categoryId === '' ? null : categoryId, images: imageRows(form), specifications: specificationRows(form), featured: form.get('featured') === 'on', metaTitle: optionalText(form, 'metaTitle'), metaDescription: optionalText(form, 'metaDescription') };
}
