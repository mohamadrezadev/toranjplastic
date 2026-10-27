import { NextRequest, NextResponse } from 'next/server';
import { fetchMediaPreview } from '@/features/admin-media';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const variant = request.nextUrl.searchParams.get('variant') ?? 'thumb';

  try {
    const upstream = await fetchMediaPreview(id, variant);
    if (!upstream.ok) {
      return new NextResponse(null, { status: upstream.status });
    }

    return new NextResponse(upstream.body, {
      status: upstream.status,
      headers: {
        'content-type': upstream.headers.get('content-type') ?? 'image/webp',
        'cache-control': 'no-store',
        'x-content-type-options': 'nosniff',
        ...(upstream.headers.get('etag') ? { etag: upstream.headers.get('etag')! } : {}),
      },
    });
  } catch {
    return new NextResponse(null, { status: 502 });
  }
}
