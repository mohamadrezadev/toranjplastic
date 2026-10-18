import type { PublicImage } from '@/lib/public-content';
import type { ContentImageInput } from '../shared/form-primitives';
import type { AdminLifecycle, AdminSeo } from '../shared/contracts';

export interface AdminArticle extends AdminLifecycle, AdminSeo {
  title: string; slug: string; summary: string | null; body: string; featuredImage: PublicImage | null;
  contentVersion: number;
}

export interface ArticleInput {
  title: string; slug: string; summary?: string | null; body: string; featuredImage?: ContentImageInput | null;
  displayOrder?: number; metaTitle?: string | null; metaDescription?: string | null;
  expectedVersion?: number;
}
