import { AdminContentError, type CategoryInput, type ProductInput } from "@/lib/admin-content";
import type { PublicImage, PublicSpecification } from "@/lib/public-content";

const IMAGE_ROWS = 6;
const SPECIFICATION_ROWS = 10;

function text(form: FormData, name: string): string {
  return String(form.get(name) ?? "").trim();
}

function optionalText(form: FormData, name: string): string | null {
  const value = text(form, name);
  return value === "" ? null : value;
}

function singleImage(form: FormData, prefix: string): PublicImage | null {
  const url = text(form, `${prefix}Url`);
  const alt = text(form, `${prefix}Alt`);
  return url === "" && alt === "" ? null : { url, alt };
}

function imageRows(form: FormData): PublicImage[] {
  const images: PublicImage[] = [];
  for (let index = 1; index <= IMAGE_ROWS; index += 1) {
    const image = singleImage(form, `image${index}`);
    if (image) images.push(image);
  }
  return images;
}

function specificationRows(form: FormData): PublicSpecification[] {
  const specifications: PublicSpecification[] = [];
  for (let index = 1; index <= SPECIFICATION_ROWS; index += 1) {
    const label = text(form, `spec${index}Label`);
    const value = text(form, `spec${index}Value`);
    if (label === "" && value === "") continue;
    specifications.push({ label, value });
  }
  return specifications;
}

export function errorKind(error: unknown): string {
  return error instanceof AdminContentError ? error.kind : "failed";
}

export function categoryInputFromForm(form: FormData): CategoryInput {
  return {
    name: text(form, "name"),
    slug: text(form, "slug"),
    description: optionalText(form, "description"),
    image: singleImage(form, "image"),
    metaTitle: optionalText(form, "metaTitle"),
    metaDescription: optionalText(form, "metaDescription"),
  };
}

export function productInputFromForm(form: FormData): ProductInput {
  const categoryId = text(form, "categoryId");
  return {
    name: text(form, "name"),
    slug: text(form, "slug"),
    summary: optionalText(form, "summary"),
    description: optionalText(form, "description"),
    categoryId: categoryId === "" ? null : categoryId,
    images: imageRows(form),
    specifications: specificationRows(form),
    featured: form.get("featured") === "on",
    metaTitle: optionalText(form, "metaTitle"),
    metaDescription: optionalText(form, "metaDescription"),
  };
}
