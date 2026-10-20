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
  title: "ترنج پلاستیک",
  description: "معرفی محصولات، خدمات تزریق پلاستیک و مواد اولیه ترنج پلاستیک.",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  colorScheme: "light dark",
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
