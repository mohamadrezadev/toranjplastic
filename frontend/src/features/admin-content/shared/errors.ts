export type AdminContentErrorKind = 'validation' | 'conflict' | 'not_found' | 'failed';

export class AdminContentError extends Error {
  constructor(
    public readonly kind: AdminContentErrorKind,
    public readonly status: number,
    public readonly code?: string,
  ) {
    super(`Admin content request failed with status ${status}`);
    this.name = 'AdminContentError';
  }
}
