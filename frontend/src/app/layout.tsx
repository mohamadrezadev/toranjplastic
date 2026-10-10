import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ترنج پلاستیک | پایه فنی پروژه",
  description: "پایه فنی وب‌سایت فارسی ترنج پلاستیک؛ محصولات، تزریق پلاستیک و تأمین مواد اولیه.",
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fa" dir="rtl">
      <body>{children}</body>
    </html>
  );
}
