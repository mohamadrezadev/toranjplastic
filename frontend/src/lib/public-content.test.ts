// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";
import { PublicContentError, getProduct, listProducts, parsePageNumber } from "./public-content";

const product = {
  id: "p1", name: "سبد صنعتی", slug: "industrial-basket", summary: null, description: "توضیح تأییدشده",
  category: null, images: [], specifications: [], featured: false, metaTitle: null, metaDescription: null,
  publishedAt: "2026-10-10T00:00:00.000Z",
};

afterEach(() => vi.unstubAllGlobals());

describe("public content client", () => {
  it("accepts a valid collection and builds bounded pagination", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ items: [product], pageInfo: { page: 2, pageSize: 12, total: 13, totalPages: 2 } }), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);
    await expect(listProducts(2)).resolves.toMatchObject({ items: [{ slug: "industrial-basket" }] });
    expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining("products?page=2&pageSize=12"), expect.objectContaining({ cache: "no-store" }));
  });

  it("accepts an honest empty collection", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({ items: [], pageInfo: { page: 1, pageSize: 12, total: 0, totalPages: 0 } }), { status: 200 })));
    await expect(listProducts(1)).resolves.toEqual({ items: [], pageInfo: { page: 1, pageSize: 12, total: 0, totalPages: 0 } });
  });

  it("classifies hidden or unknown details as not found", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("{}", { status: 404 })));
    await expect(getProduct("hidden")).rejects.toMatchObject({ kind: "not_found", status: 404 });
  });

  it("rejects malformed public payloads", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({ ...product, images: [{ url: "unsafe-shape" }] }), { status: 200 })));
    await expect(getProduct("broken")).rejects.toBeInstanceOf(PublicContentError);
    await expect(getProduct("broken")).rejects.toMatchObject({ kind: "invalid_response" });
  });

  it("classifies transport failures without turning them into empty content", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));
    await expect(listProducts(1)).rejects.toMatchObject({ kind: "upstream" });
  });
});

describe("page query parsing", () => {
  it.each([[undefined, 1], ["2", 2], ["0", 1], ["invalid", 1], [["3", "4"], 3]] as const)("maps %j to %i", (value, expected) => {
    expect(parsePageNumber(value)).toBe(expected);
  });
});
