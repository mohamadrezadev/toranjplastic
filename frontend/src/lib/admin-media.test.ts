// @vitest-environment node
import { afterEach, describe, expect, it, vi } from 'vitest';

const cookieJar = new Map([['toranj_session', 'session-token'], ['toranj_csrf', 'csrf-token']]);
vi.mock('next/headers', () => ({
  cookies: async () => ({
    getAll: () => Array.from(cookieJar, ([name, value]) => ({ name, value })),
    get: (name: string) => cookieJar.has(name) ? { name, value: cookieJar.get(name)! } : undefined,
  }),
}));

const { deleteMedia, listMedia, uploadMedia } = await import('../features/admin-media');

const asset = {
  id: 'media-1', status: 'READY', defaultAlt: 'تصویر', sourceMimeType: 'image/webp',
  sourceWidth: 800, sourceHeight: 600,
  variants: [{ name: 'card', width: 800, height: 600, bytes: 1200 }],
  referenceCount: 0, createdAt: '2026-10-18T00:00:00.000Z', updatedAt: '2026-10-18T00:00:00.000Z',
};

afterEach(() => vi.unstubAllGlobals());

describe('admin media server client', () => {
  it('forwards private cookies and bounded list filters with no-store', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ items: [asset], page: 2, pageSize: 20, total: 21, totalPages: 2 })));
    vi.stubGlobal('fetch', fetchMock);
    await expect(listMedia({ page: 2, status: 'READY', search: 'تصویر' })).resolves.toMatchObject({ total: 21 });
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit & { headers: Record<string, string> }];
    expect(url).toContain('page=2');
    expect(url).toContain('status=READY');
    expect(init.cache).toBe('no-store');
    expect(init.headers.cookie).toContain('toranj_session=session-token');
  });

  it('forwards multipart upload without overriding its boundary and attaches CSRF server-side', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify(asset), { status: 201 }));
    vi.stubGlobal('fetch', fetchMock);
    const form = new FormData();
    form.set('defaultAlt', 'تصویر');
    form.set('file', new Blob(['image'], { type: 'image/webp' }), 'image.webp');
    await uploadMedia(form);
    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit & { headers: Record<string, string> }];
    expect(init.body).toBe(form);
    expect(init.headers['x-csrf-token']).toBe('csrf-token');
    expect(init.headers['content-type']).toBeUndefined();
  });

  it('preserves stable guarded-delete error codes', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({ code: 'MEDIA_IN_USE' }), { status: 409 })));
    await expect(deleteMedia('media-1')).rejects.toMatchObject({ kind: 'conflict', code: 'MEDIA_IN_USE' });
  });
});
