import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "@fontsource-variable/vazirmatn";
import "@fontsource/poppins/700.css";
import "@fontsource/poppins/800.css";
import { themeBootstrapScript } from "@/design-system/theme";
import { siteOrigin } from "@/lib/site";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteOrigin),
  title: {
    default: "ترنج پلاستیک | تولید و خدمات تزریق پلاستیک",
    template: "%s | ترنج پلاستیک",
  },
  description: "تولید محصولات کاتالوگ اختصاصی، خدمات تزریق پلاستیک کارمزدی در کهریزک بر روی دستگاه‌های ۸۰ تا ۴۵۰ تن و تأمین انواع مواد اولیه پلیمری در صنایع پلاستیک ترنج.",
  keywords: [
    "ترنج پلاستیک",
    "صنایع پلاستیک ترنج",
    "تزریق پلاستیک",
    "تزریق کارمزدی",
    "تزریق پلاستیک کهریزک",
    "تولید قطعات پلاستیکی",
    "مواد اولیه پلیمری",
    "استعلام تزریق پلاستیک",
  ],
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
  },
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  colorScheme: "light dark",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0b1219" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning>
      <body>
        <Script id="toranj-theme-bootstrap" strategy="beforeInteractive">{themeBootstrapScript}</Script>
        {children}
      </body>
    </html>
  );
}
