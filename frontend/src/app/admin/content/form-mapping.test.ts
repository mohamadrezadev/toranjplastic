// @vitest-environment node
import { describe, expect, it } from "vitest";
import {
  articleInputFromForm,
  categoryInputFromForm,
  injectionServiceInputFromForm,
  managedPageInputFromForm,
  materialInputFromForm,
  productInputFromForm,
} from "./form-mapping";

function form(entries: Record<string, string>): FormData {
  const data = new FormData();
  for (const [key, value] of Object.entries(entries)) data.set(key, value);
  return data;
}

describe("categoryInputFromForm", () => {
  it("trims text fields and maps blank optional fields to null", () => {
    const input = categoryInputFromForm(form({ name: " دسته ", slug: "cat", description: "  " }));
    expect(input).toMatchObject({ name: "دسته", slug: "cat", description: null, image: null });
  });

  it("builds a single image only when at least one of url/alt is filled", () => {
    const input = categoryInputFromForm(form({ name: "دسته", slug: "cat", imageUrl: "/x.webp", imageAlt: "x" }));
    expect(input.image).toEqual({ url: "/x.webp", alt: "x" });
  });
});

describe("productInputFromForm", () => {
  it("drops blank image and specification rows instead of sending empty ones", () => {
    const input = productInputFromForm(form({
      name: "محصول", slug: "prod",
      image1Url: "/a.webp", image1Alt: "a",
      image2Url: "", image2Alt: "",
      spec1Label: "وزن", spec1Value: "۱ کیلوگرم",
      spec2Label: "", spec2Value: "",
    }));
    expect(input.images).toEqual([{ url: "/a.webp", alt: "a" }]);
    expect(input.specifications).toEqual([{ label: "وزن", value: "۱ کیلوگرم" }]);
  });

  it("maps an absent categoryId to null and an absent checkbox to false", () => {
    const input = productInputFromForm(form({ name: "محصول", slug: "prod" }));
    expect(input.categoryId).toBeNull();
    expect(input.featured).toBe(false);
  });

  it("maps a checked featured checkbox to true", () => {
    const input = productInputFromForm(form({ name: "محصول", slug: "prod", featured: "on" }));
    expect(input.featured).toBe(true);
  });
});

describe("injectionServiceInputFromForm", () => {
  it("maps blank cta fields to null and drops empty image/specification rows", () => {
    const input = injectionServiceInputFromForm(form({ name: "خدمت", slug: "svc" }));
    expect(input.ctaLabel).toBeNull();
    expect(input.ctaHref).toBeNull();
    expect(input.images).toEqual([]);
    expect(input.specifications).toEqual([]);
  });

  it("keeps a filled cta label and href", () => {
    const input = injectionServiceInputFromForm(form({ name: "خدمت", slug: "svc", ctaLabel: "تماس", ctaHref: "/contact" }));
    expect(input).toMatchObject({ ctaLabel: "تماس", ctaHref: "/contact" });
  });
});

describe("materialInputFromForm", () => {
  it("maps an absent inquiryAvailable checkbox to false", () => {
    const input = materialInputFromForm(form({ name: "ماده", slug: "mat" }));
    expect(input.inquiryAvailable).toBe(false);
  });

  it("maps a checked inquiryAvailable checkbox to true and trims optional fields", () => {
    const input = materialInputFromForm(form({ name: "ماده", slug: "mat", inquiryAvailable: "on", family: " PP " }));
    expect(input.inquiryAvailable).toBe(true);
    expect(input.family).toBe("PP");
  });
});

describe("articleInputFromForm", () => {
  it("maps the body field through without trimming its internal content and builds a single featured image", () => {
    const input = articleInputFromForm(form({ title: "مقاله", slug: "art", body: "متن مقاله", featuredImageUrl: "/a.webp", featuredImageAlt: "a" }));
    expect(input).toMatchObject({ title: "مقاله", slug: "art", body: "متن مقاله" });
    expect(input.featuredImage).toEqual({ url: "/a.webp", alt: "a" });
  });

  it("maps no featured image fields to null", () => {
    const input = articleInputFromForm(form({ title: "مقاله", slug: "art", body: "متن" }));
    expect(input.featuredImage).toBeNull();
  });
});

describe("managedPageInputFromForm", () => {
  it("drops blank image rows", () => {
    const input = managedPageInputFromForm(form({
      title: "صفحه", slug: "page", body: "متن",
      image1Url: "/a.webp", image1Alt: "a",
      image2Url: "", image2Alt: "",
    }));
    expect(input.images).toEqual([{ url: "/a.webp", alt: "a" }]);
  });
});
