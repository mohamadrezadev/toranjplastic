import type { Metadata } from "next";
import type { PublicImage } from "./public-content";
import { absoluteUrl, siteName } from "./site";

type PublicMetadataInput = {
  title: string;
  path: string;
  summary?: string | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
  images?: PublicImage[];
};

export function publicContentMetadata({ title, path, summary, metaTitle, metaDescription, images = [] }: PublicMetadataInput): Metadata {
  const resolvedTitle = metaTitle?.trim() || title;
  const description = metaDescription?.trim() || summary?.trim() || undefined;
  const socialImages = images.map((image) => ({ url: absoluteUrl(image.url), alt: image.alt, width: image.width, height: image.height }));
  const defaultSocialImages = [{ url: absoluteUrl("/branding/banners/home-hero.webp"), width: 1916, height: 821, alt: siteName }];
  const effectiveImages = socialImages.length ? socialImages : defaultSocialImages;
  const pageTitle = resolvedTitle === siteName ? `${siteName} | تولید و خدمات تزریق پلاستیک` : `${resolvedTitle} | ${siteName}`;

  return {
    title: pageTitle,
    description,
    alternates: { canonical: path },
    robots: { index: true, follow: true },
    openGraph: {
      type: "website",
      locale: "fa_IR",
      siteName,
      title: resolvedTitle,
      description,
      url: path,
      images: effectiveImages,
    },
    twitter: {
      card: "summary_large_image",
      title: resolvedTitle,
      description,
      images: effectiveImages,
    },
  };
}

export const publicCollectionMetadata = (title: string, description: string, path: string): Metadata =>
  publicContentMetadata({ title, path, summary: description });
