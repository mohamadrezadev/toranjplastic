import type { Metadata } from "next";
import { createManagedPageAction } from "@/features/admin-content/managed-page";
import { ManagedPageFields } from "../ManagedPageFields";
import { AdminForm, AdminFormAlert, AdminPage } from "@/components/admin/AdminContent";

export const metadata: Metadata = { title: "صفحه جدید", robots: { index: false, follow: false } };
export const instant = false;

const errorMessages: Record<string, string> = {
  validation: "اطلاعات واردشده معتبر نیست. مقادیر را بررسی کنید.",
  conflict: "این اسلاگ قبلاً استفاده شده است.",
  failed: "ایجاد صفحه با خطا مواجه شد. دوباره تلاش کنید.",
};

export default async function NewManagedPagePage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;

  return (
    <AdminPage title="صفحه جدید">
      {error ? <AdminFormAlert message={errorMessages[error] ?? errorMessages.failed} /> : null}
      <AdminForm action={createManagedPageAction} submitLabel="ایجاد صفحه">
        <ManagedPageFields />
      </AdminForm>
    </AdminPage>
  );
}
