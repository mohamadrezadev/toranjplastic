import type { ContentImage } from '../../content-shared/stored-content.js';
import type { AdminLifecycle, AdminSeo } from '../shared/types.js';
export interface AdminManagedPage extends AdminLifecycle, AdminSeo {
  title: string;
  slug: string;
  summary: string | null;
  body: string;
  images: ContentImage[];
}
export interface ManagedPageWriteInput {
  title: string;
  slug: string;
  summary?: string | null;
  body: string;
  images?: ContentImage[];
  displayOrder?: number;
  metaTitle?: string | null;
  metaDescription?: string | null;
}
