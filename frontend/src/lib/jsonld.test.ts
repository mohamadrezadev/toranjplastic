import { describe, expect, it } from "vitest";
import { aboutPageJsonLd, contactPageJsonLd, organizationJsonLd, serializeJsonLd } from "./jsonld";
import type { PublicManagedPage } from "./public-content";

describe("JSON-LD institutional and organization schemas", () => {
  const samplePage: PublicManagedPage = {
    id: "p1",
    title: "درباره صنایع پلاستیک ترنج",
    slug: "about",
    summary: "تولیدکننده قطعات پلاستیکی صنعتی",
    body: "متن کامل درباره ما",
    images: [],
    publishedAt: "2026-10-15T00:00:00.000Z",
    metaTitle: "درباره ما",
    metaDescription: "توضیحات متای درباره ما",
  };

  it("builds a valid Schema.org Organization", () => {
    const org = organizationJsonLd();
    expect(org["@context"]).toBe("https://schema.org");
    expect(org["@type"]).toBe("Organization");
    expect(org.name).toBe("ترنج پلاستیک");
    expect(org.address.addressLocality).toBe("کهریزک");
    expect(org.contactPoint).toHaveLength(3);
    expect(org.contactPoint[0].telephone).toBe("+98-9132075925");
    expect(org.contactPoint[1].telephone).toBe("+98-9122009515");
    expect(org.contactPoint[2].telephone).toBe("+98-9104500086");
  });

  it("builds an AboutPage schema with organization entity", () => {
    const about = aboutPageJsonLd(samplePage);
    expect(about["@type"]).toBe("AboutPage");
    expect(about.name).toBe(samplePage.title);
    expect(about.url).toContain("/about");
    expect(about.mainEntity["@type"]).toBe("Organization");
  });

  it("builds a ContactPage schema with operating hours and contact points", () => {
    const contact = contactPageJsonLd({
      ...samplePage,
      title: "تماس با ترنج پلاستیک",
      slug: "contact",
    });
    expect(contact["@type"]).toBe("ContactPage");
    expect(contact.url).toContain("/contact");
    expect(contact.mainEntity.openingHoursSpecification).toHaveLength(2);
  });

  it("safely serializes JSON-LD avoiding script injection", () => {
    const json = serializeJsonLd({ test: "</script><script>alert(1)</script>" });
    expect(json).not.toContain("</script>");
    expect(json).toContain("\\u003c/script>");
  });
});
