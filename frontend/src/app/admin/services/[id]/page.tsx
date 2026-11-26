import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AdminContentError, archiveInjectionServiceAction, getInjectionService, publishInjectionServiceAction, updateInjectionServiceAction } from "@/features/admin-content/service";
import { ServiceFields } from "../ServiceFields";
import { AdminForm, AdminFormAlert, AdminPage, AdminStatusActions, ContentStatusBadge } from "@/components/admin/AdminContent";

export const metadata: Metadata = { title: "ویرایش خدمت", robots: { index: false, follow: false } };
export const instant = false;

const errorMessages: Record<string, string> = {
  validation: "اطلاعات واردشده معتبر نیست. مقادیر را بررسی کنید.",
  conflict: "این اسلاگ قبلاً استفاده شده است.",
  failed: "عملیات با خطا مواجه شد. دوباره تلاش کنید.",
};

export default async function EditServicePage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ error?: string }> }) {
  const { id } = await params;
  const { error } = await searchParams;

  let service;
  try {
    service = await getInjectionService(id);
  } catch (caught) {
    if (caught instanceof AdminContentError && caught.kind === "not_found") notFound();
    throw caught;
  }

  const updateAction = updateInjectionServiceAction.bind(null, id);
  const publishAction = publishInjectionServiceAction.bind(null, id);
  const archiveAction = archiveInjectionServiceAction.bind(null, id);

  return (
    <AdminPage title="ویرایش خدمت" badge={<ContentStatusBadge status={service.status} />}>
      {error ? <AdminFormAlert message={errorMessages[error] ?? errorMessages.failed} /> : null}
      <AdminStatusActions status={service.status} publishAction={publishAction} archiveAction={archiveAction} />

      <AdminForm action={updateAction} submitLabel="ذخیره تغییرات">
        <ServiceFields service={service} />
      </AdminForm>
    </AdminPage>
  );
}
