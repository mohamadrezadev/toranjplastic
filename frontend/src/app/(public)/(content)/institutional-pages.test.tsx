import { render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { describe, expect, it, vi } from "vitest";
import AboutPage, { generateMetadata as generateAboutMetadata } from "./about/page";
import ContactPage, { generateMetadata as generateContactMetadata } from "./contact/page";

vi.mock("@/lib/public-content", () => ({
  getManagedPage: vi.fn(async (slug: string) => {
    if (slug === "about") {
      return {
        id: "page-about",
        title: "درباره صنایع پلاستیک ترنج",
        slug: "about",
        summary: "تولیدکننده پیشرو در صنعت قالب‌گیری تزریق پلاستیک در تناژهای ۸۰ تا ۴۵۰ تن.",
        body: "متن معرفی کارخانه ترنج پلاستیک",
        images: [{ url: "/branding/banners/about.png", alt: "کارخانه ترنج", width: 1200, height: 800 }],
        displayOrder: 10,
        publishedAt: "2026-10-15T00:00:00.000Z",
        metaTitle: "درباره ما | صنایع پلاستیک ترنج",
        metaDescription: "معرفی صنایع پلاستیک ترنج و ناوگان ماشین‌آلات",
      };
    }
    if (slug === "contact") {
      return {
        id: "page-contact",
        title: "تماس با صنایع پلاستیک ترنج",
        slug: "contact",
        summary: "راه‌های ارتباط مستقیم با واحدهای مهندسی و فروش ترنج پلاستیک.",
        body: "متن راه‌های تماس",
        images: [{ url: "/branding/banners/contact.png", alt: "دفتر ترنج", width: 1200, height: 800 }],
        displayOrder: 20,
        publishedAt: "2026-10-15T00:00:00.000Z",
        metaTitle: "تماس با ما | صنایع پلاستیک ترنج",
        metaDescription: "شماره تماس و آدرس صنایع پلاستیک ترنج",
      };
    }
    const err = new Error("Not found");
    (err as { status?: number }).status = 404;
    throw err;
  }),
  isNotFoundError: (err: unknown) => (err as { status?: number })?.status === 404,
}));

describe("Institutional pages presentation & SEO", () => {
  it("renders AboutPage with plant fleet, QC assurance, and accessible JSON-LD", async () => {
    const pageComponent = await AboutPage();
    const { container } = render(pageComponent);

    expect(screen.getByRole("heading", { name: "درباره صنایع پلاستیک ترنج" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "معرفی کارخانه و خطوط تولید" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "سه محور اصلی فعالیت صنایع پلاستیک ترنج" })).toBeInTheDocument();
    expect(screen.getByText("۱. تولید محصولات اختصاصی ترنج")).toBeInTheDocument();
    expect(screen.getByText("۲. خدمات تزریق پلاستیک کارمزدی")).toBeInTheDocument();
    expect(screen.getByText("۳. تأمین مواد اولیه پلیمری")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "ثبت استعلام مستقیم پروژه" })).toHaveAttribute("href", "/inquiry");

    const script = container.querySelector('script[type="application/ld+json"]');
    expect(script).not.toBeNull();
    const json = JSON.parse(script!.textContent || "{}");
    expect(json["@type"]).toBe("AboutPage");
    expect(json.mainEntity["@type"]).toBe("Organization");

    expect(await axe(container)).toHaveNoViolations();
  });

  it("generates correct metadata for AboutPage", async () => {
    const metadata = await generateAboutMetadata();
    expect(metadata.title).toBe("درباره ما | صنایع پلاستیک ترنج | ترنج پلاستیک");
    expect(metadata.description).toBe("معرفی صنایع پلاستیک ترنج و ناوگان ماشین‌آلات");
    expect(metadata.alternates?.canonical).toContain("/about");
  });

  it("renders ContactPage with direct channels, operating hours, and contact points", async () => {
    const pageComponent = await ContactPage();
    const { container } = render(pageComponent);

    expect(screen.getByRole("heading", { name: "تماس با صنایع پلاستیک ترنج" })).toBeInTheDocument();
    expect(screen.getByText("واحد فروش محصولات و سفارش‌های عمده")).toBeInTheDocument();
    expect(screen.getByText("۰۹۱۳۲۰۷۵۹۲۵")).toHaveAttribute("href", "tel:+989132075925");
    expect(screen.getByText("۰۹۱۲۲۰۰۹۵۱۵")).toHaveAttribute("href", "tel:+989122009515");
    expect(screen.getByText("۰۹۱۰۴۵۰۰۰۸۶")).toHaveAttribute("href", "tel:+989104500086");
    expect(screen.getByText("info@toranjplastic.com")).toHaveAttribute("href", "mailto:info@toranjplastic.com");
    expect(screen.getByText("ساعات کاری و پذیرش")).toBeInTheDocument();
    expect(screen.getAllByText(/کهریزک/)[0]).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "ثبت آنلاین استعلام قیمت" })).toHaveAttribute("href", "/inquiry");

    const script = container.querySelector('script[type="application/ld+json"]');
    expect(script).not.toBeNull();
    const json = JSON.parse(script!.textContent || "{}");
    expect(json["@type"]).toBe("ContactPage");
    expect(json.mainEntity.contactPoint).toHaveLength(3);

    expect(await axe(container)).toHaveNoViolations();
  });

  it("generates correct metadata for ContactPage", async () => {
    const metadata = await generateContactMetadata();
    expect(metadata.title).toBe("تماس با ما | صنایع پلاستیک ترنج | ترنج پلاستیک");
    expect(metadata.description).toBe("شماره تماس و آدرس صنایع پلاستیک ترنج");
    expect(metadata.alternates?.canonical).toContain("/contact");
  });
});
