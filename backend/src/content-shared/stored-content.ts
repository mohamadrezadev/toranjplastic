export interface ContentImage {
  url: string;
  alt: string;
  width?: number;
  height?: number;
}

export interface ContentSpecification {
  label: string;
  value: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function positiveInteger(value: unknown): number | undefined {
  return typeof value === 'number' && Number.isInteger(value) && value > 0
    ? value
    : undefined;
}

function safeImageUrl(value: unknown): string | null {
  if (typeof value !== 'string' || value.trim() === '') return null;
  if (value.startsWith('/') && !value.startsWith('//')) return value;
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:'
      ? value
      : null;
  } catch {
    return null;
  }
}

export function normalizeImage(value: unknown): ContentImage | null {
  if (!isRecord(value)) return null;
  const url = safeImageUrl(value.url);
  if (url === null || typeof value.alt !== 'string') return null;
  const width = positiveInteger(value.width);
  const height = positiveInteger(value.height);
  return {
    url,
    alt: value.alt,
    ...(width === undefined ? {} : { width }),
    ...(height === undefined ? {} : { height }),
  };
}

export function normalizeImages(value: unknown): ContentImage[] {
  return Array.isArray(value)
    ? value.map(normalizeImage).filter((image): image is ContentImage => image !== null)
    : [];
}

export function normalizeSpecifications(value: unknown): ContentSpecification[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) =>
    isRecord(item) &&
    typeof item.label === 'string' &&
    item.label.trim() !== '' &&
    typeof item.value === 'string' &&
    item.value.trim() !== ''
      ? [{ label: item.label, value: item.value }]
      : [],
  );
}
