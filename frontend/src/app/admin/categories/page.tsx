import type { Metadata } from "next";
import { AdminContentRow, AdminListPage, AdminStatusFilter } from "@/components/admin/AdminContent";
import { listCategories, type ContentStatus } from "@/features/admin-content/category";

export const metadata: Metadata = { title: "دسته‌بندی‌ها", robots: { index: false, follow: false } };
export const instant = false;

const statuses: ContentStatus[] = ["DRAFT", "PUBLISHED", "ARCHIVED"];

function isContentStatus(value: string | undefined): value is ContentStatus {
  return value !== undefined && (statuses as string[]).includes(value);
}

export default async function AdminCategoriesPage({ searchParams }: { searchParams: Promise<{ page?: string; status?: string }> }) {
  const params = await searchParams;
  const page = Number(params.page ?? "1") || 1;
  const status = isContentStatus(params.status) ? params.status : undefined;
  const result = await listCategories({ page, status });
  const query = `${status ? `&status=${status}` : ""}`;

  return (
    <AdminListPage
      title="دسته‌بندی‌ها"
      total={result.pageInfo.total}
      createHref="/admin/categories/new"
      createLabel="دسته جدید"
      emptyTitle="هیچ دسته‌بندی‌ای با این فیلتر یافت نشد."
      headers={["نام", "اسلاگ", "وضعیت", "به‌روزرسانی"]}
      filters={<>
        <AdminStatusFilter value={status} />
      </>}
      rows={result.items.map((item) => (
        <AdminContentRow key={item.id} href={`/admin/categories/${item.id}`} name={item.name} slug={item.slug} status={item.status} updatedAt={item.updatedAt} />
      ))}
      pagination={{ basePath: "/admin/categories", page, totalPages: result.pageInfo.totalPages, query }}
    />
  );
}
