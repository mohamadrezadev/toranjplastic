import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Button, Select } from "@/components/ui";
import { changeStaffRoleAction, changeStaffStatusAction, getStaff } from "@/features/admin-staff";
import { getAdminAccess, hasCapability } from "@/lib/auth";
import adminStyles from "../../Admin.module.css";
import styles from "../Staff.module.css";

export const metadata: Metadata = { title: "جزئیات کاربر سازمانی", robots: { index: false, follow: false } };
export const instant = false;
const errors: Record<string, string> = {
  STAFF_VERSION_CONFLICT: "اطلاعات توسط شخص دیگری تغییر کرده است؛ صفحه را تازه‌سازی کنید.",
  STAFF_LAST_ADMIN_CONFLICT: "آخرین مدیر فعال را نمی‌توان غیرفعال یا تنزل داد.",
  STAFF_SELF_CHANGE_FORBIDDEN: "نقش یا وضعیت حساب جاری را نمی‌توانید تغییر دهید.",
  validation: "درخواست معتبر نیست.", failed: "عملیات انجام نشد.",
};
const roles = { ADMIN: "مدیر", SALES: "فروش", OPERATOR: "اپراتور محتوا" } as const;

export default async function StaffDetailPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ error?: string; success?: string }> }) {
  const access = await getAdminAccess();
  if (access.status === 401) redirect("/auth/login");
  if (!access.account || !hasCapability(access.account, "STAFF_MANAGEMENT")) return <p className={styles.danger} role="alert">شما اجازه مشاهده این صفحه را ندارید.</p>;
  const { id } = await params; const query = await searchParams; const item = await getStaff(id);
  return <main className={adminStyles.main}><div className={adminStyles.shell}><section className={adminStyles.card}>
    <div className={adminStyles.header}><div><h1>{item.displayName}</h1><p className={adminStyles.subtitle}>مدیریت نقش و وضعیت حساب سازمانی</p></div><span className={styles.badge}>{item.status === "ACTIVE" ? "فعال" : item.status === "DISABLED" ? "غیرفعال" : "تعلیق‌شده"}</span></div>
    {query.error ? <><p className={styles.danger} role="alert">{errors[query.error] ?? errors.failed}</p>{query.error === "STAFF_VERSION_CONFLICT" ? <Link className={adminStyles.backLink} href={`/admin/staff/${item.id}`}>تازه‌سازی اطلاعات</Link> : null}</> : null}
    {query.success ? <p className={styles.success} role="status">تغییر با موفقیت ذخیره شد و نشست‌های قبلی این کاربر باطل شدند.</p> : null}
    <dl className={styles.detailGrid}><div className={styles.detailItem}><dt>شماره موبایل</dt><dd dir="ltr">{item.mobile}</dd></div><div className={styles.detailItem}><dt>آخرین ورود</dt><dd>{item.lastLoginAt ? new Date(item.lastLoginAt).toLocaleString("fa-IR") : "بدون ورود"}</dd></div><div className={styles.detailItem}><dt>تاریخ ایجاد</dt><dd>{new Date(item.createdAt).toLocaleDateString("fa-IR")}</dd></div><div className={styles.detailItem}><dt>نسخه</dt><dd>{item.version.toLocaleString("fa-IR")}</dd></div></dl>
    <form action={changeStaffRoleAction.bind(null, item.id)} className={adminStyles.form}><input type="hidden" name="expectedVersion" value={item.version}/><Select label="سطح دسترسی" name="role" defaultValue={item.role}><option value="ADMIN">مدیر — دسترسی کامل</option><option value="SALES">فروش — مدیریت استعلام‌ها</option><option value="OPERATOR">اپراتور — مدیریت محتوا</option></Select><div className={adminStyles.formActions}><Button type="submit" disabled={item.id === access.account.id}>ذخیره نقش</Button></div></form>
    <form action={changeStaffStatusAction.bind(null, item.id)} className={adminStyles.form}><input type="hidden" name="expectedVersion" value={item.version}/><Select label="وضعیت حساب" name="status" defaultValue={item.status === "ACTIVE" ? "ACTIVE" : "DISABLED"}><option value="ACTIVE">فعال</option><option value="DISABLED">غیرفعال</option></Select><div className={adminStyles.formActions}><Button type="submit" variant="secondary" disabled={item.id === access.account.id}>ذخیره وضعیت</Button></div></form>
    <p className={adminStyles.subtitle}>نقش فعلی: {roles[item.role]}. حذف دائمی حساب در این سامانه انجام نمی‌شود.</p>
  </section></div></main>;
}
