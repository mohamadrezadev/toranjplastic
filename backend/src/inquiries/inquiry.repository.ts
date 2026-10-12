import type { CustomerInquiry, InquiryCreateInput, InquiryListQuery, InquiryPage } from './inquiry.types.js';

export const INQUIRY_REPOSITORY = Symbol('INQUIRY_REPOSITORY');

export interface InquiryRepository {
  findPublishedProduct(id: string): Promise<{ id: string; name: string } | null>;
  findPublishedService(id: string): Promise<{ id: string; name: string } | null>;
  findPublishedMaterial(id: string): Promise<{ id: string; name: string } | null>;
  create(ownerId: string, input: InquiryCreateInput): Promise<CustomerInquiry>;
  list(ownerId: string, query: InquiryListQuery): Promise<InquiryPage>;
  getOwned(ownerId: string, id: string): Promise<CustomerInquiry | null>;
}
