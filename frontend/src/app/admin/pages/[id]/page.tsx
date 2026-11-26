import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AdminContentError, archiveManagedPageAction, getManagedPage, publishManagedPageAction, updateManagedPageAction } from "@/features/admin-content/managed-page";
import { ManagedPageFields } from "../ManagedPageFields";
import { AdminForm, AdminFormAlert, AdminPage, AdminStatusActions, ContentStatusBadge } from "@/components/admin/AdminContent";

export const metadata: Metadata = { title: "ویرایش صفحه", robots: { index: false, follow: false } };
export const instant = false;

const errorMessages: Record<string, string> = {
  validation: "اطلاعات واردشده معتبر نیست. مقادیر را بررسی کنید.",
  conflict: "این اسلاگ قبلاً استفاده شده است.",
  failed: "عملیات با خطا مواجه شد. دوباره تلاش کنید.",
};

export default async function EditManagedPagePage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ error?: string }> }) {
  const { id } = await params;
  const { error } = await searchParams;

  let page;
  try {
    page = await getManagedPage(id);
  } catch (caught) {
    if (caught instanceof AdminContentError && caught.kind === "not_found") notFound();
    throw caught;
  }

  const updateAction = updateManagedPageAction.bind(null, id);
  const publishAction = publishManagedPageAction.bind(null, id);
  const archiveAction = archiveManagedPageAction.bind(null, id);

  return (
    <AdminPage title="ویرایش صفحه" badge={<ContentStatusBadge status={page.status} />}>
      {error ? <AdminFormAlert message={errorMessages[error] ?? errorMessages.failed} /> : null}
      <AdminStatusActions status={page.status} publishAction={publishAction} archiveAction={archiveAction} />

      <AdminForm action={updateAction} submitLabel="ذخیره تغییرات">
        <ManagedPageFields page={page} />
      </AdminForm>
    </AdminPage>
  );
}
