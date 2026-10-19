import Busboy from 'busboy';
import type { Request } from 'express';
import type { Readable } from 'node:stream';

export interface ParsedMediaUpload {
  stream: Readable;
  defaultAlt: Promise<string>;
}

export function parseMediaUpload(request: Request, maxUploadBytes: number): Promise<ParsedMediaUpload> {
  return new Promise((resolve, reject) => {
    let fileSeen = false;
    let settled = false;
    let resolveAlt!: (value: string) => void;
    let rejectAlt!: (reason: Error) => void;
    const defaultAlt = new Promise<string>((altResolve, altReject) => {
      resolveAlt = altResolve;
      rejectAlt = altReject;
    });
    // Busboy can reject this promise before the controller has received and
    // attached its consumer. Keep that early rejection handled while still
    // returning the original promise so the upload operation observes it.
    void defaultAlt.catch(() => undefined);
    let alt: string | undefined;
    const fail = (error: Error) => {
      rejectAlt(error);
      if (!settled) {
        settled = true;
        reject(error);
      }
    };

    let parser: ReturnType<typeof Busboy>;
    try {
      parser = Busboy({
        headers: request.headers,
        // Busboy emits `partsLimit` when the configured count is reached,
        // not only when it is exceeded. The valid payload has exactly two
        // parts (file + defaultAlt), so three is the first invalid count.
        limits: { files: 1, fields: 1, parts: 3, fileSize: maxUploadBytes },
      });
    } catch {
      fail(new Error('MEDIA_INVALID_MULTIPART'));
      return;
    }

    parser.on('file', (fieldName, stream) => {
      if (fieldName !== 'file' || fileSeen) {
        stream.resume();
        fail(new Error('MEDIA_INVALID_MULTIPART'));
        return;
      }
      fileSeen = true;
      stream.once('limit', () => stream.destroy(Object.assign(new Error('MEDIA_UPLOAD_TOO_LARGE'), { code: 'MEDIA_UPLOAD_TOO_LARGE' })));
      settled = true;
      resolve({ stream, defaultAlt });
    });
    parser.on('field', (name, value) => {
      if (name !== 'defaultAlt' || alt !== undefined) {
        fail(new Error('MEDIA_INVALID_MULTIPART'));
        return;
      }
      alt = value;
    });
    parser.once('filesLimit', () => fail(new Error('MEDIA_TOO_MANY_FILES')));
    parser.once('fieldsLimit', () => fail(new Error('MEDIA_TOO_MANY_FIELDS')));
    parser.once('partsLimit', () => fail(new Error('MEDIA_TOO_MANY_PARTS')));
    parser.once('error', (error: Error) => fail(error));
    parser.once('finish', () => {
      if (!fileSeen) {
        fail(new Error('MEDIA_FILE_REQUIRED'));
        return;
      }
      if (alt === undefined) {
        rejectAlt(new Error('MEDIA_ALT_REQUIRED'));
        return;
      }
      resolveAlt(alt);
    });
    request.pipe(parser);
  });
}
