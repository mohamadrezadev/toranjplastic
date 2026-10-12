import type { ManagedPageInput } from './types';
import { imageRows, optionalText, text } from '../shared/form-primitives';

export function managedPageInputFromForm(form: FormData): ManagedPageInput {
  return { title: text(form, 'title'), slug: text(form, 'slug'), summary: optionalText(form, 'summary'), body: text(form, 'body'), images: imageRows(form), metaTitle: optionalText(form, 'metaTitle'), metaDescription: optionalText(form, 'metaDescription') };
}
