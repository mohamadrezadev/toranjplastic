export class MediaStorageUnavailableError extends Error {
  constructor() {
    super('Media storage is unavailable.');
    this.name = 'MediaStorageUnavailableError';
  }
}

export class UnsafeMediaKeyError extends Error {
  constructor() {
    super('Media object key is unsafe.');
    this.name = 'UnsafeMediaKeyError';
  }
}
