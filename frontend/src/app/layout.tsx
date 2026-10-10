import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "@fontsource-variable/estedad";
import { themeBootstrapScript } from "@/design-system/theme";
import "./globals.css";

export const metadata: Metadata = {
  title: "ترنج پلاستیک | پایه فنی پروژه",
  description: "پایه فنی وب‌سایت فارسی ترنج پلاستیک؛ محصولات، تزریق پلاستیک و تأمین مواد اولیه.",
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
