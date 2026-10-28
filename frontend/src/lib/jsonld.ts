import type { PublicManagedPage } from "./public-content";
import { absoluteUrl, siteName } from "./site";

export function serializeJsonLd(value: unknown) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteName,
    alternateName: "صنایع پلاستیک ترنج",
    url: absoluteUrl("/"),
    logo: absoluteUrl("/branding/brandmark.png"),
    description: "تولیدکننده قطعات پلاستیکی صنعتی و ارائه‌دهنده خدمات تخصصی قالب‌گیری تزریق پلاستیک در تناژهای ۸۰ تا ۴۵۰ تن.",
    address: {
      "@type": "PostalAddress",
      addressLocality: "کهریزک",
      addressRegion: "تهران",
      addressCountry: "IR",
      streetAddress: "تهران، کهریزک",
    },
    contactPoint: [
      {
        "@type": "ContactPoint",
        telephone: "+98-9132075925",
        contactType: "sales",
        areaServed: "IR",
        availableLanguage: ["Persian", "fa"],
      },
      {
        "@type": "ContactPoint",
        telephone: "+98-9122009515",
        contactType: "sales",
        areaServed: "IR",
        availableLanguage: ["Persian", "fa"],
      },
      {
        "@type": "ContactPoint",
        telephone: "+98-9104500086",
        contactType: "technical support",
        areaServed: "IR",
        availableLanguage: ["Persian", "fa"],
      },
    ],
  };
}

export function aboutPageJsonLd(page: PublicManagedPage) {
  return {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    name: page.title,
    description: page.summary || page.metaDescription || undefined,
    url: absoluteUrl("/about"),
    mainEntity: organizationJsonLd(),
  };
}

export function contactPageJsonLd(page: PublicManagedPage) {
  return {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    name: page.title,
    description: page.summary || page.metaDescription || undefined,
    url: absoluteUrl("/contact"),
    mainEntity: {
      ...organizationJsonLd(),
      openingHoursSpecification: [
        {
          "@type": "OpeningHoursSpecification",
          dayOfWeek: ["Saturday", "Sunday", "Monday", "Tuesday", "Wednesday"],
          opens: "08:00",
          closes: "17:00",
        },
        {
          "@type": "OpeningHoursSpecification",
          dayOfWeek: ["Thursday"],
          opens: "08:00",
          closes: "13:00",
        },
      ],
    },
  };
}
