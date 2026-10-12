import type { ArticleInput } from './types';
import { optionalText, singleImage, text } from '../shared/form-primitives';

export function articleInputFromForm(form: FormData): ArticleInput {
  return { title: text(form, 'title'), slug: text(form, 'slug'), summary: optionalText(form, 'summary'), body: text(form, 'body'), featuredImage: singleImage(form, 'featuredImage'), metaTitle: optionalText(form, 'metaTitle'), metaDescription: optionalText(form, 'metaDescription') };
}
