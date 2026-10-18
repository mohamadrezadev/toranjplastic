import type { PublicImage, PublicSpecification } from '@/lib/public-content';
import type { ContentImageInput } from '../shared/form-primitives';
import type { AdminLifecycle, AdminListQuery, AdminSeo } from '../shared/contracts';

export interface AdminProduct extends AdminLifecycle, AdminSeo {
  name: string; slug: string; summary: string | null; description: string | null;
  categoryId: string | null; images: PublicImage[]; specifications: PublicSpecification[]; featured: boolean;
  contentVersion: number;
}

export interface ProductInput {
  name: string; slug: string; summary?: string | null; description?: string | null;
  categoryId?: string | null; images?: ContentImageInput[]; specifications?: PublicSpecification[];
  featured?: boolean; displayOrder?: number; metaTitle?: string | null; metaDescription?: string | null;
  expectedVersion?: number;
}

export interface AdminProductListQuery extends AdminListQuery { featured?: boolean }
