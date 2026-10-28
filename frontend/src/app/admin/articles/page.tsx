import type { Metadata } from "next";
import Link from "next/link";
import { Button, Select } from "@/components/ui";
import { listArticles, type ContentStatus } from "@/features/admin-content/article";
import { StatusBadge } from "../content/StatusBadge";
import styles from "../Admin.module.css";

export const metadata: Metadata = { title: "مقالات", robots: { index: false, follow: false } };
export const instant = false;

const statuses: ContentStatus[] = ["DRAFT", "PUBLISHED", "ARCHIVED"];

function isContentStatus(value: string | undefined): value is ContentStatus {
  return value !== undefined && (statuses as string[]).includes(value);
}

export default async function AdminArticlesPage({ searchParams }: { searchParams: Promise<{ page?: string; status?: string }> }) {
  const params = await searchParams;
  const page = Number(params.page ?? "1") || 1;
  const status = isContentStatus(params.status) ? params.status : undefined;
  const result = await listArticles({ page, status });

  return (
    <main className={styles.main}>
      <div className={styles.shell}>
        <div style={{
          background: "var(--color-surface-raised, #f8fafc)",
          border: "1px solid var(--color-border-default, #e2e8f0)",
          borderRadius: "var(--radius-md, 8px)",
          padding: "1.25rem 1.5rem",
          marginBlockEnd: "1.5rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "1rem"
        }}>
          <div>
            <strong style={{ display: "block", fontSize: "1.05rem", marginBlockEnd: "0.35rem", color: "var(--color-brand-primary)" }}>
              سامانه مدیریت تخصصی محتوا و مقالات (Strapi CMS)
            </strong>
            <p style={{ margin: 0, fontSize: "0.875rem", color: "var(--color-text-secondary)" }}>
              مقالات دانشنامه عمومی با سامانه Strapi مدیریت و منتشر می‌شوند. برای ایجاد و ویرایش پیشرفته، مستقیماً وارد پنل شوید.
            </p>
          </div>
          <a
            href="http://localhost:1337/admin"
            target="_blank"
            rel="noreferrer"
            className={styles.linkButton}
            style={{
              background: "var(--color-brand-primary, #0f766e)",
              color: "#fff",
              textDecoration: "none",
              padding: "0.6rem 1.2rem",
              borderRadius: "6px",
              fontWeight: 600
            }}
          >
            ورود مستقیم به پنل استرپی (Strapi) ↗
          </a>
        </div>

        <section className={styles.card}>
          <div className={styles.header}>
            <div>
              <h1>مقالات</h1>
              <p className={styles.subtitle}>{result.pageInfo.total} رکورد</p>
            </div>
            <Link href="/admin/articles/new" className={styles.linkButton}>مقاله جدید</Link>
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
            <p className={styles.empty}>هیچ مقاله‌ای با این فیلتر یافت نشد.</p>
          ) : (
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>عنوان</th>
                    <th>اسلاگ</th>
                    <th>وضعیت</th>
                    <th>به‌روزرسانی</th>
                  </tr>
                </thead>
                <tbody>
                  {result.items.map((article) => (
                    <tr key={article.id}>
                      <td><Link className={styles.rowLink} href={`/admin/articles/${article.id}`}>{article.title}</Link></td>
                      <td dir="ltr">{article.slug}</td>
                      <td><StatusBadge status={article.status} /></td>
                      <td>{new Date(article.updatedAt).toLocaleDateString("fa-IR")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {result.pageInfo.totalPages > 1 ? (
            <nav className={styles.pagination}>
              {page > 1 ? <Link href={`/admin/articles?page=${page - 1}${status ? `&status=${status}` : ""}`}>قبلی</Link> : <span />}
              <span>صفحه {result.pageInfo.page} از {result.pageInfo.totalPages}</span>
              {page < result.pageInfo.totalPages ? <Link href={`/admin/articles?page=${page + 1}${status ? `&status=${status}` : ""}`}>بعدی</Link> : <span />}
            </nav>
          ) : null}
        </section>
      </div>
    </main>
  );
}
