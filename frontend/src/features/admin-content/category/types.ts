import type { PublicImage } from '@/lib/public-content';
import type { AdminLifecycle, AdminSeo } from '../shared/contracts';

export interface AdminCategory extends AdminLifecycle, AdminSeo {
  name: string;
  slug: string;
  description: string | null;
  image: PublicImage | null;
}

export interface CategoryInput {
  name: string;
  slug: string;
  description?: string | null;
  image?: PublicImage | null;
  displayOrder?: number;
  metaTitle?: string | null;
  metaDescription?: string | null;
}
