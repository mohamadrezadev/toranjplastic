import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AdminContentError, archiveMaterialAction, getMaterial, publishMaterialAction, updateMaterialAction } from "@/features/admin-content/material";
import { MaterialFields } from "../MaterialFields";
import { AdminForm, AdminFormAlert, AdminPage, AdminStatusActions, ContentStatusBadge } from "@/components/admin/AdminContent";

export const metadata: Metadata = { title: "ویرایش ماده", robots: { index: false, follow: false } };
export const instant = false;

const errorMessages: Record<string, string> = {
  validation: "اطلاعات واردشده معتبر نیست. مقادیر را بررسی کنید.",
  conflict: "این اسلاگ قبلاً استفاده شده است.",
  failed: "عملیات با خطا مواجه شد. دوباره تلاش کنید.",
};

export default async function EditMaterialPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ error?: string }> }) {
  const { id } = await params;
  const { error } = await searchParams;

  let material;
  try {
    material = await getMaterial(id);
  } catch (caught) {
    if (caught instanceof AdminContentError && caught.kind === "not_found") notFound();
    throw caught;
  }

  const updateAction = updateMaterialAction.bind(null, id);
  const publishAction = publishMaterialAction.bind(null, id);
  const archiveAction = archiveMaterialAction.bind(null, id);

  return (
    <AdminPage title="ویرایش ماده" badge={<ContentStatusBadge status={material.status} />}>
      {error ? <AdminFormAlert message={errorMessages[error] ?? errorMessages.failed} /> : null}
      <AdminStatusActions status={material.status} publishAction={publishAction} archiveAction={archiveAction} />

      <AdminForm action={updateAction} submitLabel="ذخیره تغییرات">
        <MaterialFields material={material} />
      </AdminForm>
    </AdminPage>
  );
}
