// @vitest-environment node
import { describe, expect, it } from "vitest";
import { publicContentMetadata } from "./content-metadata";

describe("public content metadata", () => {
  it("builds canonical, crawl and social metadata from approved fields", () => {
    const metadata = publicContentMetadata({
      title: "سطل زباله پدالی",
      path: "/products/pedal-bin",
      summary: "معرفی محصول",
      images: [{ url: "/catalog/pedal-bin.webp", alt: "سطل زباله پدالی سفید", width: 1200, height: 1200 }],
    });

    expect(metadata.alternates).toEqual({ canonical: "/products/pedal-bin" });
    expect(metadata.robots).toEqual({ index: true, follow: true });
    expect(metadata.openGraph).toMatchObject({ url: "/products/pedal-bin", title: "سطل زباله پدالی", description: "معرفی محصول" });
    expect(metadata.openGraph && "images" in metadata.openGraph ? metadata.openGraph.images : undefined).toEqual([
      expect.objectContaining({ url: "http://localhost:3000/catalog/pedal-bin.webp", alt: "سطل زباله پدالی سفید" }),
    ]);
  });
});
