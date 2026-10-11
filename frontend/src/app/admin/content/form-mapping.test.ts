// @vitest-environment node
import { describe, expect, it } from "vitest";
import { categoryInputFromForm, productInputFromForm } from "./form-mapping";

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
