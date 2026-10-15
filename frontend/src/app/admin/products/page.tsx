import type { Metadata } from "next";
import Link from "next/link";
import { Button, Select } from "@/components/ui";
import { listProducts, type ContentStatus } from "@/features/admin-content/product";
import { StatusBadge } from "../content/StatusBadge";
import styles from "../Admin.module.css";

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
    <main className={styles.main}>
      <div className={styles.shell}>
        <section className={styles.card}>
          <div className={styles.header}>
            <div>
              <h1>محصولات</h1>
              <p className={styles.subtitle}>{result.pageInfo.total} رکورد</p>
            </div>
            <Link href="/admin/products/new" className={styles.linkButton}>محصول جدید</Link>
          </div>

          <div className={styles.toolbar}>
            <form>
              <Select label="وضعیت" name="status" defaultValue={status ?? ""}>
                <option value="">همه</option>
                <option value="DRAFT">پیش‌نویس</option>
                <option value="PUBLISHED">منتشرشده</option>
                <option value="ARCHIVED">آرشیوشده</option>
              </Select>
              <Select label="ویژه" name="featured" defaultValue={params.featured ?? ""}>
                <option value="">همه</option>
                <option value="true">فقط ویژه</option>
                <option value="false">فقط غیرویژه</option>
              </Select>
              <Button type="submit" variant="secondary">اعمال فیلتر</Button>
            </form>
          </div>

          {result.items.length === 0 ? (
            <p className={styles.empty}>هیچ محصولی با این فیلتر یافت نشد.</p>
          ) : (
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>نام</th>
                    <th>اسلاگ</th>
                    <th>ویژه</th>
                    <th>وضعیت</th>
                    <th>به‌روزرسانی</th>
                  </tr>
                </thead>
                <tbody>
                  {result.items.map((product) => (
                    <tr key={product.id}>
                      <td><Link className={styles.rowLink} href={`/admin/products/${product.id}`}>{product.name}</Link></td>
                      <td dir="ltr">{product.slug}</td>
                      <td>{product.featured ? "بله" : "خیر"}</td>
                      <td><StatusBadge status={product.status} /></td>
                      <td>{new Date(product.updatedAt).toLocaleDateString("fa-IR")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {result.pageInfo.totalPages > 1 ? (
            <nav className={styles.pagination}>
              {page > 1 ? <Link href={`/admin/products?page=${page - 1}${query}`}>قبلی</Link> : <span />}
              <span>صفحه {result.pageInfo.page} از {result.pageInfo.totalPages}</span>
              {page < result.pageInfo.totalPages ? <Link href={`/admin/products?page=${page + 1}${query}`}>بعدی</Link> : <span />}
            </nav>
          ) : null}
        </section>
      </div>
    </main>
  );
}
