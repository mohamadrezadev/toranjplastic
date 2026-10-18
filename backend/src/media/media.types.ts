import type { MediaAssetStatus } from '../generated/prisma/enums.js';
import type { ProcessedMedia, ProcessedMediaVariant } from './processing/media-image.processor.js';

export interface AdminMediaAsset {
  id: string;
  status: MediaAssetStatus;
  defaultAlt: string | null;
  sourceMimeType: string | null;
  sourceWidth: number | null;
  sourceHeight: number | null;
  variants: Array<Omit<ProcessedMediaVariant, 'key' | 'checksumSha256'>>;
  referenceCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface MediaListQuery {
  page: number;
  pageSize: number;
  search?: string;
  status?: MediaAssetStatus;
}

export interface MediaPage {
  items: AdminMediaAsset[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface InternalMediaAsset extends AdminMediaAsset {
  objectPrefix: string;
  internalVariants: ProcessedMediaVariant[];
}

export interface DeletionCandidate {
  state: 'missing' | 'in-use' | 'pending' | 'deleted';
  variants?: ProcessedMediaVariant[];
}

export interface MediaRepository {
  createProcessing(actorId: string, objectPrefix: string): Promise<{ id: string }>;
  markReady(id: string, actorId: string, defaultAlt: string, media: ProcessedMedia): Promise<AdminMediaAsset>;
  markFailed(id: string, actorId: string, failureCode: string): Promise<void>;
  list(query: MediaListQuery): Promise<MediaPage>;
  get(id: string): Promise<AdminMediaAsset | null>;
  updateDefaultAlt(id: string, actorId: string, defaultAlt: string): Promise<AdminMediaAsset | null>;
  beginDeletion(id: string, actorId: string): Promise<DeletionCandidate>;
  completeDeletion(id: string, actorId: string): Promise<void>;
  findPrivateVariant(id: string, variant: ProcessedMediaVariant['name']): Promise<ProcessedMediaVariant | null>;
  findPublicVariant(id: string, variant: ProcessedMediaVariant['name'], now: Date): Promise<ProcessedMediaVariant | null>;
}

export const MEDIA_REPOSITORY = Symbol('MEDIA_REPOSITORY');
