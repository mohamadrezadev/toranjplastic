import type { MetadataRoute } from "next";
import { absoluteUrl, siteOrigin } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/auth/", "/account", "/inquiry"],
    },
    host: siteOrigin,
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
