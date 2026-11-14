import type { Metadata } from "next";
import { createMaterialAction } from "@/features/admin-content/material";
import { MaterialFields } from "../MaterialFields";
import { AdminForm, AdminFormAlert, AdminPage } from "@/components/admin/AdminContent";

export const metadata: Metadata = { title: "ماده جدید", robots: { index: false, follow: false } };
export const instant = false;

const errorMessages: Record<string, string> = {
  validation: "اطلاعات واردشده معتبر نیست. مقادیر را بررسی کنید.",
  conflict: "این اسلاگ قبلاً استفاده شده است.",
  failed: "ایجاد ماده با خطا مواجه شد. دوباره تلاش کنید.",
};

export default async function NewMaterialPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;

  return (
    <AdminPage title="ماده جدید">
      {error ? <AdminFormAlert message={errorMessages[error] ?? errorMessages.failed} /> : null}
      <AdminForm action={createMaterialAction} submitLabel="ایجاد ماده">
        <MaterialFields />
      </AdminForm>
    </AdminPage>
  );
}
