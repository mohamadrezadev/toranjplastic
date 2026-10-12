import type { Metadata } from "next";
import Link from "next/link";
import { Button, Select } from "@/components/ui";
import { listInjectionServices, type ContentStatus } from "@/features/admin-content/service";
import { StatusBadge } from "../content/StatusBadge";
import styles from "../Admin.module.css";

export const metadata: Metadata = { title: "خدمات تزریق", robots: { index: false, follow: false } };

const statuses: ContentStatus[] = ["DRAFT", "PUBLISHED", "ARCHIVED"];

function isContentStatus(value: string | undefined): value is ContentStatus {
  return value !== undefined && (statuses as string[]).includes(value);
}

export default async function AdminServicesPage({ searchParams }: { searchParams: Promise<{ page?: string; status?: string }> }) {
  const params = await searchParams;
  const page = Number(params.page ?? "1") || 1;
  const status = isContentStatus(params.status) ? params.status : undefined;
  const result = await listInjectionServices({ page, status });

  return (
    <main className={styles.main}>
      <div className={styles.shell}>
        <section className={styles.card}>
          <div className={styles.header}>
            <div>
              <h1>خدمات تزریق</h1>
              <p className={styles.subtitle}>{result.pageInfo.total} رکورد</p>
            </div>
            <Link href="/admin/services/new" className={styles.linkButton}>خدمت جدید</Link>
          </div>

          <div className={styles.toolbar}>
            <form>
              <Select label="وضعیت" name="status" defaultValue={status ?? ""}>
                <option value="">همه</option>
                <option value="DRAFT">پیش‌نویس</option>
                <option value="PUBLISHED">منتشرشده</option>
                <option value="ARCHIVED">آرشیوشده</option>
              </Select>
              <Button type="submit" variant="secondary">اعمال فیلتر</Button>
            </form>
          </div>

          {result.items.length === 0 ? (
            <p className={styles.empty}>هیچ خدمتی با این فیلتر یافت نشد.</p>
          ) : (
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>نام</th>
                    <th>اسلاگ</th>
                    <th>وضعیت</th>
                    <th>به‌روزرسانی</th>
                  </tr>
                </thead>
                <tbody>
                  {result.items.map((service) => (
                    <tr key={service.id}>
                      <td><Link className={styles.rowLink} href={`/admin/services/${service.id}`}>{service.name}</Link></td>
                      <td dir="ltr">{service.slug}</td>
                      <td><StatusBadge status={service.status} /></td>
                      <td>{new Date(service.updatedAt).toLocaleDateString("fa-IR")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {result.pageInfo.totalPages > 1 ? (
            <nav className={styles.pagination}>
              {page > 1 ? <Link href={`/admin/services?page=${page - 1}${status ? `&status=${status}` : ""}`}>قبلی</Link> : <span />}
              <span>صفحه {result.pageInfo.page} از {result.pageInfo.totalPages}</span>
              {page < result.pageInfo.totalPages ? <Link href={`/admin/services?page=${page + 1}${status ? `&status=${status}` : ""}`}>بعدی</Link> : <span />}
            </nav>
          ) : null}
        </section>
      </div>
    </main>
  );
}
