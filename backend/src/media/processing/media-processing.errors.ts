export class MediaInvalidFileError extends Error {
  readonly code = 'MEDIA_INVALID_FILE';
  constructor() {
    super('The uploaded file is not a supported image.');
    this.name = 'MediaInvalidFileError';
  }
}

export class MediaUploadTooLargeError extends Error {
  readonly code = 'MEDIA_UPLOAD_TOO_LARGE';
  constructor() {
    super('The uploaded file exceeds the configured byte limit.');
    this.name = 'MediaUploadTooLargeError';
  }
}

export class MediaPixelLimitError extends Error {
  readonly code = 'MEDIA_PIXEL_LIMIT_EXCEEDED';
  constructor() {
    super('The uploaded image exceeds the configured pixel limit.');
    this.name = 'MediaPixelLimitError';
  }
}

export class MediaProcessingBusyError extends Error {
  readonly code = 'MEDIA_PROCESSING_BUSY';
  constructor() {
    super('Media processing capacity is currently exhausted.');
    this.name = 'MediaProcessingBusyError';
  }
}
