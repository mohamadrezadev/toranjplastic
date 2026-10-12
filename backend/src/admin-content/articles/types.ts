import type { ContentImage } from '../../content-shared/stored-content.js';
import type { AdminLifecycle, AdminSeo } from '../shared/types.js';
export interface AdminArticle extends AdminLifecycle, AdminSeo {
  title: string;
  slug: string;
  summary: string | null;
  body: string;
  featuredImage: ContentImage | null;
}
export interface ArticleWriteInput {
  title: string;
  slug: string;
  summary?: string | null;
  body: string;
  featuredImage?: ContentImage | null;
  displayOrder?: number;
  metaTitle?: string | null;
  metaDescription?: string | null;
}
