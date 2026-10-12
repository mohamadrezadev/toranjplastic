import type { PublicImage } from '@/lib/public-content';
import type { AdminLifecycle, AdminSeo } from '../shared/contracts';

export interface AdminManagedPage extends AdminLifecycle, AdminSeo {
  title: string; slug: string; summary: string | null; body: string; images: PublicImage[];
}

export interface ManagedPageInput {
  title: string; slug: string; summary?: string | null; body: string; images?: PublicImage[];
  displayOrder?: number; metaTitle?: string | null; metaDescription?: string | null;
}
