'use server';
import { archiveArticle, createArticle, publishArticle, updateArticle } from './api';
import { runAdminMutation } from '../shared/run-action';
import { articleInputFromForm } from './form-mapping';

export async function createArticleAction(form: FormData) { return runAdminMutation(() => createArticle(articleInputFromForm(form)), '/admin/articles/new', '/admin/articles'); }
export async function updateArticleAction(id: string, form: FormData) { return runAdminMutation(() => updateArticle(id, articleInputFromForm(form)), `/admin/articles/${id}`, `/admin/articles/${id}`); }
export async function publishArticleAction(id: string) { return runAdminMutation(() => publishArticle(id), `/admin/articles/${id}`, `/admin/articles/${id}`); }
export async function archiveArticleAction(id: string) { return runAdminMutation(() => archiveArticle(id), `/admin/articles/${id}`, `/admin/articles/${id}`); }
