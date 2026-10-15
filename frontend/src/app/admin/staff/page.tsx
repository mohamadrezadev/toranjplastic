import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Button, Select } from "@/components/ui";
import { listStaff, type StaffRole, type StaffStatus } from "@/features/admin-staff";
import { getAdminAccess, hasCapability } from "@/lib/auth";
import adminStyles from "../Admin.module.css";
import styles from "./Staff.module.css";

export const metadata: Metadata = { title: "کاربران سازمانی", robots: { index: false, follow: false } };
export const instant = false;
const roles: StaffRole[] = ["ADMIN", "SALES", "OPERATOR"];
const statuses: StaffStatus[] = ["ACTIVE", "DISABLED"];
const roleLabel: Record<StaffRole, string> = { ADMIN: "مدیر", SALES: "فروش", OPERATOR: "اپراتور محتوا" };
const statusLabel = { ACTIVE: "فعال", DISABLED: "غیرفعال", SUSPENDED: "تعلیق‌شده" } as const;

export default async function StaffPage({ searchParams }: { searchParams: Promise<{ page?: string; role?: string; status?: string; success?: string }> }) {
  const access = await getAdminAccess();
  if (access.status === 401) redirect("/auth/login");
  if (!access.account || !hasCapability(access.account, "STAFF_MANAGEMENT")) return <p className={styles.danger} role="alert">شما اجازه مدیریت کاربران سازمانی را ندارید.</p>;
  const params = await searchParams;
  const page = Math.max(1, Number(params.page ?? 1) || 1);
  const role = roles.includes(params.role as StaffRole) ? params.role as StaffRole : undefined;
  const status = statuses.includes(params.status as StaffStatus) ? params.status as StaffStatus : undefined;
  const result = await listStaff({ page, role, status });
  const filterSuffix = `${role ? `&role=${role}` : ""}${status ? `&status=${status}` : ""}`;
  return <main className={adminStyles.main}><div className={adminStyles.shell}><section className={adminStyles.card}>
    <div className={adminStyles.header}><div><h1>کاربران سازمانی</h1><p className={adminStyles.subtitle}>{result.total.toLocaleString("fa-IR")} حساب</p></div><Link href="/admin/staff/new" className={adminStyles.linkButton}>کاربر جدید</Link></div>
    {params.success === "created" ? <p className={styles.success} role="status">حساب سازمانی با موفقیت ایجاد شد.</p> : null}
    <form className={styles.filters}><Select label="نقش" name="role" defaultValue={role ?? ""}><option value="">همه نقش‌ها</option>{roles.map((item) => <option key={item} value={item}>{roleLabel[item]}</option>)}</Select><Select label="وضعیت" name="status" defaultValue={status ?? ""}><option value="">همه وضعیت‌ها</option><option value="ACTIVE">فعال</option><option value="DISABLED">غیرفعال</option></Select><Button type="submit" variant="secondary">اعمال فیلتر</Button></form>
    {result.items.length === 0 ? <p className={adminStyles.empty}>کاربری با این فیلتر پیدا نشد.</p> : <>
      <div className={`${adminStyles.tableWrap} ${styles.desktopTable}`}><table className={adminStyles.table}><thead><tr><th>نام</th><th>شماره موبایل</th><th>نقش</th><th>وضعیت</th><th>به‌روزرسانی</th></tr></thead><tbody>{result.items.map((item) => <tr key={item.id}><td><Link className={adminStyles.rowLink} href={`/admin/staff/${item.id}`}>{item.displayName}</Link></td><td dir="ltr">{item.mobile}</td><td>{roleLabel[item.role]}</td><td>{statusLabel[item.status]}</td><td>{new Date(item.updatedAt).toLocaleDateString("fa-IR")}</td></tr>)}</tbody></table></div>
      <div className={styles.cards}>{result.items.map((item) => <article className={styles.staffCard} key={item.id}><div className={styles.staffCardHeader}><Link className={adminStyles.rowLink} href={`/admin/staff/${item.id}`}>{item.displayName}</Link><span className={styles.badge}>{statusLabel[item.status]}</span></div><div className={styles.meta}><span dir="ltr">{item.mobile}</span><span>{roleLabel[item.role]}</span><span>ویرایش: {new Date(item.updatedAt).toLocaleDateString("fa-IR")}</span></div></article>)}</div>
    </>}
    {result.pageCount > 1 ? <nav className={adminStyles.pagination}>{page > 1 ? <Link href={`/admin/staff?page=${page - 1}${filterSuffix}`}>قبلی</Link> : <span />}<span>صفحه {page.toLocaleString("fa-IR")} از {result.pageCount.toLocaleString("fa-IR")}</span>{page < result.pageCount ? <Link href={`/admin/staff?page=${page + 1}${filterSuffix}`}>بعدی</Link> : <span />}</nav> : null}
  </section></div></main>;
}

