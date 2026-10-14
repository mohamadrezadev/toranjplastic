import type { AdminInquiryFilters } from "./types";

export function inquiryQuery(filters: AdminInquiryFilters) {
  const query = new URLSearchParams({ page: String(filters.page ?? 1), pageSize: String(filters.pageSize ?? 20) });
  if (filters.type) query.set("type", filters.type);
  if (filters.status) query.set("status", filters.status);
  if (filters.assignedAdminId) query.set("assignedAdminId", filters.assignedAdminId);
  if (filters.unassigned !== undefined) query.set("unassigned", String(filters.unassigned));
  if (filters.from) query.set("from", filters.from);
  if (filters.to) query.set("to", filters.to);
  if (filters.q) query.set("q", filters.q);
  return query;
}
