import type { ContentImage } from '../../content-shared/stored-content.js';
import type { AdminLifecycle, AdminSeo } from '../shared/types.js';
export interface AdminCategory extends AdminLifecycle, AdminSeo { name: string; slug: string; description: string | null; image: ContentImage | null; }
export interface CategoryWriteInput { name: string; slug: string; description?: string | null; image?: ContentImage | null; displayOrder?: number; metaTitle?: string | null; metaDescription?: string | null; }
