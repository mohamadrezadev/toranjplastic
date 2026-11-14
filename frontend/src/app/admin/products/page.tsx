import type { Metadata } from "next";
import { Select } from "@/components/ui";
import { AdminContentRow, AdminListPage, AdminStatusFilter } from "@/components/admin/AdminContent";
import { listProducts, type ContentStatus } from "@/features/admin-content/product";

export const metadata: Metadata = { title: "محصولات", robots: { index: false, follow: false } };
export const instant = false;

const statuses: ContentStatus[] = ["DRAFT", "PUBLISHED", "ARCHIVED"];

function isContentStatus(value: string | undefined): value is ContentStatus {
  return value !== undefined && (statuses as string[]).includes(value);
}

export default async function AdminProductsPage({ searchParams }: { searchParams: Promise<{ page?: string; status?: string; featured?: string }> }) {
  const params = await searchParams;
  const page = Number(params.page ?? "1") || 1;
  const status = isContentStatus(params.status) ? params.status : undefined;
  const featured = params.featured === "true" ? true : params.featured === "false" ? false : undefined;
  const result = await listProducts({ page, status, featured });
  const query = `${status ? `&status=${status}` : ""}${featured !== undefined ? `&featured=${featured}` : ""}`;

  return (
    <AdminListPage
      title="محصولات"
      total={result.pageInfo.total}
      createHref="/admin/products/new"
      createLabel="محصول جدید"
      emptyTitle="هیچ محصولی با این فیلتر یافت نشد."
      headers={["نام", "اسلاگ", "ویژه", "وضعیت", "به‌روزرسانی"]}
      filters={<>
        <AdminStatusFilter value={status} />
        <Select label="ویژه" name="featured" defaultValue={params.featured ?? ""}>
          <option value="">همه</option>
          <option value="true">فقط ویژه</option>
          <option value="false">فقط غیرویژه</option>
        </Select>
      </>}
      rows={result.items.map((item) => (
        <AdminContentRow key={item.id} href={`/admin/products/${item.id}`} name={item.name} slug={item.slug} status={item.status} updatedAt={item.updatedAt} featured={item.featured} />
      ))}
      pagination={{ basePath: "/admin/products", page, totalPages: result.pageInfo.totalPages, query }}
    />
  );
}
