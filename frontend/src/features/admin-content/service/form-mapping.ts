import type { InjectionServiceInput } from './types';
import { imageRows, optionalText, specificationRows, text } from '../shared/form-primitives';

export function injectionServiceInputFromForm(form: FormData): InjectionServiceInput {
  return { name: text(form, 'name'), slug: text(form, 'slug'), summary: optionalText(form, 'summary'), description: optionalText(form, 'description'), images: imageRows(form), specifications: specificationRows(form), ctaLabel: optionalText(form, 'ctaLabel'), ctaHref: optionalText(form, 'ctaHref'), metaTitle: optionalText(form, 'metaTitle'), metaDescription: optionalText(form, 'metaDescription') };
}
