import { createServer } from "node:http";

const port = 3199;
const publishedAt = "2026-10-10T08:00:00.000Z";
const adminCapabilities = [
  "MANAGEMENT_ACCESS",
  "STAFF_MANAGEMENT",
  "INQUIRY_OPERATIONS",
  "QUOTATION_MANAGEMENT",
  "CONTENT_MANAGEMENT",
];
const salesCapabilities = [
  "MANAGEMENT_ACCESS",
  "INQUIRY_OPERATIONS",
  "QUOTATION_MANAGEMENT",
];
const operatorCapabilities = ["MANAGEMENT_ACCESS", "CONTENT_MANAGEMENT"];
const revokedSessions = new Set();
let retryableProductsFailures = 0;
const cookieValue = (request, name) =>
  (request.headers.cookie ?? "")
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${name}=`))
    ?.slice(name.length + 1) ?? null;
const accountForSession = (session) => {
  if (!session || revokedSessions.has(session)) return null;
  const base = {
    email: null,
    companyName: null,
    status: "ACTIVE",
    createdAt: publishedAt,
    lastLoginAt: publishedAt,
  };
  if (session.startsWith("sales-") || session.startsWith("target-revoke-"))
    return {
      ...base,
      id: "sales-1",
      mobile: "+989122222222",
      displayName: "کارشناس فروش آزمون",
      role: "SALES",
      capabilities: salesCapabilities,
    };
  if (session.startsWith("operator-"))
    return {
      ...base,
      id: "operator-1",
      mobile: "+989133333333",
      displayName: "اپراتور آزمون",
      role: "OPERATOR",
      capabilities: operatorCapabilities,
    };
  if (session.startsWith("customer-"))
    return {
      ...base,
      id: "customer-1",
      mobile: "+989144444444",
      displayName: "مشتری آزمون",
      role: "CUSTOMER",
      capabilities: [],
    };
  return {
    ...base,
    id: "admin-1",
    mobile: "+989123456789",
    displayName: "مدیر آزمون",
    role: "ADMIN",
    capabilities: adminCapabilities,
  };
};
const accountForRequest = (request) =>
  accountForSession(cookieValue(request, "toranj_session"));
const seo = { metaTitle: null, metaDescription: null };
const product = {
  id: "product-1",
  name: "سبد صنعتی نمونه",
  slug: "industrial-basket",
  summary: "خلاصه منتشرشده محصول",
  description: "توضیحات منتشرشده محصول.",
  category: { id: "category-1", name: "محصولات صنعتی", slug: "industrial" },
  images: [
    {
      url: "/catalog/refrigerator-organizer.webp",
      alt: "نظم‌دهنده‌های شفاف در طبقات یخچال",
      width: 1200,
      height: 1200,
    },
  ],
  specifications: [{ label: "کد مرجع", value: "TRJ-P-001" }],
  featured: true,
  publishedAt,
  ...seo,
};
const article = {
  id: "article-1",
  title: "راهنمای انتخاب ماده",
  slug: "material-selection",
  summary: "خلاصه منتشرشده مقاله",
  body: "بند اول مقاله.\n\nبند دوم مقاله.",
  featuredImage: null,
  publishedAt,
  ...seo,
};
const strapiArticles = [
  {
    documentId: "art-1",
    id: 1,
    title: "راهنمای انتخاب ماده",
    slug: "material-selection",
    summary: "خلاصه منتشرشده مقاله",
    body: "بند اول مقاله.\n\nبند دوم مقاله.",
    publishedAt,
    featuredImage: null,
    category: {
      documentId: "cat-2",
      id: 2,
      name: "انتخاب مواد",
      slug: "materials-selection-category",
      description: "دسته‌بندی راهنما",
    },
    tags: [],
    seo: {
      metaTitle: "راهنمای انتخاب ماده",
      metaDescription: "خلاصه مقاله",
    },
  },
  {
    documentId: "art-2",
    id: 2,
    title: "راهنمای انتخاب مواد اولیه در قالب‌گیری تزریق پلاستیک",
    slug: "plastic-injection-material-selection-guide",
    summary: "خلاصه مقاله راهنمای انتخاب مواد اولیه",
    body: "انتخاب ماده اولیه پلیمری در فرایند تزریق پلاستیک صنعتی مستلزم بررسی پارامترهای مختلفی است.",
    publishedAt,
    featuredImage: null,
    category: {
      documentId: "cat-1",
      id: 1,
      name: "فناوری و تولید",
      slug: "tech-production",
      description: "دسته‌بندی فنی",
    },
    tags: [],
    seo: {
      metaTitle: "راهنمای انتخاب مواد اولیه در قالب‌گیری تزریق پلاستیک",
      metaDescription: "خلاصه مقاله راهنمای انتخاب مواد اولیه",
    },
  },
];
const page = (slug, title) => ({
  id: `page-${slug}`,
  title,
  slug,
  summary: `خلاصه منتشرشده ${title}`,
  body: `متن منتشرشده ${title}.`,
  images: [],
  publishedAt,
  ...seo,
});
const collection = (items) => ({
  items,
  pageInfo: {
    page: 1,
    pageSize: 12,
    total: items.length,
    totalPages: items.length ? 1 : 0,
  },
});
const lifecycle = {
  contentVersion: 0,
  displayOrder: 0,
  status: "DRAFT",
  publishedAt: null,
  createdAt: publishedAt,
  updatedAt: publishedAt,
  ...seo,
};
const adminCategory = {
  id: "admin-category-1",
  name: "دسته آزمایشی",
  slug: "test-category",
  description: null,
  image: null,
  ...lifecycle,
};
const adminProduct = {
  id: "admin-product-1",
  name: "محصول آزمایشی",
  slug: "test-product",
  summary: null,
  description: null,
  categoryId: adminCategory.id,
  images: [],
  specifications: [],
  featured: false,
  ...lifecycle,
};
const adminService = {
  id: "admin-service-1",
  name: "خدمت آزمایشی",
  slug: "test-service",
  summary: null,
  description: null,
  images: [],
  specifications: [],
  ctaLabel: null,
  ctaHref: null,
  ...lifecycle,
};
const adminMaterial = {
  id: "admin-material-1",
  name: "ماده آزمایشی",
  slug: "test-material",
  family: null,
  grade: null,
  manufacturer: null,
  summary: null,
  description: null,
  images: [],
  specifications: [],
  inquiryAvailable: true,
  ...lifecycle,
};
const adminArticle = {
  id: "admin-article-1",
  title: "مقاله آزمایشی",
  slug: "test-article",
  summary: null,
  body: "متن آزمون",
  featuredImage: null,
  ...lifecycle,
};
const adminPage = {
  id: "admin-page-1",
  title: "صفحه آزمایشی",
  slug: "test-page",
  summary: null,
  body: "متن آزمون",
  images: [],
  ...lifecycle,
};
const inquiryHistory = {
  id: "history-1",
  fromStatus: null,
  toStatus: "SUBMITTED",
  createdAt: publishedAt,
};
const adminSummary = {
  id: "admin-1",
  displayName: "مدیر آزمون",
  mobile: "+989123456789",
};
const ownerSummary = {
  id: "customer-1",
  displayName: "مشتری آزمون",
  mobile: "+989111111111",
  companyName: "شرکت نمونه",
};
const inquiry = {
  id: "inquiry-1",
  type: "PRODUCT",
  status: "SUBMITTED",
  catalogItemName: product.name,
  description: "درخواست آزمون",
  approximateQuantity: "100",
  quantityUnit: null,
  deliveryCity: "تهران",
  requestedTiming: null,
  partDescription: null,
  moldStatus: null,
  materialName: null,
  color: null,
  materialRequestKind: null,
  polymerName: null,
  grade: null,
  brand: null,
  materialCondition: null,
  application: null,
  specifications: null,
  createdAt: publishedAt,
  updatedAt: publishedAt,
  statusHistory: [inquiryHistory],
  messages: [],
};

const adminInquiry = {
  ...inquiry,
  version: 0,
  ownerSummary,
  assigneeSummary: null,
  allowedTransitions: ["UNDER_REVIEW", "REJECTED"],
  statusHistory: [
    {
      ...inquiryHistory,
      actorSummary: { id: "customer-1", displayName: "مشتری آزمون" },
    },
  ],
  assignmentHistory: [],
  internalNotes: [
    {
      id: "note-1",
      text: "یادداشت فقط برای کارکنان",
      authorSummary: adminSummary,
      createdAt: publishedAt,
    },
  ],
  messages: [],
};

const quotationItem = {
  id: "quotation-item-1",
  position: 0,
  description: "سبد صنعتی سفارشی",
  quantity: "100",
  unit: "عدد",
  unitPriceRials: "250000",
  lineTotalRials: "25000000",
};
const quotationSnapshot = {
  id: "quotation-1",
  inquiryId: "inquiry-1",
  quotationNumber: "TRJ-Q-0001",
  version: 1,
  items: [quotationItem],
  subtotalRials: "25000000",
  discountRials: "1000000",
  taxRials: "2400000",
  additionalCostRials: "500000",
  totalRials: "26900000",
  validUntil: "2027-01-31T20:29:59.000Z",
  deliveryTerms: "تحویل پس از تأیید برنامه تولید",
  paymentTerms: "پنجاه درصد پیش‌پرداخت",
  notes: "این سند فقط برای همین درخواست معتبر است.",
  createdAt: publishedAt,
  updatedAt: publishedAt,
};
const adminDraftQuotation = {
  ...quotationSnapshot,
  editVersion: 0,
  status: "DRAFT",
  sentAt: null,
  respondedAt: null,
  rejectionReason: null,
};
const adminSentQuotation = {
  ...quotationSnapshot,
  editVersion: 1,
  status: "SENT",
  sentAt: publishedAt,
  respondedAt: null,
  rejectionReason: null,
};
const customerSentQuotation = {
  ...quotationSnapshot,
  status: "SENT",
  sentAt: publishedAt,
  respondedAt: null,
  rejectionReason: null,
};

const routes = new Map([
  ["/api/v1/health", { status: 200, body: { status: "ok" } }],
  [
    "/api/v1/public/content/products",
    { status: 200, body: collection([product]) },
  ],
  [
    "/api/v1/public/content/products/industrial-basket",
    { status: 200, body: product },
  ],
  ["/api/v1/public/content/services", { status: 200, body: collection([]) }],
  [
    "/api/v1/public/content/materials",
    { status: 503, body: { message: "fixture unavailable" } },
  ],
  [
    "/api/v1/public/content/articles",
    { status: 200, body: collection([article]) },
  ],
  [
    "/api/v1/public/content/articles/material-selection",
    { status: 200, body: article },
  ],
  [
    "/api/v1/public/content/pages/about",
    { status: 200, body: page("about", "درباره ما") },
  ],
  [
    "/api/v1/public/content/pages/contact",
    { status: 200, body: page("contact", "تماس با ما") },
  ],
  [
    "/api/v1/public/content/pages/privacy",
    { status: 200, body: page("privacy", "حریم خصوصی") },
  ],
  [
    "/api/v1/public/content/pages/terms",
    { status: 200, body: page("terms", "شرایط استفاده") },
  ],
]);

routes.set("/api/v1/admin/content/categories", {
  status: 200,
  body: collection([adminCategory]),
});
routes.set("/api/v1/admin/content/products", {
  status: 200,
  body: collection([adminProduct]),
});
routes.set("/api/v1/admin/content/services", {
  status: 200,
  body: collection([adminService]),
});
routes.set("/api/v1/admin/content/materials", {
  status: 200,
  body: collection([adminMaterial]),
});
routes.set("/api/v1/admin/content/articles", {
  status: 200,
  body: collection([adminArticle]),
});
routes.set("/api/v1/admin/content/pages", {
  status: 200,
  body: collection([adminPage]),
});
routes.set("/api/v1/admin/content/categories/admin-category-1", {
  status: 200,
  body: adminCategory,
});
routes.set("/api/v1/admin/content/products/admin-product-1", {
  status: 200,
  body: adminProduct,
});
routes.set("/api/v1/admin/content/services/admin-service-1", {
  status: 200,
  body: adminService,
});
routes.set("/api/v1/admin/content/materials/admin-material-1", {
  status: 200,
  body: adminMaterial,
});
routes.set("/api/v1/admin/content/articles/admin-article-1", {
  status: 200,
  body: adminArticle,
});
routes.set("/api/v1/admin/content/pages/admin-page-1", {
  status: 200,
  body: adminPage,
});

const adminMediaAsset = {
  id: "admin-media-1",
  status: "READY",
  defaultAlt: "تصویر نمونه محصول",
  sourceMimeType: "image/webp",
  sourceWidth: 1200,
  sourceHeight: 1200,
  variants: [
    { name: "thumb", width: 320, height: 320, bytes: 15000 },
    { name: "card", width: 800, height: 800, bytes: 45000 },
    { name: "detail", width: 1600, height: 1600, bytes: 95000 },
  ],
  referenceCount: 0,
  createdAt: publishedAt,
  updatedAt: publishedAt,
};

routes.set("/api/v1/admin/media", {
  status: 200,
  body: {
    items: [adminMediaAsset],
    page: 1,
    pageSize: 50,
    total: 1,
    totalPages: 1,
  },
});
routes.set("/api/v1/admin/media/admin-media-1", {
  status: 200,
  body: adminMediaAsset,
});
routes.set("/api/v1/admin/media/admin-media-1/preview", {
  status: 200,
  headers: {
    "content-type": "image/webp",
    "cache-control": "no-store",
  },
  body: Buffer.from([0x52, 0x49, 0x46, 0x46, 0x1a, 0x00, 0x00, 0x00, 0x57, 0x45, 0x42, 0x50, 0x56, 0x50, 0x38, 0x4c, 0x0d, 0x00, 0x00, 0x00, 0x2f, 0x00, 0x00, 0x00, 0x10, 0x07, 0x10, 0x11, 0x11, 0x88, 0x88, 0xfe, 0x07, 0x00]),
});

const adminRecords = {
  categories: adminCategory,
  products: adminProduct,
  services: adminService,
  materials: adminMaterial,
  articles: adminArticle,
  pages: adminPage,
};

/*
 * ===========================================================================
 * Public content variant fixtures (OpenSpec change rebuild-ui-with-astryx,
 * task 5.4). Every variant sits behind a discriminator that the legacy specs
 * never request, so the legacy responses above and below stay what they were.
 * One legacy answer is corrected on purpose: /api/categories used to ignore
 * its slug filter (see the Strapi notes). The discriminators:
 *
 * Backend public content (/api/v1/public/content)
 * - products?page=2 and ?page=3: the middle and last page of a 17-item
 *   collection (6, 6 and 5 items; the fixture caps every page at 6 items, so
 *   its pageInfo says pageSize 6). ?page=99: HTTP 200 with no items, the empty
 *   collection. Page 1 and page 97 (the fail-once retry fixture) keep the
 *   legacy single-product answers, so a first page of a multi-page products
 *   collection cannot exist without changing them.
 * - products/<slug>: fixture-product-no-image (no image), -long (long title,
 *   summary, category and code), -bright (near-white image), -gallery (four
 *   images), -portrait (portrait image), plus numbered fillers
 *   fixture-product-NN. fixture-product-longtoken (a title, summary and code
 *   with no break opportunity) is reachable by slug only, never listed.
 * - materials?page=2 and ?page=3 (17 items, 6/6/5), ?page=99 (empty). Page 1
 *   and every other page stay HTTP 503, the legacy error fixture.
 * - materials/<slug>: fixture-material-open (inquiryAvailable true, three
 *   images, LTR specification values), -closed (inquiryAvailable false),
 *   -long-grade (a long LTR grade tag), -no-image, plus numbered fillers.
 * - services?page=2 and ?page=3 (17 items, 6/6/5). Page 1 stays empty.
 * - services/<slug>: fixture-service-cta (a long CMS ctaLabel and the safe
 *   ctaHref /contact, three images), -plain (no call to action), -unsafe (a
 *   javascript: ctaHref that the page must ignore), -no-image, plus fillers.
 * - Managed pages (about, contact, privacy, terms) are NOT varied: their
 *   routes request fixed slugs and carry no query parameter, so a variant
 *   would have to replace the legacy response. They keep images: [].
 *
 * Media served by this mock (small generated SVG, nothing stored in the repo)
 * - /api/v1/media/public/fixture-<w>x<h>-<tone>/<variant>: the path shape the
 *   backend publishes for public media (next.config.ts remotePatterns allow
 *   /api/v1/media/public/** for MEDIA_PUBLIC_ORIGIN).
 * - /uploads/fixture-<w>x<h>-<tone>.svg: the path shape of Strapi media
 *   (next.config.ts allows /uploads/** for the Strapi origin). Strapi image
 *   URLs are relative and the app resolves them against STRAPI_API_URL.
 * - tone is a, b, c, d, e (gradients) or bright (a near-white image with no
 *   gradient). fixture-missing-* answers 404: an image that never loads.
 *
 * Strapi (/api/articles and /api/categories)
 * - /api/articles with pagination[page]=2 or 3 and no category filter: the
 *   middle and last page of an 18-article universe (6 per page).
 *   pagination[page]=99 and no filter: an empty page.
 * - filters[category][slug][$eq]=fixture-paginated: 13 articles in three pages
 *   (6, 6 and 1), so the category page has a first, a middle and a last page.
 *   fixture-rich: the rich article and three related ones. fixture-long-category:
 *   one article under a very long category name. fixture-empty: no articles.
 *   Every other category filter keeps the legacy answer.
 * - filters[slug][$eq]=<slug> for the fixture slugs: fixture-rich-article
 *   (featured image, six tags, long words, URL, email and an identifier in the
 *   body, three related articles), fixture-related-1 .. -3 (an image, no image,
 *   an image that 404s), fixture-long-category-article and fixture-paginated-NN.
 *   fixture-long-tags-article (no category, two tags far longer than a phone
 *   width) is reachable by slug only, never listed.
 * - /api/categories?filters[slug][$eq]=<slug> now honours the filter: the two
 *   legacy categories and the four fixture categories resolve to themselves
 *   and any other slug (for example missing-category) answers an empty list,
 *   the route's not-found experience. Before, every slug resolved to the
 *   first legacy category. Without the filter the list is still the legacy
 *   pair, so the category strip on /articles is unchanged.
 * ===========================================================================
 */
const fixturePageSize = 6;
const fixtureOrigin = `http://127.0.0.1:${port}`;
const faNumber = (value) => value.toLocaleString("fa-IR");

const imageTones = {
  a: ["#cfe0e4", "#7fa6b0"],
  b: ["#e8dcc8", "#b79a6a"],
  c: ["#d8e2d0", "#86a36f"],
  d: ["#dcd2e6", "#9a82b5"],
  e: ["#e6d2d2", "#b57d7d"],
  bright: ["#f8f8f8", "#f8f8f8"],
};
const fixtureImageSvg = (width, height, tone) => {
  const [from, to] = imageTones[tone] ?? imageTones.a;
  const guides = tone === "bright"
    ? ""
    : `<path d="M0 ${height}L${width} 0M0 0L${width} ${height}" stroke="rgba(0,0,0,.16)" stroke-width="${Math.max(2, Math.round(width / 300))}"/>`
      + `<text x="50%" y="50%" text-anchor="middle" dominant-baseline="middle" font-family="monospace" font-size="${Math.round(Math.min(width, height) / 9)}" fill="rgba(0,0,0,.55)">FIXTURE ${width}x${height}</text>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`
    + `<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${from}"/><stop offset="1" stop-color="${to}"/></linearGradient></defs>`
    + `<rect width="${width}" height="${height}" fill="url(#g)"/>${guides}`
    + `<rect x="6" y="6" width="${width - 12}" height="${height - 12}" fill="none" stroke="rgba(0,0,0,.25)" stroke-width="4"/></svg>`;
};
const serveFixtureImage = (response, name) => {
  const match = name.match(/^fixture-(\d{2,4})x(\d{2,4})-([a-z]+)$/);
  if (!match) {
    response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" });
    return response.end("fixture image not found");
  }
  response.writeHead(200, { "Content-Type": "image/svg+xml", "Cache-Control": "no-store" });
  return response.end(fixtureImageSvg(Number(match[1]), Number(match[2]), match[3]));
};

const sendJson = (response, status, body) => {
  response.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
  });
  response.end(JSON.stringify(body));
};
const pagedCollection = (items, page) => ({
  items: items.slice((page - 1) * fixturePageSize, page * fixturePageSize),
  pageInfo: {
    page,
    pageSize: fixturePageSize,
    total: items.length,
    totalPages: Math.ceil(items.length / fixturePageSize),
  },
});

const backendImage = (width, height, tone, alt = "تصویر آزمایشی") => ({
  url: `${fixtureOrigin}/api/v1/media/public/fixture-${width}x${height}-${tone}/card`,
  alt,
  width,
  height,
});
const longLtr = "TRJ-FIXTURE-IDENTIFIER-WITH-NO-BREAK-OPPORTUNITY-0123456789-ABCDEFGHIJKLMNOPQRSTUVWXYZ-REV-A/B";
const longPersianTitle = "عنوان آزمایشی بسیار طولانی برای بررسی شکستن سطر در کارت، عنوان صفحه و مسیر ناوبری در همه عرض‌های صفحه";
const longProse = "این بند آزمایشی فقط برای اندازه‌گیری طول خط در متن‌های بلند نوشته شده است و هیچ ادعای فنی، قیمت، موجودی یا مشخصه محصولی ندارد. ".repeat(5).trim();
const longPersianSummary = "خلاصه آزمایشی بسیار طولانی که فقط برای بررسی کوتاه‌شدن سه‌سطری متن در کارت و شکستن سطرها در عرض‌های کم نوشته شده است و هیچ ادعای فنی، قیمت یا موجودی ندارد و چند بار تکرار می‌شود تا از سه سطر بیشتر شود.";
const fixtureProductCategory = { id: "category-fixture", name: "دسته‌بندی آزمایشی", slug: "fixture-category" };
const fixtureLongProductCategory = {
  id: "category-fixture-long",
  name: "دسته‌بندی آزمایشی با نامی بسیار طولانی برای بررسی شکستن سطر در برچسب کارت",
  slug: "fixture-long-category",
};

const fixtureProduct = (n) => {
  const base = {
    id: `fixture-product-${n}`,
    name: `محصول آزمایشی شماره ${faNumber(n)}`,
    slug: `fixture-product-${String(n).padStart(2, "0")}`,
    summary: `خلاصه آزمایشی محصول شماره ${faNumber(n)} برای بررسی چیدمان کارت.`,
    description: "توضیحات آزمایشی منتشرشده.\n\nبند دوم توضیحات آزمایشی.",
    category: fixtureProductCategory,
    images: [backendImage(1200, 1200, ["a", "b", "c", "d", "e"][n % 5])],
    specifications: [{ label: "کد مرجع", value: `TRJ-P-${String(n).padStart(3, "0")}` }],
    featured: n % 5 === 0,
    publishedAt,
    ...seo,
  };
  const special = {
    7: {},
    8: { slug: "fixture-product-no-image", name: "محصول آزمایشی بدون تصویر", images: [] },
    9: {
      slug: "fixture-product-long",
      name: `سبد صنعتی ${longPersianTitle}`,
      summary: longPersianSummary,
      description: `${longProse}

بند دوم توضیحات آزمایشی.`,
      category: fixtureLongProductCategory,
      featured: true,
      specifications: [
        { label: "کد مرجع", value: longLtr },
        { label: "برچسب بسیار طولانی برای بررسی شکستن سطر در ستون برچسب جدول مشخصات", value: "مقدار فارسی آزمایشی که برای بررسی شکستن سطر در ستون مقدار کمی طولانی نوشته شده است" },
      ],
    },
    10: { slug: "fixture-product-bright", name: "محصول آزمایشی با تصویر روشن", images: [backendImage(1200, 900, "bright")] },
    11: {
      slug: "fixture-product-gallery",
      name: "محصول آزمایشی با چند تصویر",
      images: [backendImage(1600, 900, "a"), backendImage(900, 1200, "b"), backendImage(1200, 1200, "c"), backendImage(1600, 900, "d")],
      specifications: [
        { label: "کد مرجع", value: "TRJ-P-011" },
        { label: "ردیف بسته‌بندی", value: "LOT.2026.0011/A" },
        { label: "توضیح", value: "مقدار فارسی آزمایشی" },
      ],
    },
    12: { slug: "fixture-product-portrait", name: "محصول آزمایشی با تصویر عمودی", images: [backendImage(900, 1200, "c")] },
  }[n];
  return { ...base, ...(special ?? {}) };
};
const fixtureProducts = Array.from({ length: 17 }, (_, index) => fixtureProduct(index + 1));
// Reachable by slug only (never listed): a title, summary and code with no break opportunity.
const fixtureProductExtras = [
  {
    ...fixtureProduct(18),
    slug: "fixture-product-longtoken",
    name: "TRJ-FIXTURE-PRODUCT-NAME-WITH-NO-BREAK-OPPORTUNITY-0123456789-ABCDEFGHIJKLMNOPQRSTUVWXYZ",
    summary: longLtr,
    specifications: [{ label: "کد مرجع", value: longLtr }],
  },
];

const fixtureMaterialFamily = "خانواده آزمایشی پلیمر";
const fixtureMaterial = (n) => {
  const base = {
    id: `fixture-material-${n}`,
    name: `ماده آزمایشی شماره ${faNumber(n)}`,
    slug: `fixture-material-${String(n).padStart(2, "0")}`,
    family: fixtureMaterialFamily,
    grade: `TRJ-GR-${String(1000 + n)}`,
    manufacturer: null,
    summary: `خلاصه آزمایشی ماده شماره ${faNumber(n)} برای بررسی چیدمان کارت.`,
    description: "توضیحات آزمایشی منتشرشده.\n\nبند دوم توضیحات آزمایشی.",
    images: [backendImage(1200, 900, ["a", "b", "c", "d", "e"][n % 5])],
    specifications: [{ label: "کد مرجع", value: `TRJ-M-${String(n).padStart(3, "0")}` }],
    inquiryAvailable: true,
    publishedAt,
    ...seo,
  };
  const special = {
    7: {
      slug: "fixture-material-open",
      name: "ماده آزمایشی باز برای استعلام",
      manufacturer: "تولیدکننده آزمایشی",
      description: `${longProse}

بند دوم توضیحات آزمایشی.`,
      images: [backendImage(1600, 900, "a"), backendImage(900, 1200, "b"), backendImage(1200, 1200, "c")],
      specifications: [
        { label: "گرید", value: "TRJ-GR-1007" },
        { label: "کد مرجع", value: "TRJ-M-007" },
        { label: "شناسه دسته", value: "TRJ-BATCH-0000000000000000000000000000000000000001-REV-A-FIXTURE" },
        { label: "یادداشت", value: "مقدار فارسی آزمایشی" },
      ],
    },
    8: {
      slug: "fixture-material-closed",
      name: "ماده آزمایشی بدون استعلام",
      inquiryAvailable: false,
      images: [backendImage(1200, 900, "d")],
      specifications: [{ label: "گرید", value: "TRJ-GR-1008" }],
    },
    9: {
      slug: "fixture-material-long-grade",
      name: "ماده آزمایشی با گرید بسیار طولانی",
      grade: longLtr,
      manufacturer: "تولیدکننده‌ای با نامی بسیار طولانی برای بررسی شکستن سطر در برچسب",
    },
    10: { slug: "fixture-material-no-image", name: "ماده آزمایشی بدون تصویر", images: [], family: null, grade: null },
  }[n];
  return { ...base, ...(special ?? {}) };
};
const fixtureMaterials = Array.from({ length: 17 }, (_, index) => fixtureMaterial(index + 1));

const fixtureService = (n) => {
  const base = {
    id: `fixture-service-${n}`,
    name: `خدمت آزمایشی شماره ${faNumber(n)}`,
    slug: `fixture-service-${String(n).padStart(2, "0")}`,
    summary: `خلاصه آزمایشی خدمت شماره ${faNumber(n)} برای بررسی چیدمان کارت.`,
    description: "توضیحات آزمایشی منتشرشده.\n\nبند دوم توضیحات آزمایشی.",
    images: [backendImage(1200, 900, ["a", "b", "c", "d", "e"][n % 5])],
    specifications: [{ label: "کد مرجع", value: `TRJ-S-${String(n).padStart(3, "0")}` }],
    ctaLabel: null,
    ctaHref: null,
    publishedAt,
    ...seo,
  };
  const special = {
    7: {
      slug: "fixture-service-cta",
      name: "خدمت آزمایشی با دعوت به اقدام",
      description: `${longProse}

بند دوم توضیحات آزمایشی.`,
      images: [backendImage(1600, 900, "a"), backendImage(1200, 1200, "b"), backendImage(900, 1200, "c")],
      ctaLabel: "برای بررسی این خدمت با واحد مربوطه تماس بگیرید و مشخصات قالب و قطعه را همراه با توضیحات تکمیلی ارسال کنید",
      ctaHref: "/contact",
    },
    8: { slug: "fixture-service-plain", name: "خدمت آزمایشی بدون دعوت به اقدام" },
    9: {
      slug: "fixture-service-unsafe",
      name: "خدمت آزمایشی با نشانی نامعتبر",
      ctaLabel: "دعوت به اقدام با نشانی نامعتبر",
      ctaHref: "javascript:alert(1)",
    },
    10: { slug: "fixture-service-no-image", name: "خدمت آزمایشی بدون تصویر", images: [] },
  }[n];
  return { ...base, ...(special ?? {}) };
};
const fixtureServices = Array.from({ length: 17 }, (_, index) => fixtureService(index + 1));

const strapiImage = (width, height, tone, alt = "تصویر آزمایشی") => ({
  url: `/uploads/fixture-${width}x${height}-${tone}.svg`,
  alternativeText: alt,
  name: `fixture-${width}x${height}-${tone}.svg`,
  width,
  height,
});
const strapiMissingImage = (index) => ({
  url: `/uploads/fixture-missing-${index}.svg`,
  alternativeText: "تصویر آزمایشی که بارگذاری نمی‌شود",
  name: `fixture-missing-${index}.svg`,
  width: 1200,
  height: 900,
});
const fixtureCategories = {
  paginated: { documentId: "cat-f1", id: 11, name: "دسته آزمایشی صفحه‌بندی", slug: "fixture-paginated", description: "دسته‌بندی آزمایشی با چند صفحه مقاله" },
  rich: { documentId: "cat-f2", id: 12, name: "دسته آزمایشی تصویری", slug: "fixture-rich", description: "دسته‌بندی آزمایشی مقاله‌های تصویری" },
  longName: {
    documentId: "cat-f3",
    id: 13,
    name: "دسته‌بندی آزمایشی با نامی بسیار طولانی برای بررسی شکستن سطر در برچسب‌ها و نوار دسته‌ها",
    slug: "fixture-long-category",
    description: "دسته‌بندی آزمایشی با نام طولانی",
  },
  empty: { documentId: "cat-f4", id: 14, name: "دسته آزمایشی بدون مقاله", slug: "fixture-empty", description: "دسته‌بندی آزمایشی بدون مقاله" },
};
const legacyStrapiCategories = [
  { documentId: "cat-1", id: 1, name: "فناوری و تولید", slug: "tech-production", description: "دسته‌بندی فنی" },
  { documentId: "cat-2", id: 2, name: "انتخاب مواد", slug: "materials-selection-category", description: "دسته‌بندی راهنما" },
];
const knownStrapiCategories = [...legacyStrapiCategories, ...Object.values(fixtureCategories)];
const strapiFixtureArticle = ({ n, slug, title, summary, body, image, category, tags = [] }) => ({
  documentId: `fx-art-${n}`,
  id: 100 + n,
  title,
  slug,
  summary,
  body,
  publishedAt,
  featuredImage: image,
  category,
  tags,
  seo: { metaTitle: title, metaDescription: summary },
});
// Index n of the 13 paginated articles: an image, no image, a missing image and a bright image, in a fixed mix.
const pagedArticleImages = {
  1: strapiImage(1600, 900, "a"),
  3: strapiImage(1200, 1200, "b"),
  5: strapiMissingImage(5),
  6: strapiImage(900, 1200, "c"),
  7: strapiImage(1600, 900, "d"),
  9: strapiImage(1200, 900, "bright"),
  11: strapiImage(1200, 1200, "e"),
  13: strapiImage(1600, 900, "a"),
};
const pagedArticles = Array.from({ length: 13 }, (_, index) => {
  const n = index + 1;
  return strapiFixtureArticle({
    n,
    slug: `fixture-paginated-${String(n).padStart(2, "0")}`,
    title: n === 4 ? `مقاله آزمایشی ${longPersianTitle}` : `مقاله آزمایشی شماره ${faNumber(n)}`,
    summary: n === 4 ? longPersianSummary : `خلاصه آزمایشی مقاله شماره ${faNumber(n)} برای بررسی چیدمان کارت.`,
    body: "بند اول متن آزمایشی.\n\nبند دوم متن آزمایشی.",
    image: pagedArticleImages[n] ?? null,
    category: fixtureCategories.paginated,
  });
});
const richTags = [
  { documentId: "tag-1", id: 1, name: "برچسب کوتاه", slug: "fixture-tag-1" },
  { documentId: "tag-2", id: 2, name: "برچسب دوم", slug: "fixture-tag-2" },
  { documentId: "tag-3", id: 3, name: "برچسب آزمایشی با چند کلمه برای بررسی", slug: "fixture-tag-3" },
  { documentId: "tag-4", id: 4, name: "TRJ-FIXTURE-TAG-0123", slug: "fixture-tag-4" },
  { documentId: "tag-5", id: 5, name: "برچسب پنجم", slug: "fixture-tag-5" },
  { documentId: "tag-6", id: 6, name: "برچسب ششم", slug: "fixture-tag-6" },
];
// Extreme CMS tags, used only by fixture-long-tags-article: far longer than a phone width.
const extremeTags = [
  { documentId: "tag-7", id: 7, name: "برچسب آزمایشی بسیار طولانی برای بررسی شکستن سطر و اندازه توکن در عرض‌های کم صفحه", slug: "fixture-tag-7" },
  { documentId: "tag-8", id: 8, name: "TRJ-FIXTURE-TAG-WITH-NO-BREAK-OPPORTUNITY-0123456789-ABCDEFGHIJKLMNOPQRSTUVWXYZ", slug: "fixture-tag-8" },
  { documentId: "tag-9", id: 9, name: "برچسب کوتاه", slug: "fixture-tag-1" },
];
const longPersianWord = "بسیارطولانیبدونفاصلهبرایآزمونشکستنخطدرمتنفارسیکهنبایدسرریزکندوبایدکامل‌دیده‌شود";
const richBody = [
  "بند اول مقاله آزمایشی با تصویر شاخص، چند برچسب و مقاله‌های مرتبط.",
  longProse,
  `واژه‌ای بسیار طولانی و بدون فاصله: ${longPersianWord}`,
  `شناسه آزمایشی بسیار طولانی: ${longLtr}`,
  "نشانی آزمایشی: https://example.com/fixture/very/long/path/segment/without/any/break/opportunity/0123456789/abcdefghijklmnopqrstuvwxyz?query=value&another=parameter#fragment-identifier",
  "ایمیل آزمایشی: very.long.fixture.email.address.for.overflow.testing@subdomain.example-domain-for-fixtures.example.com",
  "بند پایانی مقاله آزمایشی. ".repeat(6).trim(),
].join("\n\n");
const richArticle = strapiFixtureArticle({
  n: 50,
  slug: "fixture-rich-article",
  title: `مقاله آزمایشی ${longPersianTitle}`,
  summary: "خلاصه آزمایشی مقاله‌ای با تصویر شاخص، برچسب‌های متعدد و مقاله‌های مرتبط.",
  body: richBody,
  image: strapiImage(1600, 900, "a", "تصویر شاخص آزمایشی"),
  category: fixtureCategories.rich,
  tags: richTags,
});
const relatedArticles = [
  strapiFixtureArticle({ n: 51, slug: "fixture-related-1", title: "مقاله مرتبط آزمایشی با تصویر", summary: "خلاصه آزمایشی مقاله مرتبط با تصویر.", body: "متن آزمایشی.", image: strapiImage(1200, 900, "b"), category: fixtureCategories.rich }),
  strapiFixtureArticle({ n: 52, slug: "fixture-related-2", title: `مقاله مرتبط ${longPersianTitle}`, summary: longPersianSummary, body: "متن آزمایشی.", image: null, category: fixtureCategories.rich }),
  strapiFixtureArticle({ n: 53, slug: "fixture-related-3", title: "مقاله مرتبط آزمایشی با تصویر بارگذاری‌نشده", summary: "خلاصه آزمایشی مقاله مرتبطی که تصویرش بارگذاری نمی‌شود.", body: "متن آزمایشی.", image: strapiMissingImage(53), category: fixtureCategories.rich }),
];
const longCategoryArticle = strapiFixtureArticle({
  n: 54,
  slug: "fixture-long-category-article",
  title: "مقاله آزمایشی با دسته‌بندی بسیار طولانی",
  summary: "خلاصه آزمایشی مقاله‌ای که دسته‌بندی آن نامی بسیار طولانی دارد.",
  body: "متن آزمایشی.",
  image: strapiImage(1200, 900, "c"),
  category: fixtureCategories.longName,
});
// Reachable by slug only (never listed): extreme tags and no category.
const longTagsArticle = strapiFixtureArticle({
  n: 55,
  slug: "fixture-long-tags-article",
  title: "مقاله آزمایشی با برچسب‌های بسیار طولانی",
  summary: "خلاصه آزمایشی مقاله‌ای که برچسب‌های آن از عرض یک گوشی طولانی‌ترند و دسته‌بندی ندارد.",
  body: "متن آزمایشی.",
  image: null,
  category: null,
  tags: extremeTags,
});
const fixtureArticleExtras = [longTagsArticle];
// 13 + 1 + 3 + 1 = 18 articles: three pages of six without a category filter.
const fixtureArticleUniverse = [...pagedArticles, richArticle, ...relatedArticles, longCategoryArticle];
const strapiPage = (items, page, perPage = fixturePageSize) => ({
  data: items.slice((page - 1) * perPage, page * perPage),
  meta: {
    pagination: { page, pageSize: perPage, pageCount: Math.ceil(items.length / perPage), total: items.length },
  },
});

/** Answers a Strapi article request that targets a fixture discriminator, or returns null for the legacy handler. */
const strapiArticlesFixture = (params) => {
  const slug = params.get("filters[slug][$eq]");
  if (slug) {
    const hit = [...fixtureArticleUniverse, ...fixtureArticleExtras].find((entry) => entry.slug === slug);
    return hit ? strapiPage([hit], 1) : null;
  }
  const category = params.get("filters[category][slug][$eq]");
  const excluded = params.get("filters[slug][$ne]");
  const page = Number(params.get("pagination[page]") ?? "1");
  if (category) {
    if (!Object.values(fixtureCategories).some((entry) => entry.slug === category)) return null;
    const pool = fixtureArticleUniverse.filter((entry) => entry.category?.slug === category && entry.slug !== excluded);
    // A related-articles request sets its own page size; a collection request is capped by the fixture.
    if (excluded) return strapiPage(pool, 1, Number(params.get("pagination[pageSize]")) || pool.length || 1);
    return strapiPage(pool, page);
  }
  if (!excluded && [2, 3, 99].includes(page)) return strapiPage(fixtureArticleUniverse, page);
  return null;
};

/** Handles every fixture discriminator above. Returns true when the request was answered. */
const serveFixture = (url, response) => {
  const { pathname, searchParams } = url;
  const media = pathname.match(/^\/api\/v1\/media\/public\/([^/]+)\/(?:thumb|card|detail)$/) ?? pathname.match(/^\/uploads\/([^/]+)\.svg$/);
  if (media) {
    serveFixtureImage(response, media[1]);
    return true;
  }
  const collections = {
    products: { items: fixtureProducts, empty: [99], paged: [2, 3] },
    materials: { items: fixtureMaterials, empty: [99], paged: [2, 3] },
    services: { items: fixtureServices, empty: [], paged: [2, 3] },
  };
  const detail = pathname.match(/^\/api\/v1\/public\/content\/(products|materials|services)\/(fixture-[a-z0-9-]+)$/);
  if (detail) {
    const record = [...collections[detail[1]].items, ...(detail[1] === "products" ? fixtureProductExtras : [])].find((entry) => entry.slug === detail[2]);
    if (!record) return false;
    sendJson(response, 200, record);
    return true;
  }
  const list = pathname.match(/^\/api\/v1\/public\/content\/(products|materials|services)$/);
  if (list) {
    const page = Number(searchParams.get("page") ?? "1");
    const collectionFixture = collections[list[1]];
    if (collectionFixture.paged.includes(page)) {
      sendJson(response, 200, pagedCollection(collectionFixture.items, page));
      return true;
    }
    if (collectionFixture.empty.includes(page)) {
      sendJson(response, 200, { items: [], pageInfo: { page, pageSize: fixturePageSize, total: 0, totalPages: 0 } });
      return true;
    }
    return false;
  }
  if (pathname === "/api/articles") {
    const body = strapiArticlesFixture(searchParams);
    if (!body) return false;
    sendJson(response, 200, body);
    return true;
  }
  if (pathname === "/api/categories" && searchParams.has("filters[slug][$eq]")) {
    const match = knownStrapiCategories.find((entry) => entry.slug === searchParams.get("filters[slug][$eq]"));
    sendJson(response, 200, { data: match ? [match] : [] });
    return true;
  }
  return false;
};

const loginAttempts = new Map();

function readRequestText(request) {
  return new Promise((resolve) => {
    let raw = "";
    request.on("data", (chunk) => { raw += chunk; });
    request.on("end", () => resolve(raw));
  });
}

function sendFixtureLogin(response) {
  response.writeHead(200, {
    "Content-Type": "application/json; charset=utf-8",
    "Set-Cookie": [
      "toranj_session=fixture-session; HttpOnly; Path=/; SameSite=Lax",
      "toranj_csrf=fixture-csrf; Path=/; SameSite=Lax",
    ],
  });
  return response.end(
    JSON.stringify({
      id: "admin-1",
      mobile: "+989123456789",
      displayName: "مدیر آزمون",
      email: null,
      companyName: null,
      role: "ADMIN",
      status: "ACTIVE",
      createdAt: publishedAt,
      lastLoginAt: publishedAt,
      capabilities: adminCapabilities,
    }),
  );
}

createServer((request, response) => {
  const url = new URL(request.url ?? "/", `http://127.0.0.1:${port}`);
  if (
    url.pathname === "/api/v1/public/content/products" &&
    url.searchParams.get("page") === "97" &&
    retryableProductsFailures++ === 0
  ) {
    response.writeHead(503, {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
    });
    return response.end(JSON.stringify({ message: "temporary fixture failure" }));
  }
  if (request.method === "GET" && serveFixture(url, response)) return;
  if (url.pathname === "/api/articles") {
    const slugFilter = url.searchParams.get("filters[slug][$eq]");
    const slugNotFilter = url.searchParams.get("filters[slug][$ne]");
    const categoryFilter = url.searchParams.get("filters[category][slug][$eq]");
    let matched = strapiArticles;
    if (slugFilter) {
      matched = matched.filter((a) => a.slug === slugFilter);
    }
    if (slugNotFilter) {
      matched = matched.filter((a) => a.slug !== slugNotFilter);
    }
    if (categoryFilter) {
      matched = matched.filter((a) => a.category?.slug === categoryFilter);
    }
    response.writeHead(200, {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
    });
    return response.end(
      JSON.stringify({
        data: matched,
        meta: {
          pagination: {
            page: 1,
            pageSize: 12,
            pageCount: 1,
            total: matched.length,
          },
        },
      }),
    );
  }
  if (url.pathname === "/api/categories") {
    response.writeHead(200, {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
    });
    return response.end(
      JSON.stringify({
        data: [
          {
            documentId: "cat-1",
            id: 1,
            name: "فناوری و تولید",
            slug: "tech-production",
            description: "دسته‌بندی فنی",
          },
          {
            documentId: "cat-2",
            id: 2,
            name: "انتخاب مواد",
            slug: "materials-selection-category",
            description: "دسته‌بندی راهنما",
          },
        ],
      }),
    );
  }
  if (url.pathname === "/api/v1/auth/me") {
    const account = accountForRequest(request);
    if (!account) {
      response.writeHead(401, {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "no-store",
      });
      return response.end(JSON.stringify({ message: "Unauthorized" }));
    }
    response.writeHead(200, {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
    });
    return response.end(JSON.stringify(account));
  }
  if (
    url.pathname === "/api/v1/inquiries/product" &&
    request.method === "POST"
  ) {
    const authenticated = (request.headers.cookie ?? "").includes(
      "toranj_session=",
    );
    const csrf = request.headers["x-csrf-token"] === "fixture-csrf";
    response.writeHead(authenticated && csrf ? 201 : 401, {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
    });
    return response.end(
      JSON.stringify(
        authenticated && csrf ? inquiry : { message: "Unauthorized" },
      ),
    );
  }
  if (
    url.pathname === "/api/v1/inquiries/inquiry-1" &&
    request.method === "GET"
  ) {
    const quotationMode = cookieValue(request, "quotation_mode");
    let currentInquiry = inquiry;
    if (quotationMode === "sent" || quotationMode === "quoted") {
      currentInquiry = { ...inquiry, status: "QUOTED", version: 1 };
    } else if (quotationMode === "accepted") {
      currentInquiry = { ...inquiry, status: "ACCEPTED", version: 2 };
    } else if (quotationMode === "rejected") {
      currentInquiry = { ...inquiry, status: "UNDER_REVIEW", version: 2 };
    }
    response.writeHead(200, {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
    });
    return response.end(JSON.stringify(currentInquiry));
  }
  if (
    url.pathname === "/api/v1/inquiries/inquiry-1/quotations" &&
    request.method === "GET"
  ) {
    const mode = cookieValue(request, "quotation_mode");
    let current = customerSentQuotation;
    if (mode === "accepted") {
      current = { ...customerSentQuotation, status: "ACCEPTED", respondedAt: publishedAt };
    } else if (mode === "rejected") {
      current = { ...customerSentQuotation, status: "REJECTED", respondedAt: publishedAt, rejectionReason: "قیمت بالا است" };
    }
    response.writeHead(200, {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store, private",
    });
    return response.end(JSON.stringify([current]));
  }
  if (
    url.pathname === "/api/v1/inquiries/inquiry-1/quotations/quotation-1/accept" &&
    request.method === "POST"
  ) {
    const csrfCookie = cookieValue(request, "toranj_csrf") === "fixture-csrf";
    if (!csrfCookie || request.headers["x-csrf-token"] !== "fixture-csrf") {
      response.writeHead(403, { "Content-Type": "application/json; charset=utf-8" });
      return response.end(JSON.stringify({ code: "CSRF_FORBIDDEN", message: "توکن CSRF نامعتبر است." }));
    }
    response.writeHead(200, {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store, private",
    });
    return response.end(JSON.stringify({ ...customerSentQuotation, status: "ACCEPTED", respondedAt: publishedAt }));
  }
  if (
    url.pathname === "/api/v1/inquiries/inquiry-1/quotations/quotation-1/reject" &&
    request.method === "POST"
  ) {
    const csrfCookie = cookieValue(request, "toranj_csrf") === "fixture-csrf";
    if (!csrfCookie || request.headers["x-csrf-token"] !== "fixture-csrf") {
      response.writeHead(403, { "Content-Type": "application/json; charset=utf-8" });
      return response.end(JSON.stringify({ code: "CSRF_FORBIDDEN", message: "توکن CSRF نامعتبر است." }));
    }
    response.writeHead(200, {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store, private",
    });
    return response.end(JSON.stringify({ ...customerSentQuotation, status: "REJECTED", respondedAt: publishedAt, rejectionReason: "قیمت بالا است" }));
  }
  if (
    url.pathname === "/api/v1/inquiries/inquiry-1/quotations/quotation-1/pdf" &&
    request.method === "GET"
  ) {
    response.writeHead(200, {
      "Content-Type": "application/pdf",
      "Cache-Control": "no-store, private",
      "Content-Disposition": 'attachment; filename="TRJ-Q-0001.pdf"',
    });
    return response.end(Buffer.from("%PDF-1.4\n% fixture\n%%EOF\n"));
  }
  if (
    url.pathname === "/api/v1/inquiries/inquiry-1/messages" &&
    request.method === "POST"
  ) {
    response.writeHead(200, {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
    });
    return response.end(JSON.stringify(inquiry));
  }
  if (url.pathname === "/api/v1/inquiries" && request.method === "GET") {
    response.writeHead(200, {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
    });
    return response.end(
      JSON.stringify({
        items: [inquiry],
        page: 1,
        pageSize: 12,
        total: 1,
        pageCount: 1,
      }),
    );
  }
  if (
    url.pathname === "/api/v1/auth/login/password" &&
    request.method === "POST"
  ) {
    // Credential fixtures (auth presentation, task 6.3): a mobile starting
    // with 0900000 is rejected (401), one starting with 0911111 simulates an
    // unavailable service (503), and every other mobile signs in as before.
    // Attempts are counted per mobile so a test can prove that a failed
    // sign-in is never retried automatically, even with parallel workers.
    return readRequestText(request).then((raw) => {
      const mobile = (raw.match(/"mobile"s*:s*"([^"]*)"/) ?? [])[1] ?? "";
      loginAttempts.set(mobile, (loginAttempts.get(mobile) ?? 0) + 1);
      if (mobile.startsWith("0900000")) {
        response.writeHead(401, { "Content-Type": "application/json; charset=utf-8" });
        return response.end(JSON.stringify({ message: "Unauthorized" }));
      }
      if (mobile.startsWith("0911111")) {
        response.writeHead(503, { "Content-Type": "application/json; charset=utf-8" });
        return response.end(JSON.stringify({ message: "Service unavailable" }));
      }
      return sendFixtureLogin(response);
    });
  }
  if (url.pathname === "/__fixtures/login-attempts") {
    response.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
    return response.end(JSON.stringify({ attempts: loginAttempts.get(url.searchParams.get("mobile") ?? "") ?? 0 }));
  }
  if (url.pathname === "/api/v1/auth/register" && request.method === "POST") {
    response.writeHead(201, {
      "Content-Type": "application/json; charset=utf-8",
    });
    return response.end(
      JSON.stringify({
        id: "customer-1",
        mobile: "+989123456789",
        displayName: "مشتری آزمون",
        email: null,
        companyName: null,
        role: "CUSTOMER",
        status: "ACTIVE",
        createdAt: publishedAt,
        lastLoginAt: null,
        capabilities: [],
      }),
    );
  }
  if (url.pathname === "/api/v1/admin/access") {
    const cookie = request.headers.cookie ?? "";
    const account = accountForRequest(request);
    if (!account) {
      response.writeHead(cookie.includes("fixture_customer=1") ? 403 : 401, {
        "Content-Type": "application/json; charset=utf-8",
      });
      return response.end(JSON.stringify({ message: "Unauthorized" }));
    }
    response.writeHead(200, {
      "Content-Type": "application/json; charset=utf-8",
    });
    return response.end(JSON.stringify({ authorized: true, account }));
  }
  const managementActor = accountForRequest(request);
  if (
    url.pathname.includes("/quotations") &&
    url.pathname.startsWith("/api/v1/admin/inquiries") &&
    !managementActor?.capabilities.includes("QUOTATION_MANAGEMENT")
  ) {
    response.writeHead(managementActor ? 403 : 401, {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store, private",
    });
    return response.end(
      JSON.stringify({ code: managementActor ? "FORBIDDEN" : "UNAUTHORIZED" }),
    );
  }
  if (
    url.pathname.startsWith("/api/v1/admin/inquiries") &&
    !managementActor?.capabilities.includes("INQUIRY_OPERATIONS")
  ) {
    response.writeHead(managementActor ? 403 : 401, {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
    });
    return response.end(
      JSON.stringify({ code: managementActor ? "FORBIDDEN" : "UNAUTHORIZED" }),
    );
  }
  if (
    url.pathname.startsWith("/api/v1/admin/content") &&
    !managementActor?.capabilities.includes("CONTENT_MANAGEMENT")
  ) {
    response.writeHead(managementActor ? 403 : 401, {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
    });
    return response.end(
      JSON.stringify({ code: managementActor ? "FORBIDDEN" : "UNAUTHORIZED" }),
    );
  }
  const staffRecord = {
    id: "staff-1",
    mobile: "+989121111111",
    displayName: "کارشناس فروش",
    role: "SALES",
    status: "ACTIVE",
    version: 0,
    createdAt: publishedAt,
    updatedAt: publishedAt,
    lastLoginAt: null,
  };
  const staffRecordFor = (id) =>
    id === "last-admin"
      ? { ...staffRecord, id, displayName: "آخرین مدیر فعال", role: "ADMIN" }
      : id === "version-conflict"
        ? { ...staffRecord, id, displayName: "کارشناس دارای تداخل" }
        : staffRecord;
  const staffActor = accountForRequest(request);
  if (
    url.pathname.startsWith("/api/v1/admin/staff") &&
    !staffActor?.capabilities.includes("STAFF_MANAGEMENT")
  ) {
    response.writeHead(staffActor ? 403 : 401, {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
    });
    return response.end(
      JSON.stringify({ code: staffActor ? "FORBIDDEN" : "UNAUTHORIZED" }),
    );
  }
  if (url.pathname === "/api/v1/admin/staff" && request.method === "GET") {
    response.writeHead(200, {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
    });
    return response.end(
      JSON.stringify({
        items: [staffRecord],
        page: 1,
        pageSize: 20,
        total: 1,
        pageCount: 1,
      }),
    );
  }
  const staffDetail = url.pathname.match(
    /^\/api\/v1\/admin\/staff\/(staff-1|last-admin|version-conflict)$/,
  );
  if (staffDetail && request.method === "GET") {
    response.writeHead(200, {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
    });
    return response.end(JSON.stringify(staffRecordFor(staffDetail[1])));
  }
  const staffMutation = url.pathname.match(
    /^\/api\/v1\/admin\/staff\/(staff-1|last-admin|version-conflict)\/(role|status)$/,
  );
  if (
    (url.pathname === "/api/v1/admin/staff" && request.method === "POST") ||
    (staffMutation && request.method === "PATCH")
  ) {
    const csrfCookie = (request.headers.cookie ?? "").includes(
      "toranj_csrf=fixture-csrf",
    );
    if (!csrfCookie || request.headers["x-csrf-token"] !== "fixture-csrf") {
      response.writeHead(403, {
        "Content-Type": "application/json; charset=utf-8",
      });
      return response.end(JSON.stringify({ code: "INVALID_CSRF" }));
    }
    if (staffMutation?.[1] === "version-conflict") {
      response.writeHead(409, {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "no-store",
      });
      return response.end(JSON.stringify({ code: "STAFF_VERSION_CONFLICT" }));
    }
    if (staffMutation?.[1] === "last-admin") {
      response.writeHead(409, {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "no-store",
      });
      return response.end(
        JSON.stringify({ code: "STAFF_LAST_ADMIN_CONFLICT" }),
      );
    }
    const actorSession = cookieValue(request, "toranj_session");
    if (
      staffMutation?.[2] === "status" &&
      actorSession?.startsWith("admin-revoke-")
    )
      revokedSessions.add(
        `target-revoke-${actorSession.slice("admin-revoke-".length)}`,
      );
    response.writeHead(request.method === "POST" ? 201 : 200, {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
    });
    return response.end(
      JSON.stringify(
        staffMutation
          ? { ...staffRecordFor(staffMutation[1]), version: 1 }
          : staffRecord,
      ),
    );
  }
  if (url.pathname === "/api/v1/admin/inquiries" && request.method === "GET") {
    response.writeHead(200, {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
    });
    return response.end(
      JSON.stringify({
        items: [adminInquiry],
        page: 1,
        pageSize: 20,
        total: 1,
        pageCount: 1,
      }),
    );
  }
  if (
    url.pathname === "/api/v1/admin/inquiries/summary" &&
    request.method === "GET"
  ) {
    response.writeHead(200, {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
    });
    return response.end(
      JSON.stringify({ total: 1, unassigned: 1, submitted: 1, underReview: 0 }),
    );
  }
  if (
    url.pathname === "/api/v1/admin/inquiries/assignees" &&
    request.method === "GET"
  ) {
    response.writeHead(200, {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
    });
    return response.end(JSON.stringify([adminSummary]));
  }
  if (
    url.pathname === "/api/v1/admin/inquiries/inquiry-1" &&
    request.method === "GET"
  ) {
    response.writeHead(200, {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
    });
    return response.end(JSON.stringify(adminInquiry));
  }
  if (
    url.pathname === "/api/v1/admin/inquiries/inquiry-1/quotations" &&
    request.method === "GET"
  ) {
    const sentMode = cookieValue(request, "quotation_mode") === "sent";
    response.writeHead(200, {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store, private",
    });
    return response.end(
      JSON.stringify([sentMode ? adminSentQuotation : adminDraftQuotation]),
    );
  }
  if (
    url.pathname ===
      "/api/v1/admin/inquiries/inquiry-1/quotations/quotation-1/pdf" &&
    request.method === "GET"
  ) {
    response.writeHead(200, {
      "Content-Type": "application/pdf",
      "Cache-Control": "no-store, private",
      "Content-Disposition": 'attachment; filename="TRJ-Q-0001.pdf"',
    });
    return response.end(Buffer.from("%PDF-1.4\n% fixture\n%%EOF\n"));
  }
  const quotationMutation = url.pathname.match(
    /^\/api\/v1\/admin\/inquiries\/inquiry-1\/quotations(?:\/(quotation-1)(?:\/(send|revisions))?)?$/,
  );
  if (quotationMutation && ["POST", "PUT"].includes(request.method ?? "")) {
    const csrfCookie = cookieValue(request, "toranj_csrf") === "fixture-csrf";
    if (!csrfCookie || request.headers["x-csrf-token"] !== "fixture-csrf") {
      response.writeHead(403, {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "no-store, private",
      });
      return response.end(
        JSON.stringify({ code: "INVALID_CSRF", message: "Invalid CSRF token" }),
      );
    }
    const result =
      quotationMutation[2] === "send"
        ? adminSentQuotation
        : quotationMutation[2] === "revisions"
          ? { ...adminDraftQuotation, id: "quotation-revision-2", version: 2 }
          : adminDraftQuotation;
    response.writeHead(
      request.method === "POST" && !quotationMutation[1] ? 201 : 200,
      {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "no-store, private",
      },
    );
    return response.end(JSON.stringify(result));
  }
  const inquiryMutation = url.pathname.match(
    /^\/api\/v1\/admin\/inquiries\/inquiry-1\/(status|assignment|notes|messages)$/,
  );
  if (inquiryMutation && ["POST", "PATCH"].includes(request.method ?? "")) {
    const csrfCookie = (request.headers.cookie ?? "")
      .split(";")
      .some((cookie) => cookie.trim() === "toranj_csrf=fixture-csrf");
    if (!csrfCookie || request.headers["x-csrf-token"] !== "fixture-csrf") {
      response.writeHead(403, {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "no-store",
      });
      return response.end(
        JSON.stringify({ code: "INVALID_CSRF", message: "Invalid CSRF token" }),
      );
    }
    response.writeHead(200, {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
    });
    return response.end(JSON.stringify(adminInquiry));
  }
  const mutation = url.pathname.match(
    /^\/api\/v1\/admin\/content\/(categories|products|services|materials|articles|pages)(?:\/[^/]+(?:\/(publish|archive))?)?$/,
  );
  if (mutation && ["POST", "PATCH"].includes(request.method ?? "")) {
    const csrfCookie = (request.headers.cookie ?? "")
      .split(";")
      .some((cookie) => cookie.trim() === "toranj_csrf=fixture-csrf");
    if (!csrfCookie || request.headers["x-csrf-token"] !== "fixture-csrf") {
      response.writeHead(403, {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "no-store",
      });
      return response.end(JSON.stringify({ message: "Invalid CSRF token" }));
    }
    const record = adminRecords[mutation[1]];
    const status =
      mutation[2] === "publish"
        ? "PUBLISHED"
        : mutation[2] === "archive"
          ? "ARCHIVED"
          : record.status;
    const isCreate =
      request.method === "POST" &&
      !url.pathname.slice("/api/v1/admin/content/".length).includes("/");
    response.writeHead(isCreate ? 201 : 200, {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
    });
    return response.end(
      JSON.stringify({
        ...record,
        status,
        publishedAt: status === "PUBLISHED" ? publishedAt : record.publishedAt,
      }),
    );
  }
  const fixture = routes.get(url.pathname) ?? {
    status: 404,
    body: { message: "Not Found" },
  };
  response.writeHead(fixture.status, {
    "Content-Type": "application/json; charset=utf-8",
  });
  response.end(JSON.stringify(fixture.body));
}).listen(port, "127.0.0.1");
