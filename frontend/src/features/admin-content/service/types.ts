import type { PublicImage, PublicSpecification } from '@/lib/public-content';
import type { AdminLifecycle, AdminSeo } from '../shared/contracts';

export interface AdminInjectionService extends AdminLifecycle, AdminSeo {
  name: string; slug: string; summary: string | null; description: string | null;
  images: PublicImage[]; specifications: PublicSpecification[]; ctaLabel: string | null; ctaHref: string | null;
}

export interface InjectionServiceInput {
  name: string; slug: string; summary?: string | null; description?: string | null;
  images?: PublicImage[]; specifications?: PublicSpecification[]; ctaLabel?: string | null;
  ctaHref?: string | null; displayOrder?: number; metaTitle?: string | null; metaDescription?: string | null;
}
