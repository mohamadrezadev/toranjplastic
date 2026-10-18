'use server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { AdminMediaError } from './errors';
import { deleteMedia, uploadMedia } from './api';

function errorValue(error: unknown): string {
  if (error instanceof AdminMediaError) return error.code ?? error.kind;
  return 'failed';
}

export async function uploadMediaAction(form: FormData) {
  try {
    await uploadMedia(form);
  } catch (error) {
    redirect(`/admin/media?error=${encodeURIComponent(errorValue(error))}`);
  }
  revalidatePath('/admin/media');
  redirect('/admin/media?uploaded=1');
}

export async function deleteMediaAction(id: string) {
  try {
    await deleteMedia(id);
  } catch (error) {
    redirect(`/admin/media?error=${encodeURIComponent(errorValue(error))}`);
  }
  revalidatePath('/admin/media');
  redirect('/admin/media?deleted=1');
}
