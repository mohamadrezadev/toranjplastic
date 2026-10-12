import { adminMutate, adminRequest, isPage, listQueryString } from '../shared/client';
import { isAdminArticle } from './schema';
import type { ArticleInput } from './types';
import type { AdminListQuery } from '../shared/contracts';

export const listArticles = (query: AdminListQuery = {}) => adminRequest(`articles?${listQueryString(query)}`, isPage(isAdminArticle));
export const getArticle = (id: string) => adminRequest(`articles/${encodeURIComponent(id)}`, isAdminArticle);
export const createArticle = (input: ArticleInput) => adminMutate('articles', 'POST', input, isAdminArticle);
export const updateArticle = (id: string, input: Partial<ArticleInput>) => adminMutate(`articles/${encodeURIComponent(id)}`, 'PATCH', input, isAdminArticle);
export const publishArticle = (id: string) => adminMutate(`articles/${encodeURIComponent(id)}/publish`, 'POST', {}, isAdminArticle);
export const archiveArticle = (id: string) => adminMutate(`articles/${encodeURIComponent(id)}/archive`, 'POST', {}, isAdminArticle);
