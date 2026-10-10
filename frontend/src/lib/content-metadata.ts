import type { Metadata } from "next";

export function publicContentMetadata({ title, summary, metaTitle, metaDescription }: { title: string; summary?: string | null; metaTitle?: string | null; metaDescription?: string | null }): Metadata {
  return {
    title: `${metaTitle?.trim() || title} | ترنج پلاستیک`,
    description: metaDescription?.trim() || summary?.trim() || undefined,
    robots: { index: true, follow: true },
  };
}

export const publicCollectionMetadata = (title: string, description: string): Metadata => publicContentMetadata({ title, summary: description });
