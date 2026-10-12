import type { ContentStatus } from '../../generated/prisma/enums.js';
import type { AdminListQuery, PageResult } from '../shared/types.js';
import type { AdminArticle, ArticleWriteInput } from './types.js';
export const ADMIN_ARTICLE_REPOSITORY = Symbol('ADMIN_ARTICLE_REPOSITORY');
export interface AdminArticleRepository {
  list(request: AdminListQuery): Promise<PageResult<AdminArticle>>;
  get(id: string): Promise<AdminArticle | null>;
  create(input: ArticleWriteInput): Promise<AdminArticle>;
  update(
    id: string,
    input: Partial<ArticleWriteInput>,
  ): Promise<AdminArticle | null>;
  setStatus(
    id: string,
    status: ContentStatus,
    publishedAt: Date | null,
  ): Promise<AdminArticle | null>;
}
