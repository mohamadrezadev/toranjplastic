import type { Metadata } from "next";
import { createInjectionServiceAction } from "@/features/admin-content/service";
import { ServiceFields } from "../ServiceFields";
import { AdminForm, AdminFormAlert, AdminPage } from "@/components/admin/AdminContent";

export const metadata: Metadata = { title: "خدمت جدید", robots: { index: false, follow: false } };
export const instant = false;

const errorMessages: Record<string, string> = {
  validation: "اطلاعات واردشده معتبر نیست. مقادیر را بررسی کنید.",
  conflict: "این اسلاگ قبلاً استفاده شده است.",
  failed: "ایجاد خدمت با خطا مواجه شد. دوباره تلاش کنید.",
};

export default async function NewServicePage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;

  return (
    <AdminPage title="خدمت جدید">
      {error ? <AdminFormAlert message={errorMessages[error] ?? errorMessages.failed} /> : null}
      <AdminForm action={createInjectionServiceAction} submitLabel="ایجاد خدمت">
        <ServiceFields />
      </AdminForm>
    </AdminPage>
  );
}
