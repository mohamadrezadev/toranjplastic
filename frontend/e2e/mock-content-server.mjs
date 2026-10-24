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

const adminRecords = {
  categories: adminCategory,
  products: adminProduct,
  services: adminService,
  materials: adminMaterial,
  articles: adminArticle,
  pages: adminPage,
};

createServer((request, response) => {
  const url = new URL(request.url ?? "/", `http://127.0.0.1:${port}`);
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
