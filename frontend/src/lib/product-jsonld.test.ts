// @vitest-environment node
import { describe, expect, it } from "vitest";
import { productJsonLd, serializeJsonLd } from "./product-jsonld";
import type { PublicProduct } from "./public-content";

const product: PublicProduct = {
  id: "catalog-product-pedal-bin",
  name: "سطل زباله پدالی",
  slug: "pedal-bin",
  summary: "معرفی محصول",
  description: null,
  category: { id: "cleaning", name: "لوازم نظافت و قطعات", slug: "cleaning-products" },
  images: [{ url: "/catalog/pedal-bin.webp", alt: "سطل زباله پدالی سفید", width: 1200, height: 1200 }],
  specifications: [],
  featured: true,
  metaTitle: null,
  metaDescription: null,
  publishedAt: "2026-10-11T00:00:00.000Z",
};

describe("product structured data", () => {
  it("contains approved identity fields and no ecommerce claims", () => {
    const value = productJsonLd(product);
    expect(value).toMatchObject({ "@type": "Product", name: product.name, category: product.category?.name });
    const serialized = serializeJsonLd(value);
    expect(serialized).not.toMatch(/offers|price|availability|review|rating/i);
    expect(serialized).toContain("/catalog/pedal-bin.webp");
  });

  it("escapes markup-significant characters", () => {
    expect(serializeJsonLd({ name: "</script>" })).not.toContain("</script>");
  });
});
