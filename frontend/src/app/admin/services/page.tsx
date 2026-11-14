import type { Metadata } from "next";
import { AdminContentRow, AdminListPage, AdminStatusFilter } from "@/components/admin/AdminContent";
import { listInjectionServices, type ContentStatus } from "@/features/admin-content/service";

export const metadata: Metadata = { title: "خدمات تزریق", robots: { index: false, follow: false } };
export const instant = false;

const statuses: ContentStatus[] = ["DRAFT", "PUBLISHED", "ARCHIVED"];

function isContentStatus(value: string | undefined): value is ContentStatus {
  return value !== undefined && (statuses as string[]).includes(value);
}

export default async function AdminServicesPage({ searchParams }: { searchParams: Promise<{ page?: string; status?: string }> }) {
  const params = await searchParams;
  const page = Number(params.page ?? "1") || 1;
  const status = isContentStatus(params.status) ? params.status : undefined;
  const result = await listInjectionServices({ page, status });
  const query = `${status ? `&status=${status}` : ""}`;

  return (
    <AdminListPage
      title="خدمات تزریق"
      total={result.pageInfo.total}
      createHref="/admin/services/new"
      createLabel="خدمت جدید"
      emptyTitle="هیچ خدمتی با این فیلتر یافت نشد."
      headers={["نام", "اسلاگ", "وضعیت", "به‌روزرسانی"]}
      filters={<>
        <AdminStatusFilter value={status} />
      </>}
      rows={result.items.map((item) => (
        <AdminContentRow key={item.id} href={`/admin/services/${item.id}`} name={item.name} slug={item.slug} status={item.status} updatedAt={item.updatedAt} />
      ))}
      pagination={{ basePath: "/admin/services", page, totalPages: result.pageInfo.totalPages, query }}
    />
  );
}
