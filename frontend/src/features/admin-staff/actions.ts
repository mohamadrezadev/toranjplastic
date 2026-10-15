"use server";
import { redirect } from "next/navigation";
import { changeStaffRole, changeStaffStatus, createStaff, StaffApiError } from "./api";
import type { StaffRole, StaffStatus } from "./types";

const errorCode = (error: unknown) => error instanceof StaffApiError ? error.code : "failed";
export async function createStaffAction(form: FormData) {
  try { await createStaff({ mobile: String(form.get("mobile") ?? ""), displayName: String(form.get("displayName") ?? ""), password: String(form.get("password") ?? ""), role: String(form.get("role") ?? "") as StaffRole }); }
  catch (error) { redirect(`/admin/staff/new?error=${encodeURIComponent(errorCode(error))}`); }
  redirect("/admin/staff?success=created");
}
export async function changeStaffRoleAction(id: string, form: FormData) {
  try { await changeStaffRole(id, String(form.get("role") ?? "") as StaffRole, Number(form.get("expectedVersion"))); }
  catch (error) { redirect(`/admin/staff/${id}?error=${encodeURIComponent(errorCode(error))}`); }
  redirect(`/admin/staff/${id}?success=role`);
}
export async function changeStaffStatusAction(id: string, form: FormData) {
  try { await changeStaffStatus(id, String(form.get("status") ?? "") as StaffStatus, Number(form.get("expectedVersion"))); }
  catch (error) { redirect(`/admin/staff/${id}?error=${encodeURIComponent(errorCode(error))}`); }
  redirect(`/admin/staff/${id}?success=status`);
}
