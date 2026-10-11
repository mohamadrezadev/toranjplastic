import { AdminContentError, type ArticleInput, type CategoryInput, type InjectionServiceInput, type ManagedPageInput, type MaterialInput, type ProductInput } from "@/lib/admin-content";
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

export function injectionServiceInputFromForm(form: FormData): InjectionServiceInput {
  return {
    name: text(form, "name"),
    slug: text(form, "slug"),
    summary: optionalText(form, "summary"),
    description: optionalText(form, "description"),
    images: imageRows(form),
    specifications: specificationRows(form),
    ctaLabel: optionalText(form, "ctaLabel"),
    ctaHref: optionalText(form, "ctaHref"),
    metaTitle: optionalText(form, "metaTitle"),
    metaDescription: optionalText(form, "metaDescription"),
  };
}

export function materialInputFromForm(form: FormData): MaterialInput {
  return {
    name: text(form, "name"),
    slug: text(form, "slug"),
    family: optionalText(form, "family"),
    grade: optionalText(form, "grade"),
    manufacturer: optionalText(form, "manufacturer"),
    summary: optionalText(form, "summary"),
    description: optionalText(form, "description"),
    images: imageRows(form),
    specifications: specificationRows(form),
    inquiryAvailable: form.get("inquiryAvailable") === "on",
    metaTitle: optionalText(form, "metaTitle"),
    metaDescription: optionalText(form, "metaDescription"),
  };
}

export function articleInputFromForm(form: FormData): ArticleInput {
  return {
    title: text(form, "title"),
    slug: text(form, "slug"),
    summary: optionalText(form, "summary"),
    body: text(form, "body"),
    featuredImage: singleImage(form, "featuredImage"),
    metaTitle: optionalText(form, "metaTitle"),
    metaDescription: optionalText(form, "metaDescription"),
  };
}

export function managedPageInputFromForm(form: FormData): ManagedPageInput {
  return {
    title: text(form, "title"),
    slug: text(form, "slug"),
    summary: optionalText(form, "summary"),
    body: text(form, "body"),
    images: imageRows(form),
    metaTitle: optionalText(form, "metaTitle"),
    metaDescription: optionalText(form, "metaDescription"),
  };
}
