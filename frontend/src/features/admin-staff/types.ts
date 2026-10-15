export type StaffRole = "ADMIN" | "SALES" | "OPERATOR";
export type StaffStatus = "ACTIVE" | "DISABLED";

export interface StaffAccount {
  id: string; mobile: string; displayName: string; role: StaffRole;
  status: StaffStatus | "SUSPENDED"; version: number;
  createdAt: string; updatedAt: string; lastLoginAt: string | null;
}
export interface StaffPage { items: StaffAccount[]; page: number; pageSize: number; total: number; pageCount: number }
export interface StaffFilters { page?: number; pageSize?: number; role?: StaffRole; status?: StaffStatus }
