import type { PublicImage } from '@/lib/public-content';
import type { AdminLifecycle, AdminSeo } from '../shared/contracts';

export interface AdminArticle extends AdminLifecycle, AdminSeo {
  title: string; slug: string; summary: string | null; body: string; featuredImage: PublicImage | null;
}

export interface ArticleInput {
  title: string; slug: string; summary?: string | null; body: string; featuredImage?: PublicImage | null;
  displayOrder?: number; metaTitle?: string | null; metaDescription?: string | null;
}
