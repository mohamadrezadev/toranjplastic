'use server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { AdminMediaError } from './errors';
import { deleteMedia, listMedia, uploadMedia } from './api';
import type { AdminMediaAsset, AdminMediaPage, AdminMediaQuery } from './types';

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

export async function uploadMediaItemAction(
  form: FormData,
): Promise<{ ok: true; asset: AdminMediaAsset } | { ok: false; error: string; code?: string }> {
  try {
    const asset = await uploadMedia(form);
    revalidatePath('/admin/media');
    return { ok: true, asset };
  } catch (error) {
    if (error instanceof AdminMediaError) {
      return { ok: false, error: error.kind, code: error.code };
    }
    return { ok: false, error: 'failed' };
  }
}

export async function listMediaAction(
  query: AdminMediaQuery = {},
): Promise<{ ok: true; data: AdminMediaPage } | { ok: false; error: string }> {
  try {
    const data = await listMedia(query);
    return { ok: true, data };
  } catch (error) {
    if (error instanceof AdminMediaError) {
      return { ok: false, error: error.code ?? error.kind };
    }
    return { ok: false, error: 'failed' };
  }
}

