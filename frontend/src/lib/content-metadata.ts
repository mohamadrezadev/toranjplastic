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

  return {
    title: `${resolvedTitle} | ${siteName}`,
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
      images: socialImages.length ? socialImages : undefined,
    },
  };
}

export const publicCollectionMetadata = (title: string, description: string, path: string): Metadata =>
  publicContentMetadata({ title, path, summary: description });
