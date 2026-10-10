export interface PageRequest {
  page: number;
  pageSize: number;
}

export interface ProductPageRequest extends PageRequest {
  featured?: boolean;
}

export interface PageInfo {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface PageResult<T> {
  items: T[];
  pageInfo: PageInfo;
}

export interface PublicImage {
  url: string;
  alt: string;
  width?: number;
  height?: number;
}

export interface PublicSpecification {
  label: string;
  value: string;
}

export interface PublicSeo {
  metaTitle: string | null;
  metaDescription: string | null;
}

export interface PublicCategory extends PublicSeo {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: PublicImage | null;
  publishedAt: string;
}

export interface PublicProduct extends PublicSeo {
  id: string;
  name: string;
  slug: string;
  summary: string | null;
  description: string | null;
  category: Pick<PublicCategory, 'id' | 'name' | 'slug'> | null;
  images: PublicImage[];
  specifications: PublicSpecification[];
  featured: boolean;
  publishedAt: string;
}

export interface PublicInjectionService extends PublicSeo {
  id: string;
  name: string;
  slug: string;
  summary: string | null;
  description: string | null;
  images: PublicImage[];
  specifications: PublicSpecification[];
  ctaLabel: string | null;
  ctaHref: string | null;
  publishedAt: string;
}

export interface PublicMaterial extends PublicSeo {
  id: string;
  name: string;
  slug: string;
  family: string | null;
  grade: string | null;
  manufacturer: string | null;
  summary: string | null;
  description: string | null;
  images: PublicImage[];
  specifications: PublicSpecification[];
  inquiryAvailable: boolean;
  publishedAt: string;
}

export interface PublicArticle extends PublicSeo {
  id: string;
  title: string;
  slug: string;
  summary: string | null;
  body: string;
  featuredImage: PublicImage | null;
  publishedAt: string;
}

export interface PublicManagedPage extends PublicSeo {
  id: string;
  title: string;
  slug: string;
  summary: string | null;
  body: string;
  images: PublicImage[];
  publishedAt: string;
}
