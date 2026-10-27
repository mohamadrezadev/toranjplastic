import { NextRequest, NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";

export async function POST(request: NextRequest) {
  const secret = process.env.STRAPI_REVALIDATE_SECRET || process.env.REVALIDATE_SECRET;

  if (!secret) {
    return NextResponse.json({ error: "Revalidation secret not configured" }, { status: 500 });
  }

  const authHeader = request.headers.get("x-strapi-revalidate-secret") ||
    request.headers.get("x-revalidate-secret") ||
    request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");

  if (!authHeader || authHeader !== secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: Record<string, unknown> = {};
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    // Body is optional
  }

  const paths: string[] = ["/articles", "/sitemap.xml"];
  const model = typeof body.model === "string" ? body.model : "";
  const entry = body.entry && typeof body.entry === "object" ? (body.entry as Record<string, unknown>) : null;

  if (entry) {
    const slug = typeof entry.slug === "string" ? entry.slug : "";
    if (model === "article" && slug) {
      paths.push(`/articles/${slug}`);
    }
    if (model === "category" && slug) {
      paths.push(`/articles/category/${slug}`);
    }

    const cat = entry.category && typeof entry.category === "object" ? (entry.category as Record<string, unknown>) : null;
    const catSlug = typeof cat?.slug === "string" ? cat.slug : "";
    if (catSlug) {
      paths.push(`/articles/category/${catSlug}`);
    }
  }

  // Invalidate paths
  for (const path of paths) {
    revalidatePath(path);
  }

  // Also invalidate cached fetch tag
  try {
    revalidateTag("strapi-articles", "max");
  } catch {
    // safe fallback
  }

  return NextResponse.json({
    revalidated: true,
    paths,
    now: Date.now(),
  });
}
