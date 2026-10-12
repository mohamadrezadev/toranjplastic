import type { PublicImage, PublicSpecification } from '@/lib/public-content';
import type { AdminLifecycle, AdminSeo } from '../shared/contracts';

export interface AdminMaterial extends AdminLifecycle, AdminSeo {
  name: string; slug: string; family: string | null; grade: string | null; manufacturer: string | null;
  summary: string | null; description: string | null; images: PublicImage[]; specifications: PublicSpecification[];
  inquiryAvailable: boolean;
}

export interface MaterialInput {
  name: string; slug: string; family?: string | null; grade?: string | null; manufacturer?: string | null;
  summary?: string | null; description?: string | null; images?: PublicImage[]; specifications?: PublicSpecification[];
  inquiryAvailable?: boolean; displayOrder?: number; metaTitle?: string | null; metaDescription?: string | null;
}
