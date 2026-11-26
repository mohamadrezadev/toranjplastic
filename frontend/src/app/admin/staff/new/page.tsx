import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AdminForm, AdminFormAlert, AdminFormRow, AdminPage } from "@/components/admin/AdminContent";
import { Alert } from "@/components/feedback";
import { Button, Input, Select } from "@/components/ui";
import { createStaffAction } from "@/features/admin-staff";
import { getAdminAccess, hasCapability } from "@/lib/auth";

export const metadata: Metadata = { title: "کاربر سازمانی جدید", robots: { index: false, follow: false } };
export const instant = false;

const messages: Record<string, string> = {
  validation: "اطلاعات واردشده معتبر نیست.",
  STAFF_ACCOUNT_CONFLICT: "امکان ایجاد حساب با این اطلاعات وجود ندارد.",
  forbidden: "اجازه انجام این عملیات را ندارید.",
  failed: "ایجاد حساب انجام نشد. دوباره تلاش کنید.",
};

/*
 * New staff account (OpenSpec change rebuild-ui-with-astryx, task 8.5):
 * capability-gated creation form using shared Astryx-backed AdminPage,
 * AdminForm, AdminFormRow and AdminFormAlert.
 */
export default async function NewStaffPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const access = await getAdminAccess();
  if (access.status === 401) redirect("/auth/login");
  if (!access.account || !hasCapability(access.account, "STAFF_MANAGEMENT")) {
    return (
      <AdminPage title="کاربر سازمانی جدید">
        <Alert variant="danger" title="عدم دسترسی">
          شما اجازه ایجاد کاربر سازمانی را ندارید.
        </Alert>
      </AdminPage>
    );
  }

  const { error } = await searchParams;

  return (
    <AdminPage
      title="کاربر سازمانی جدید"
      subtitle="حساب با رمز اولیه ایجاد می‌شود؛ رمز در هیچ صفحه‌ای نمایش داده نخواهد شد."
      actions={
        <Button href="/admin/staff" variant="ghost">
          بازگشت به فهرست
        </Button>
      }
    >
      {error ? <AdminFormAlert message={messages[error] ?? messages.failed} /> : null}
      <AdminForm action={createStaffAction} submitLabel="ایجاد حساب">
        <AdminFormRow>
          <Input
            label="نام و نام خانوادگی"
            name="displayName"
            required
            minLength={2}
            maxLength={80}
            autoComplete="off"
          />
          <Input
            label="شماره موبایل"
            name="mobile"
            required
            maxLength={32}
            dir="ltr"
            inputMode="tel"
            autoComplete="off"
          />
        </AdminFormRow>
        <AdminFormRow>
          <Select label="سطح دسترسی" name="role" required defaultValue="SALES">
            <option value="ADMIN">مدیر — دسترسی کامل</option>
            <option value="SALES">فروش — مدیریت استعلام‌ها</option>
            <option value="OPERATOR">اپراتور — مدیریت محتوا</option>
          </Select>
          <Input
            label="رمز عبور اولیه"
            name="password"
            type="password"
            required
            minLength={10}
            maxLength={128}
            autoComplete="new-password"
            helpText="حداقل ۱۰ نویسه"
          />
        </AdminFormRow>
      </AdminForm>
    </AdminPage>
  );
}
