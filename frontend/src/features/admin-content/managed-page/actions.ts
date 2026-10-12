'use server';
import { archiveManagedPage, createManagedPage, publishManagedPage, updateManagedPage } from './api';
import { runAdminMutation } from '../shared/run-action';
import { managedPageInputFromForm } from './form-mapping';

export async function createManagedPageAction(form: FormData) { return runAdminMutation(() => createManagedPage(managedPageInputFromForm(form)), '/admin/pages/new', '/admin/pages'); }
export async function updateManagedPageAction(id: string, form: FormData) { return runAdminMutation(() => updateManagedPage(id, managedPageInputFromForm(form)), `/admin/pages/${id}`, `/admin/pages/${id}`); }
export async function publishManagedPageAction(id: string) { return runAdminMutation(() => publishManagedPage(id), `/admin/pages/${id}`, `/admin/pages/${id}`); }
export async function archiveManagedPageAction(id: string) { return runAdminMutation(() => archiveManagedPage(id), `/admin/pages/${id}`, `/admin/pages/${id}`); }
