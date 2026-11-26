import type { Metadata } from "next";
import { BrandComponentLab } from "./BrandComponentLab";

export const metadata: Metadata = {
  title: "آزمایشگاه رابط کاربری ترنج",
  description: "پیش‌نمایش داخلی و noindex از نگاشت ASTRYX به هویت بصری ترنج پلاستیک.",
  robots: { index: false, follow: false },
};

export default function BrandPreviewPage() {
  return <BrandComponentLab />;
}
