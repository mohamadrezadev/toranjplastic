import type { Metadata } from "next";
import { AdminContentRow, AdminListPage, AdminStatusFilter } from "@/components/admin/AdminContent";
import { listManagedPages, type ContentStatus } from "@/features/admin-content/managed-page";

export const metadata: Metadata = { title: "صفحات ثابت", robots: { index: false, follow: false } };
export const instant = false;

const statuses: ContentStatus[] = ["DRAFT", "PUBLISHED", "ARCHIVED"];

function isContentStatus(value: string | undefined): value is ContentStatus {
  return value !== undefined && (statuses as string[]).includes(value);
}

export default async function AdminManagedPagesPage({ searchParams }: { searchParams: Promise<{ page?: string; status?: string }> }) {
  const params = await searchParams;
  const page = Number(params.page ?? "1") || 1;
  const status = isContentStatus(params.status) ? params.status : undefined;
  const result = await listManagedPages({ page, status });
  const query = `${status ? `&status=${status}` : ""}`;

  return (
    <AdminListPage
      title="صفحات ثابت"
      total={result.pageInfo.total}
      createHref="/admin/pages/new"
      createLabel="صفحه جدید"
      emptyTitle="هیچ صفحه‌ای با این فیلتر یافت نشد."
      headers={["عنوان", "اسلاگ", "وضعیت", "به‌روزرسانی"]}
      filters={<>
        <AdminStatusFilter value={status} />
      </>}
      rows={result.items.map((item) => (
        <AdminContentRow key={item.id} href={`/admin/pages/${item.id}`} name={item.title} slug={item.slug} status={item.status} updatedAt={item.updatedAt} />
      ))}
      pagination={{ basePath: "/admin/pages", page, totalPages: result.pageInfo.totalPages, query }}
    />
  );
}
