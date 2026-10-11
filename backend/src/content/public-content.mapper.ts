import {
  normalizeImage,
  normalizeImages,
  normalizeSpecifications,
} from '../content-shared/stored-content.js';
import type {
  PublicArticle,
  PublicCategory,
  PublicInjectionService,
  PublicManagedPage,
  PublicMaterial,
  PublicProduct,
} from './content.types.js';

export { normalizeImage, normalizeImages, normalizeSpecifications } from '../content-shared/stored-content.js';

interface RawSeo {
  metaTitle: string | null;
  metaDescription: string | null;
  publishedAt: Date | null;
}

export interface RawCategory extends RawSeo {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: unknown;
}

export interface RawProduct extends RawSeo {
  id: string;
  name: string;
  slug: string;
  summary: string | null;
  description: string | null;
  images: unknown;
  specifications: unknown;
  featured: boolean;
  category: { id: string; name: string; slug: string } | null;
}

export interface RawService extends RawSeo {
  id: string;
  name: string;
  slug: string;
  summary: string | null;
  description: string | null;
  images: unknown;
  specifications: unknown;
  ctaLabel: string | null;
  ctaHref: string | null;
}

export interface RawMaterial extends RawSeo {
  id: string;
  name: string;
  slug: string;
  family: string | null;
  grade: string | null;
  manufacturer: string | null;
  summary: string | null;
  description: string | null;
  images: unknown;
  specifications: unknown;
  inquiryAvailable: boolean;
}

export interface RawArticle extends RawSeo {
  id: string;
  title: string;
  slug: string;
  summary: string | null;
  body: string;
  featuredImage: unknown;
}

export interface RawManagedPage extends RawSeo {
  id: string;
  title: string;
  slug: string;
  summary: string | null;
  body: string;
  images: unknown;
}

function publicationDate(value: Date | null): string {
  if (value === null) throw new Error('Public content is missing publishedAt.');
  return value.toISOString();
}

function safeInternalHref(value: string | null): string | null {
  return value !== null && value.startsWith('/') && !value.startsWith('//')
    ? value
    : null;
}

export function mapCategory(value: RawCategory): PublicCategory {
  return {
    id: value.id,
    name: value.name,
    slug: value.slug,
    description: value.description,
    image: normalizeImage(value.image),
    metaTitle: value.metaTitle,
    metaDescription: value.metaDescription,
    publishedAt: publicationDate(value.publishedAt),
  };
}

export function mapProduct(value: RawProduct): PublicProduct {
  return {
    id: value.id,
    name: value.name,
    slug: value.slug,
    summary: value.summary,
    description: value.description,
    category: value.category,
    images: normalizeImages(value.images),
    specifications: normalizeSpecifications(value.specifications),
    featured: value.featured,
    metaTitle: value.metaTitle,
    metaDescription: value.metaDescription,
    publishedAt: publicationDate(value.publishedAt),
  };
}

export function mapService(value: RawService): PublicInjectionService {
  return {
    id: value.id,
    name: value.name,
    slug: value.slug,
    summary: value.summary,
    description: value.description,
    images: normalizeImages(value.images),
    specifications: normalizeSpecifications(value.specifications),
    ctaLabel: value.ctaLabel,
    ctaHref: safeInternalHref(value.ctaHref),
    metaTitle: value.metaTitle,
    metaDescription: value.metaDescription,
    publishedAt: publicationDate(value.publishedAt),
  };
}

export function mapMaterial(value: RawMaterial): PublicMaterial {
  return {
    id: value.id,
    name: value.name,
    slug: value.slug,
    family: value.family,
    grade: value.grade,
    manufacturer: value.manufacturer,
    summary: value.summary,
    description: value.description,
    images: normalizeImages(value.images),
    specifications: normalizeSpecifications(value.specifications),
    inquiryAvailable: value.inquiryAvailable,
    metaTitle: value.metaTitle,
    metaDescription: value.metaDescription,
    publishedAt: publicationDate(value.publishedAt),
  };
}

export function mapArticle(value: RawArticle): PublicArticle {
  return {
    id: value.id,
    title: value.title,
    slug: value.slug,
    summary: value.summary,
    body: value.body,
    featuredImage: normalizeImage(value.featuredImage),
    metaTitle: value.metaTitle,
    metaDescription: value.metaDescription,
    publishedAt: publicationDate(value.publishedAt),
  };
}

export function mapManagedPage(value: RawManagedPage): PublicManagedPage {
  return {
    id: value.id,
    title: value.title,
    slug: value.slug,
    summary: value.summary,
    body: value.body,
    images: normalizeImages(value.images),
    metaTitle: value.metaTitle,
    metaDescription: value.metaDescription,
    publishedAt: publicationDate(value.publishedAt),
  };
}
