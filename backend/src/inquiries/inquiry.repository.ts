import type { InquiryStatus } from '../generated/prisma/enums.js';
import type {
  AdminAccountSummary,
  AdminInquiry,
  AdminInquiryListQuery,
  AdminInquiryPage,
  AdminInquirySummary,
  AdminMutationResult,
  CustomerInquiry,
  InquiryCreateInput,
  InquiryListQuery,
  InquiryPage,
} from './inquiry.types.js';

export const INQUIRY_REPOSITORY = Symbol('INQUIRY_REPOSITORY');

export interface InquiryRepository {
  findPublishedProduct(id: string): Promise<{ id: string; name: string } | null>;
  findPublishedService(id: string): Promise<{ id: string; name: string } | null>;
  findPublishedMaterial(id: string): Promise<{ id: string; name: string } | null>;
  create(ownerId: string, input: InquiryCreateInput): Promise<CustomerInquiry>;
  list(ownerId: string, query: InquiryListQuery): Promise<InquiryPage>;
  getOwned(ownerId: string, id: string): Promise<CustomerInquiry | null>;
  adminList(query: AdminInquiryListQuery): Promise<AdminInquiryPage>;
  adminSummary(): Promise<AdminInquirySummary>;
  adminAssignees(): Promise<AdminAccountSummary[]>;
  getAdmin(id: string): Promise<AdminInquiry | null>;
  adminTransitionStatus(id: string, expectedVersion: number, toStatus: InquiryStatus, actorId: string): Promise<AdminMutationResult>;
  adminAssign(id: string, expectedVersion: number, assignedAdminId: string | null, actorId: string): Promise<AdminMutationResult>;
  adminAddNote(id: string, text: string, actorId: string): Promise<AdminMutationResult>;
}
