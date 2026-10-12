import type {
  ContentImage,
  ContentSpecification,
} from '../../content-shared/stored-content.js';
import type { AdminLifecycle, AdminSeo } from '../shared/types.js';
export interface AdminInjectionService extends AdminLifecycle, AdminSeo {
  name: string;
  slug: string;
  summary: string | null;
  description: string | null;
  images: ContentImage[];
  specifications: ContentSpecification[];
  ctaLabel: string | null;
  ctaHref: string | null;
}
export interface InjectionServiceWriteInput {
  name: string;
  slug: string;
  summary?: string | null;
  description?: string | null;
  images?: ContentImage[];
  specifications?: ContentSpecification[];
  ctaLabel?: string | null;
  ctaHref?: string | null;
  displayOrder?: number;
  metaTitle?: string | null;
  metaDescription?: string | null;
}
