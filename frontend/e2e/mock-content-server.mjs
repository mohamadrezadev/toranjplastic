import { createServer } from "node:http";

const port = 3199;
const publishedAt = "2026-10-10T08:00:00.000Z";
const seo = { metaTitle: null, metaDescription: null };
const product = { id: "product-1", name: "سبد صنعتی نمونه", slug: "industrial-basket", summary: "خلاصه منتشرشده محصول", description: "توضیحات منتشرشده محصول.", category: { id: "category-1", name: "محصولات صنعتی", slug: "industrial" }, images: [{ url: "/catalog/refrigerator-organizer.webp", alt: "نظم‌دهنده‌های شفاف در طبقات یخچال", width: 1200, height: 1200 }], specifications: [{ label: "کد مرجع", value: "TRJ-P-001" }], featured: true, publishedAt, ...seo };
const article = { id: "article-1", title: "راهنمای انتخاب ماده", slug: "material-selection", summary: "خلاصه منتشرشده مقاله", body: "بند اول مقاله.\n\nبند دوم مقاله.", featuredImage: null, publishedAt, ...seo };
const page = (slug, title) => ({ id: `page-${slug}`, title, slug, summary: `خلاصه منتشرشده ${title}`, body: `متن منتشرشده ${title}.`, images: [], publishedAt, ...seo });
const collection = (items) => ({ items, pageInfo: { page: 1, pageSize: 12, total: items.length, totalPages: items.length ? 1 : 0 } });

const routes = new Map([
  ["/api/v1/health", { status: 200, body: { status: "ok" } }],
  ["/api/v1/public/content/products", { status: 200, body: collection([product]) }],
  ["/api/v1/public/content/products/industrial-basket", { status: 200, body: product }],
  ["/api/v1/public/content/services", { status: 200, body: collection([]) }],
  ["/api/v1/public/content/materials", { status: 503, body: { message: "fixture unavailable" } }],
  ["/api/v1/public/content/articles", { status: 200, body: collection([article]) }],
  ["/api/v1/public/content/articles/material-selection", { status: 200, body: article }],
  ["/api/v1/public/content/pages/about", { status: 200, body: page("about", "درباره ما") }],
  ["/api/v1/public/content/pages/contact", { status: 200, body: page("contact", "تماس با ما") }],
  ["/api/v1/public/content/pages/privacy", { status: 200, body: page("privacy", "حریم خصوصی") }],
  ["/api/v1/public/content/pages/terms", { status: 200, body: page("terms", "شرایط استفاده") }],
]);

createServer((request, response) => {
  const url = new URL(request.url ?? "/", `http://127.0.0.1:${port}`);
  if (url.pathname === "/api/v1/auth/login/password" && request.method === "POST") {
    response.writeHead(200, { "Content-Type": "application/json; charset=utf-8", "Set-Cookie": ["toranj_session=fixture-session; HttpOnly; Path=/; SameSite=Lax", "toranj_csrf=fixture-csrf; Path=/; SameSite=Lax"] });
    return response.end(JSON.stringify({ id: "admin-1", mobile: "+989123456789", displayName: "مدیر آزمون", email: null, companyName: null, role: "ADMIN", status: "ACTIVE", createdAt: publishedAt, lastLoginAt: publishedAt }));
  }
  if (url.pathname === "/api/v1/auth/register" && request.method === "POST") {
    response.writeHead(201, { "Content-Type": "application/json; charset=utf-8" });
    return response.end(JSON.stringify({ id: "customer-1", mobile: "+989123456789", displayName: "مشتری آزمون", email: null, companyName: null, role: "CUSTOMER", status: "ACTIVE", createdAt: publishedAt, lastLoginAt: null }));
  }
  if (url.pathname === "/api/v1/admin/access") {
    const cookie = request.headers.cookie ?? "";
    if (!cookie.includes("toranj_session=")) {
      response.writeHead(cookie.includes("fixture_customer=1") ? 403 : 401, { "Content-Type": "application/json; charset=utf-8" });
      return response.end(JSON.stringify({ message: "Unauthorized" }));
    }
    response.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
    return response.end(JSON.stringify({ authorized: true, account: { id: "admin-1", mobile: "+989123456789", displayName: "مدیر آزمون", email: null, companyName: null, role: "ADMIN", status: "ACTIVE", createdAt: publishedAt, lastLoginAt: publishedAt } }));
  }
  const fixture = routes.get(url.pathname) ?? { status: 404, body: { message: "Not Found" } };
  response.writeHead(fixture.status, { "Content-Type": "application/json; charset=utf-8" });
  response.end(JSON.stringify(fixture.body));
}).listen(port, "127.0.0.1");
