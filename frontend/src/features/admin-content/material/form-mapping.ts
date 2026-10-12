import type { MaterialInput } from './types';
import { imageRows, optionalText, specificationRows, text } from '../shared/form-primitives';

export function materialInputFromForm(form: FormData): MaterialInput {
  return { name: text(form, 'name'), slug: text(form, 'slug'), family: optionalText(form, 'family'), grade: optionalText(form, 'grade'), manufacturer: optionalText(form, 'manufacturer'), summary: optionalText(form, 'summary'), description: optionalText(form, 'description'), images: imageRows(form), specifications: specificationRows(form), inquiryAvailable: form.get('inquiryAvailable') === 'on', metaTitle: optionalText(form, 'metaTitle'), metaDescription: optionalText(form, 'metaDescription') };
}
