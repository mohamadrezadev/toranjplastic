import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";

const STRAPI_BASE_URL = (process.env.STRAPI_URL || process.env.STRAPI_API_URL || "http://localhost:1337").replace(/\/api\/?$/, "").replace(/\/$/, "");

async function strapiFetch(endpoint: string, options: RequestInit = {}) {
  const url = `${STRAPI_BASE_URL}${endpoint.startsWith("/") ? "" : "/"}${endpoint}`;
  const headers: Record<string, string> = {
    Accept: "application/json",
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> || {}),
  };

  const token = process.env.STRAPI_API_TOKEN;
  if (token && token.trim()) {
    headers["Authorization"] = `Bearer ${token.trim()}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Strapi request failed (${response.status}): ${errorText}`);
  }

  if (response.status === 204) return null;
  return response.json();
}

const server = new Server(
  {
    name: "toranj-strapi-mcp",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Define tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "strapi_list_categories",
        description: "دریافت لیست دسته‌بندی‌های موجود در تحریریه استراپی ترنج پلاستیک برای تخصیص به مقاله جدید.",
        inputSchema: {
          type: "object",
          properties: {},
        },
      },
      {
        name: "strapi_list_tags",
        description: "دریافت لیست برچسب‌ها (تگ‌های موضوعی) موجود در سامانه.",
        inputSchema: {
          type: "object",
          properties: {},
        },
      },
      {
        name: "strapi_search_articles",
        description: "جستجو و بررسی مقالات موجود برای بررسی موضوعات نگارش‌شده و جلوگیری از تولید محتوای تکراری.",
        inputSchema: {
          type: "object",
          properties: {
            query: {
              type: "string",
              description: "کلمه کلیدی یا عبارت مورد نظر برای جستجو در عنوان یا متن مقالات",
            },
            limit: {
              type: "number",
              description: "حداکثر تعداد نتایج (پیش‌فرض ۱۰)",
            },
          },
        },
      },
      {
        name: "strapi_create_article",
        description: "نگارش و ثبت مقاله تخصصی جدید در وبلاگ ترنج پلاستیک. امکان تعیین وضعیت به صورت منتشرشده (published) یا پیش‌نویس (draft) وجود دارد.",
        inputSchema: {
          type: "object",
          required: ["title", "slug", "summary", "body", "categoryDocumentId"],
          properties: {
            title: {
              type: "string",
              description: "عنوان جذاب، دقیق و تخصصی مقاله به زبان فارسی",
            },
            slug: {
              type: "string",
              description: "نامک انگلیسی یکتا و سئومحور (مثال: pp-vs-pe-injection-molding-comparison)",
            },
            summary: {
              type: "string",
              description: "خلاصه جذاب و ترغیب‌کننده در ۱ تا ۳ جمله برای نمایش در کارت مقاله و توضیحات متای موتور جستجو",
            },
            body: {
              type: "string",
              description: "متن کامل مقاله با ساختاربندی حرفه‌ای عناوین H2، H3، پاراگراف‌ها، لیست‌ها و اصطلاحات صنعتی تزریق پلاستیک",
            },
            categoryDocumentId: {
              type: "string",
              description: "شناسه documentId دسته‌بندی مرتبط (دریافت‌شده از ابزار strapi_list_categories)",
            },
            tagDocumentIds: {
              type: "array",
              items: { type: "string" },
              description: "آرایه‌ای از شناسه‌های documentId برچسب‌های مرتبط",
            },
            status: {
              type: "string",
              enum: ["published", "draft"],
              description: "وضعیت انتشار مقاله (published = انتشار مستقیم در سایت، draft = پیش‌نویس جهت بازبینی مدیر)",
              default: "published",
            },
            seo: {
              type: "object",
              properties: {
                metaTitle: {
                  type: "string",
                  description: "عنوان اختصاصی سئو برای تگ title مرورگر",
                },
                metaDescription: {
                  type: "string",
                  description: "توضیحات متای صفحه در نتایج جستجوی گوگل",
                },
              },
            },
          },
        },
      },
      {
        name: "strapi_delete_article",
        description: "حذف مقاله با استفاده از شناسه documentId آن (برای پاکسازی یا مدیریت مقالات).",
        inputSchema: {
          type: "object",
          required: ["documentId"],
          properties: {
            documentId: {
              type: "string",
              description: "شناسه documentId مقاله مورد نظر برای حذف",
            },
          },
        },
      },
    ],
  };
});

// Tool implementations
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case "strapi_list_categories": {
        const payload = await strapiFetch("/api/categories?populate=*");
        const categories = (payload.data || []).map((cat: any) => ({
          documentId: cat.documentId,
          name: cat.name,
          slug: cat.slug,
          description: cat.description,
        }));
        return {
          content: [{ type: "text", text: JSON.stringify(categories, null, 2) }],
        };
      }

      case "strapi_list_tags": {
        const payload = await strapiFetch("/api/tags?populate=*");
        const tags = (payload.data || []).map((tag: any) => ({
          documentId: tag.documentId,
          name: tag.name,
          slug: tag.slug,
        }));
        return {
          content: [{ type: "text", text: JSON.stringify(tags, null, 2) }],
        };
      }

      case "strapi_search_articles": {
        const query = (args?.query as string) || "";
        const limit = Number(args?.limit) || 10;
        let endpoint = `/api/articles?populate=*&pagination[pageSize]=${limit}&sort[0]=publishedAt:desc`;

        if (query.trim()) {
          endpoint += `&filters[title][$containsi]=${encodeURIComponent(query.trim())}`;
        }

        const payload = await strapiFetch(endpoint);
        const articles = (payload.data || []).map((art: any) => ({
          documentId: art.documentId,
          title: art.title,
          slug: art.slug,
          summary: art.summary,
          publishedAt: art.publishedAt,
          category: art.category ? art.category.name : null,
          url: `http://localhost:3000/articles/${art.slug}`,
        }));

        return {
          content: [{ type: "text", text: JSON.stringify(articles, null, 2) }],
        };
      }

      case "strapi_create_article": {
        const {
          title,
          slug,
          summary,
          body,
          categoryDocumentId,
          tagDocumentIds,
          status = "published",
          seo,
        } = args as any;

        const payload: Record<string, any> = {
          data: {
            title,
            slug,
            summary,
            body,
            category: categoryDocumentId,
            tags: Array.isArray(tagDocumentIds) ? tagDocumentIds : [],
            publishedAt: status === "published" ? new Date().toISOString() : null,
          },
        };

        if (seo) {
          payload.data.seo = {
            metaTitle: seo.metaTitle || `${title} | ترنج پلاستیک`,
            metaDescription: seo.metaDescription || summary,
          };
        }

        const res = await strapiFetch("/api/articles?populate=*", {
          method: "POST",
          body: JSON.stringify(payload),
        });

        const created = res.data;
        const resultInfo = {
          success: true,
          message: status === "published" ? "مقاله با موفقیت ایجاد و روی سایت ترنج پلاستیک منتشر شد." : "پیش‌نویس مقاله با موفقیت ثبت شد.",
          documentId: created.documentId,
          title: created.title,
          slug: created.slug,
          status: created.status || status,
          liveUrl: `http://localhost:3000/articles/${created.slug}`,
        };

        return {
          content: [{ type: "text", text: JSON.stringify(resultInfo, null, 2) }],
        };
      }

      case "strapi_delete_article": {
        const { documentId } = args as any;
        await strapiFetch(`/api/articles/${encodeURIComponent(documentId)}`, {
          method: "DELETE",
        });

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({ success: true, message: `مقاله با شناسه ${documentId} حذف شد.` }, null, 2),
            },
          ],
        };
      }

      default:
        throw new Error(`ابزار ناشناخته: ${name}`);
    }
  } catch (error: any) {
    return {
      isError: true,
      content: [{ type: "text", text: `خطا در اجرای ابزار Strapi: ${error.message || String(error)}` }],
    };
  }
});

async function run() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  process.stderr.write("Toranj Strapi MCP Server running on stdio...\n");
}

run().catch((err) => {
  process.stderr.write(`Fatal error: ${err.message}\n`);
  process.exit(1);
});
