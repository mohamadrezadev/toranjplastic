// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";

const cookieJar = new Map([["toranj_session", "session-token"], ["toranj_csrf", "csrf-token"]]);

vi.mock("next/headers", () => ({
  cookies: async () => ({
    getAll: () => Array.from(cookieJar, ([name, value]) => ({ name, value })),
    get: (name: string) => (cookieJar.has(name) ? { name, value: cookieJar.get(name)! } : undefined),
  }),
}));

const { AdminContentError, listCategories, getCategory, createCategory, publishProduct } = await import("./admin-content");

const category = {
  id: "c1", name: "دسته", slug: "cat", description: null, image: null, displayOrder: 0,
  status: "DRAFT", publishedAt: null, createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-01-01T00:00:00.000Z",
  metaTitle: null, metaDescription: null,
};

afterEach(() => vi.unstubAllGlobals());

describe("admin content client", () => {
  it("lists categories with the session cookie forwarded, no CSRF header on a read", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ items: [category], pageInfo: { page: 1, pageSize: 20, total: 1, totalPages: 1 } }), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    await expect(listCategories()).resolves.toMatchObject({ items: [{ slug: "cat" }] });
    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit & { headers: Record<string, string> }];
    expect(init.headers.cookie).toContain("toranj_session=session-token");
    expect(init.headers["x-csrf-token"]).toBeUndefined();
  });

  it("attaches the CSRF token header on a mutating create call", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify(category), { status: 201 }));
    vi.stubGlobal("fetch", fetchMock);

    await createCategory({ name: "دسته", slug: "cat" });
    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit & { headers: Record<string, string> }];
    expect(init.headers["x-csrf-token"]).toBe("csrf-token");
    expect(init.method).toBe("POST");
  });

  it("maps a 400 response to a validation error kind", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({ message: "bad" }), { status: 400 })));
    await expect(createCategory({ name: "", slug: "" })).rejects.toMatchObject({ kind: "validation", status: 400 });
  });

  it("maps a 409 response to a conflict error kind", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("{}", { status: 409 })));
    await expect(createCategory({ name: "x", slug: "cat" })).rejects.toBeInstanceOf(AdminContentError);
    await expect(createCategory({ name: "x", slug: "cat" })).rejects.toMatchObject({ kind: "conflict", status: 409 });
  });

  it("maps a 404 response to a not_found error kind", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("{}", { status: 404 })));
    await expect(getCategory("missing")).rejects.toMatchObject({ kind: "not_found", status: 404 });
  });

  it("maps a malformed 200 payload to a failed error kind instead of silently passing it through", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({ not: "a category" }), { status: 200 })));
    await expect(getCategory("c1")).rejects.toMatchObject({ kind: "failed" });
  });

  it("maps a network failure to a failed error kind rather than throwing an unrelated error", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));
    await expect(publishProduct("p1")).rejects.toMatchObject({ kind: "failed" });
  });
});
