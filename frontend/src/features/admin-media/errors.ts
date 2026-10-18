export type AdminMediaErrorKind = 'validation' | 'conflict' | 'not_found' | 'forbidden' | 'failed';

export class AdminMediaError extends Error {
  constructor(
    public readonly kind: AdminMediaErrorKind,
    public readonly status: number,
    public readonly code?: string,
  ) {
    super(`Admin media request failed with status ${status}`);
    this.name = 'AdminMediaError';
  }
}
