'use server';
import { archiveCategory, createCategory, publishCategory, updateCategory } from './api';
import { runAdminMutation } from '../shared/run-action';
import { categoryInputFromForm } from './form-mapping';

export async function createCategoryAction(form: FormData) { return runAdminMutation(() => createCategory(categoryInputFromForm(form)), '/admin/categories/new', '/admin/categories'); }
export async function updateCategoryAction(id: string, form: FormData) { return runAdminMutation(() => updateCategory(id, categoryInputFromForm(form)), `/admin/categories/${id}`, `/admin/categories/${id}`); }
export async function publishCategoryAction(id: string) { return runAdminMutation(() => publishCategory(id), `/admin/categories/${id}`, `/admin/categories/${id}`); }
export async function archiveCategoryAction(id: string) { return runAdminMutation(() => archiveCategory(id), `/admin/categories/${id}`, `/admin/categories/${id}`); }
