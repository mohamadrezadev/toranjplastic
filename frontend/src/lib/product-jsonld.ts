import type { PublicProduct } from "./public-content";
import { absoluteUrl, siteName } from "./site";

export function productJsonLd(product: PublicProduct) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.summary || product.metaDescription || undefined,
    url: absoluteUrl(`/products/${product.slug}`),
    image: product.images.map((image) => absoluteUrl(image.url)),
    category: product.category?.name,
    brand: { "@type": "Brand", name: siteName },
  };
}

export function serializeJsonLd(value: unknown) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}
