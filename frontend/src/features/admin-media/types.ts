export type MediaAssetStatus = 'PROCESSING' | 'READY' | 'FAILED' | 'DELETION_PENDING' | 'DELETED';
export type MediaVariantName = 'thumb' | 'card' | 'detail';

export interface AdminMediaVariant {
  name: MediaVariantName;
  width: number;
  height: number;
  bytes: number;
}

export interface AdminMediaAsset {
  id: string;
  status: MediaAssetStatus;
  defaultAlt: string | null;
  sourceMimeType: string | null;
  sourceWidth: number | null;
  sourceHeight: number | null;
  variants: AdminMediaVariant[];
  referenceCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface AdminMediaPage {
  items: AdminMediaAsset[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface AdminMediaQuery {
  page?: number;
  pageSize?: number;
  status?: MediaAssetStatus;
  search?: string;
}
