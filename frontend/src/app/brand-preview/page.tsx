import type { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = { title: "پیش‌نمایش بسته برند (داخلی)", robots: { index: false, follow: false } };

const swatches = [
  { name: "Brand dark", hex: "#111923" },
  { name: "Corporate navy", hex: "#17324D" },
  { name: "Brand orange", hex: "#FF6900" },
] as const;

export default function BrandPreviewPage() {
  return (
    <main style={{ padding: "2rem", display: "grid", gap: "2rem", maxWidth: "64rem", marginInline: "auto" }}>
      <section style={{ display: "grid", gap: ".5rem" }}>
        <h1 style={{ fontSize: "1.5rem" }}>پیش‌نمایش خام بسته برند (صفحه داخلی، noindex)</h1>
        <p style={{ color: "var(--color-text-secondary)" }}>
          این صفحه فقط برای مقایسه داخلی است و بخشی از محتوای عمومی سایت نیست. تصاویر زیر عیناً همان فایل‌های اصلی پوشه
          <code dir="ltr" className="ltr-data"> Toranj_Logo_And_Icons_Web_v1</code> هستند، بدون هیچ بازرنگ‌آمیزی توسط کد.
        </p>
      </section>

      <section style={{ display: "grid", gap: ".75rem" }}>
        <h2 style={{ fontSize: "1.1rem" }}>پیش‌نمایش رسمی بسته (preview/brand-preview-wide.png)</h2>
        <Image src="/branding/preview/brand-preview-wide.png" alt="پیش‌نمایش لوگو، آیکن‌ها و پالت بسته برند ترنج" width={1600} height={900} style={{ width: "100%", height: "auto", border: "1px solid var(--color-border-default)", borderRadius: "var(--radius-md)" }} />
      </section>

      <section style={{ display: "grid", gap: ".75rem" }}>
        <h2 style={{ fontSize: "1.1rem" }}>تصویر مرجع اصلی (reference/toranj-catalog-logo-crop.png)</h2>
        <p style={{ color: "var(--color-text-secondary)", fontSize: ".9rem" }}>لوگو از روی همین ناحیه برش‌خورده از کاتالوگ قدیمی بازترسیم شده؛ این فایل برداری رسمی کارخانه نیست.</p>
        <Image src="/branding/preview/toranj-catalog-logo-crop.png" alt="برش مرجع لوگو از روی صفحه اول کاتالوگ قدیمی" width={600} height={300} style={{ width: "min(100%, 24rem)", height: "auto", border: "1px solid var(--color-border-default)", borderRadius: "var(--radius-md)" }} />
      </section>

      <section style={{ display: "grid", gap: ".75rem" }}>
        <h2 style={{ fontSize: "1.1rem" }}>رنگ‌های پایه اعلام‌شده در README بسته</h2>
        <ul style={{ display: "grid", gap: ".5rem", listStyle: "none" }}>
          {swatches.map((swatch) => (
            <li key={swatch.hex} style={{ display: "flex", alignItems: "center", gap: ".75rem" }}>
              <span aria-hidden="true" style={{ width: "2rem", height: "2rem", display: "inline-block", borderRadius: "var(--radius-sm)", border: "1px solid var(--color-border-default)", background: swatch.hex }} />
              <span>{swatch.name} — <span dir="ltr" className="ltr-data">{swatch.hex}</span></span>
            </li>
          ))}
        </ul>
        <p style={{ color: "var(--color-text-secondary)", fontSize: ".9rem" }}>
          توجه: <span dir="ltr" className="ltr-data">#FF6900</span> خام روی متن سفید دکمه کنتراست AA را رد می‌کند، برای همین در توکن‌های سایت نسخه عمیق‌تری استفاده شد — جزئیات در <code dir="ltr" className="ltr-data">docs/brand-identity-provenance.md</code>.
        </p>
      </section>
    </main>
  );
}
