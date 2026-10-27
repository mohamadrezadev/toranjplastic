// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { POST } from "./route";

const revalidatePathMock = vi.fn();
const revalidateTagMock = vi.fn();

vi.mock("next/cache", () => ({
  revalidatePath: (path: string) => revalidatePathMock(path),
  revalidateTag: (tag: string, profile?: unknown) => revalidateTagMock(tag, profile),
}));

describe("revalidation webhook route", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env = { ...originalEnv, STRAPI_REVALIDATE_SECRET: "test-revalidate-secret" };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("returns 401 if authorization secret header is missing or incorrect", async () => {
    const req1 = new NextRequest("http://localhost:3000/api/revalidate", {
      method: "POST",
    });
    const res1 = await POST(req1);
    expect(res1.status).toBe(401);
    expect(revalidatePathMock).not.toHaveBeenCalled();

    const req2 = new NextRequest("http://localhost:3000/api/revalidate", {
      method: "POST",
      headers: { "x-strapi-revalidate-secret": "wrong-secret" },
    });
    const res2 = await POST(req2);
    expect(res2.status).toBe(401);
    expect(revalidatePathMock).not.toHaveBeenCalled();
  });

  it("revalidates affected article and category paths with valid secret", async () => {
    const payload = {
      event: "entry.publish",
      model: "article",
      entry: {
        slug: "plastic-injection-material-selection-guide",
        category: { slug: "tech-production" },
      },
    };

    const req = new NextRequest("http://localhost:3000/api/revalidate", {
      method: "POST",
      headers: {
        "x-strapi-revalidate-secret": "test-revalidate-secret",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.revalidated).toBe(true);
    expect(data.paths).toContain("/articles");
    expect(data.paths).toContain("/sitemap.xml");
    expect(data.paths).toContain("/articles/plastic-injection-material-selection-guide");
    expect(data.paths).toContain("/articles/category/tech-production");

    expect(revalidatePathMock).toHaveBeenCalledWith("/articles");
    expect(revalidatePathMock).toHaveBeenCalledWith("/sitemap.xml");
    expect(revalidatePathMock).toHaveBeenCalledWith("/articles/plastic-injection-material-selection-guide");
    expect(revalidatePathMock).toHaveBeenCalledWith("/articles/category/tech-production");
    expect(revalidateTagMock).toHaveBeenCalledWith("strapi-articles", "max");
  });

  it("revalidates category path when model is category", async () => {
    const payload = {
      event: "entry.update",
      model: "category",
      entry: {
        slug: "tech-production",
      },
    };

    const req = new NextRequest("http://localhost:3000/api/revalidate", {
      method: "POST",
      headers: {
        "x-strapi-revalidate-secret": "test-revalidate-secret",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.paths).toContain("/articles/category/tech-production");
    expect(revalidatePathMock).toHaveBeenCalledWith("/articles/category/tech-production");
  });

  it("rejects request with 400 if article slug contains invalid characters or directory traversal", async () => {
    const payload = {
      event: "entry.publish",
      model: "article",
      entry: {
        slug: "../traversal/danger",
      },
    };

    const req = new NextRequest("http://localhost:3000/api/revalidate", {
      method: "POST",
      headers: {
        "x-strapi-revalidate-secret": "test-revalidate-secret",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);

    const data = await res.json();
    expect(data.error).toBe("Invalid slug format");
    expect(revalidatePathMock).not.toHaveBeenCalled();
  });

  it("rejects request with 400 if category slug contains invalid characters", async () => {
    const payload = {
      event: "entry.update",
      model: "article",
      entry: {
        slug: "valid-article-slug",
        category: {
          slug: "invalid category with spaces!",
        },
      },
    };

    const req = new NextRequest("http://localhost:3000/api/revalidate", {
      method: "POST",
      headers: {
        "x-strapi-revalidate-secret": "test-revalidate-secret",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);

    const data = await res.json();
    expect(data.error).toBe("Invalid category slug format");
    expect(revalidatePathMock).not.toHaveBeenCalled();
  });
});
