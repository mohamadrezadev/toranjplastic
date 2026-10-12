import type { CategoryInput } from './types';
import { optionalText, singleImage, text } from '../shared/form-primitives';

export function categoryInputFromForm(form: FormData): CategoryInput {
  return { name: text(form, 'name'), slug: text(form, 'slug'), description: optionalText(form, 'description'), image: singleImage(form, 'image'), metaTitle: optionalText(form, 'metaTitle'), metaDescription: optionalText(form, 'metaDescription') };
}
