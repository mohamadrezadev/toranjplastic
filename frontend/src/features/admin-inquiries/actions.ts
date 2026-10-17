"use server";

import { redirect } from "next/navigation";
import { addCustomerVisibleMessage, addInquiryNote, AdminInquiryError, updateInquiryAssignment, updateInquiryStatus } from "./api";
import { assignmentInputFromForm, messageInputFromForm, noteInputFromForm, statusInputFromForm } from "./form-mapping";

const errorPath = (id: string, error: unknown) => {
  const code = error instanceof AdminInquiryError ? error.code ?? error.kind : "failed";
  return `/admin/inquiries/${id}?error=${encodeURIComponent(code)}`;
};

export async function updateInquiryStatusAction(id: string, form: FormData) {
  const input = statusInputFromForm(form);
  try { await updateInquiryStatus(id, input.toStatus, input.expectedVersion); } catch (error) { redirect(errorPath(id, error)); }
  redirect(`/admin/inquiries/${id}?success=status`);
}

export async function updateInquiryAssignmentAction(id: string, form: FormData) {
  const input = assignmentInputFromForm(form);
  try { await updateInquiryAssignment(id, input.assignedAdminId, input.expectedVersion); } catch (error) { redirect(errorPath(id, error)); }
  redirect(`/admin/inquiries/${id}?success=assignment`);
}

export async function addInquiryNoteAction(id: string, form: FormData) {
  const input = noteInputFromForm(form);
  try { await addInquiryNote(id, input.text); } catch (error) { redirect(errorPath(id, error)); }
  redirect(`/admin/inquiries/${id}?success=note`);
}

export async function addCustomerVisibleMessageAction(id: string, form: FormData) {
  const input = messageInputFromForm(form);
  try { await addCustomerVisibleMessage(id, input.text, input.requestMoreInfo, input.expectedVersion); } catch (error) { redirect(errorPath(id, error)); }
  redirect(`/admin/inquiries/${id}?success=message`);
}
