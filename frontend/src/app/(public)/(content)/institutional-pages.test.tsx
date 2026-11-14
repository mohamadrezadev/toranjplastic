import { InternationalizationProvider } from "@astryxdesign/core/i18n";
import { render, screen, within } from "@testing-library/react";
import { axe } from "jest-axe";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { ManagedPage } from "@/components/content/ManagedPage";
import { astryxPersianOverrides } from "@/design-system/astryx-i18n";
import { getManagedPage } from "@/lib/public-content";
import AboutPage, { generateMetadata as generateAboutMetadata } from "./about/page";
import ContactPage, { generateMetadata as generateContactMetadata } from "./contact/page";
import PrivacyPage, { generateMetadata as generatePrivacyMetadata } from "./privacy/page";
import TermsPage, { generateMetadata as generateTermsMetadata } from "./terms/page";

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
    if (slug === "privacy" || slug === "terms") {
      return {
        id: `page-${slug}`,
        title: slug === "privacy" ? "حریم خصوصی کاربران ترنج" : "شرایط استفاده از وب‌سایت ترنج",
        slug,
        summary: null,
        body: "بند نخست متن رسمی.\n\nبند دوم متن رسمی.",
        images: [],
        publishedAt: "2026-10-15T00:00:00.000Z",
        metaTitle: null,
        metaDescription: null,
      };
    }
    const err = new Error("Not found");
    (err as { status?: number }).status = 404;
    throw err;
  }),
  isNotFoundError: (err: unknown) => (err as { status?: number })?.status === 404,
}));

const notFoundDigest = "NEXT_HTTP_ERROR_FALLBACK;404";
const missingPage = Object.assign(new Error("Not found"), { status: 404 });

function PersianAstryx({ children }: { children: ReactNode }) {
  return <InternationalizationProvider locale="fa-IR" dir="rtl" overrides={astryxPersianOverrides}>{children}</InternationalizationProvider>;
}

const renderPage = (ui: ReactNode) => render(ui, { wrapper: PersianAstryx });

describe("Institutional pages presentation & SEO", () => {
  it("renders AboutPage with plant fleet, QC assurance, and accessible JSON-LD", async () => {
    const pageComponent = await AboutPage();
    const { container } = renderPage(pageComponent);

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

  it("composes the about sections as labelled regions in approved order", async () => {
    const { container } = renderPage(await AboutPage());

    expect(screen.getByRole("heading", { level: 1, name: "درباره صنایع پلاستیک ترنج" })).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "کارخانه ترنج" })).toHaveAttribute("src", "/branding/banners/about.png");
    expect(screen.getByText("کارخانه و خطوط تولید: تهران، کهریزک — مجهز به ناوگان ماشین‌آلات تزریق هیدرولیک و سروو.")).toBeInTheDocument();

    const overview = screen.getByRole("region", { name: "معرفی کارخانه و خطوط تولید" });
    expect(within(overview).getByText("متن معرفی کارخانه ترنج پلاستیک").tagName).toBe("P");

    const activities = screen.getByRole("region", { name: "سه محور اصلی فعالیت صنایع پلاستیک ترنج" });
    expect(within(activities).getAllByRole("heading", { level: 3 }).map((heading) => heading.textContent)).toEqual([
      "۱. تولید محصولات اختصاصی ترنج",
      "۲. خدمات تزریق پلاستیک کارمزدی",
      "۳. تأمین مواد اولیه پلیمری",
    ]);
    // The three activity cards use the shared balanced steps (no third card beside an empty track).
    expect(activities.querySelector('[data-layout="balanced"]')?.children).toHaveLength(3);
    // Latin grade and certificate codes keep an isolated LTR run inside the Persian text.
    expect(within(activities).getByText("PP, PE")).toHaveAttribute("dir", "ltr");
    expect(within(activities).getByText("CoA")).toHaveAttribute("dir", "ltr");
    expect(within(activities).getByText(/تأمین و توزیع مستقیم/)).toHaveTextContent("تأمین و توزیع مستقیم انواع گریدهای پلیمری (PP, PE و...) همراه با برگه معتبر آنالیز پتروشیمی (CoA) و مشاوره انتخاب گرید متناسب با قطعه.");

    const callToAction = screen.getByRole("region", { name: "آماده همکاری و پاسخگویی به پروژه‌های صنعتی شما" });
    expect(within(callToAction).getByRole("link", { name: "ثبت استعلام آنلاین" })).toHaveAttribute("href", "/inquiry");
    expect(within(callToAction).getByRole("link", { name: "راه‌های تماس با کارخانه" })).toHaveAttribute("href", "/contact");

    expect(overview.compareDocumentPosition(activities) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(activities.compareDocumentPosition(callToAction) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(container.querySelector("main")?.textContent).not.toMatch(/سبد خرید|پرداخت آنلاین|موجودی لحظه‌ای/);
  });

  it("generates correct metadata for AboutPage", async () => {
    const metadata = await generateAboutMetadata();
    expect(metadata.title).toBe("درباره ما | صنایع پلاستیک ترنج | ترنج پلاستیک");
    expect(metadata.description).toBe("معرفی صنایع پلاستیک ترنج و ناوگان ماشین‌آلات");
    expect(metadata.alternates?.canonical).toContain("/about");
  });

  it("renders ContactPage with direct channels, operating hours, and contact points", async () => {
    const pageComponent = await ContactPage();
    const { container } = renderPage(pageComponent);

    expect(screen.getByRole("heading", { name: "تماس با صنایع پلاستیک ترنج" })).toBeInTheDocument();
    expect(screen.getByText("واحد فروش محصولات و سفارش‌های عمده")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "۰۹۱۳۲۰۷۵۹۲۵" })).toHaveAttribute("href", "tel:+989132075925");
    expect(screen.getByRole("link", { name: "۰۹۱۲۲۰۰۹۵۱۵" })).toHaveAttribute("href", "tel:+989122009515");
    expect(screen.getByRole("link", { name: "۰۹۱۰۴۵۰۰۰۸۶" })).toHaveAttribute("href", "tel:+989104500086");
    expect(screen.getByRole("link", { name: "info@toranjplastic.com" })).toHaveAttribute("href", "mailto:info@toranjplastic.com");
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

  it("keeps the verified contact channels, hours and address exactly and bidi-isolated", async () => {
    const { container } = renderPage(await ContactPage());

    // Only the approved phone and email actions exist on the page.
    expect([...container.querySelectorAll('a[href^="tel:"], a[href^="mailto:"]')].map((link) => link.getAttribute("href"))).toEqual([
      "tel:+989132075925",
      "tel:+989122009515",
      "tel:+989104500086",
      "mailto:info@toranjplastic.com",
    ]);
    for (const value of ["۰۹۱۳۲۰۷۵۹۲۵", "۰۹۱۲۲۰۰۹۵۱۵", "۰۹۱۰۴۵۰۰۰۸۶", "info@toranjplastic.com"]) {
      expect(screen.getByText(value), value).toHaveAttribute("dir", "ltr");
    }

    const channels = screen.getByRole("region", { name: "کانال‌های ارتباط مستقیم با کارخانه" });
    expect(within(channels).getAllByRole("heading", { level: 3 }).map((heading) => heading.textContent)).toEqual([
      "واحد فروش محصولات و سفارش‌های عمده",
      "پشتیبانی فنی وب‌سایت",
      "واحد تأمین مواد اولیه پلیمری و مکاتبات",
      "ساعات کاری و پذیرش",
      "نشانی کارخانه و انبار مرکزی",
    ]);
    expect(within(channels).getByText("PP, PE")).toHaveAttribute("dir", "ltr");
    // The three channel cards use the shared balanced steps (no third card beside an empty track).
    expect(channels.querySelector('[data-layout="balanced"]')?.children).toHaveLength(3);
    expect(within(channels).getAllByRole("term").map((term) => term.textContent)).toEqual(["شنبه تا چهارشنبه:", "پنج‌شنبه‌ها:", "جمعه‌ها و تعطیلات رسمی:"]);
    expect(within(channels).getAllByRole("definition").map((definition) => definition.textContent)).toEqual(["۸:۰۰ الی ۱۷:۰۰", "۸:۰۰ الی ۱۳:۰۰", "تعطیل"]);
    expect(within(channels).getByText("تهران، کهریزک، مجتمع تولیدی صنایع پلاستیک ترنج").tagName).toBe("P");

    const fastTrack = screen.getByRole("region", { name: "سریع‌ترین مسیر: ثبت استعلام در سامانه آنلاین" });
    expect(within(fastTrack).getByRole("link", { name: "ورود به فرم استعلام و ثبت مشخصات قطعه" })).toHaveAttribute("href", "/inquiry");
  });

  it("generates correct metadata for ContactPage", async () => {
    const metadata = await generateContactMetadata();
    expect(metadata.title).toBe("تماس با ما | صنایع پلاستیک ترنج | ترنج پلاستیک");
    expect(metadata.description).toBe("شماره تماس و آدرس صنایع پلاستیک ترنج");
    expect(metadata.alternates?.canonical).toContain("/contact");
  });

  it("returns the shared not-found experience instead of substituting unapproved company details", async () => {
    vi.mocked(getManagedPage).mockRejectedValueOnce(missingPage).mockRejectedValueOnce(missingPage);
    await expect(ContactPage()).rejects.toMatchObject({ digest: notFoundDigest });
    await expect(generateContactMetadata()).resolves.toEqual({ title: "تماس با ما | ترنج پلاستیک", robots: { index: false, follow: false } });

    vi.mocked(getManagedPage).mockRejectedValueOnce(missingPage).mockRejectedValueOnce(missingPage);
    await expect(AboutPage()).rejects.toMatchObject({ digest: notFoundDigest });
    await expect(generateAboutMetadata()).resolves.toEqual({ title: "درباره ما | ترنج پلاستیک", robots: { index: false, follow: false } });

    // Other failures stay on the route error boundary.
    vi.mocked(getManagedPage).mockRejectedValueOnce(new Error("upstream unavailable"));
    await expect(ContactPage()).rejects.toThrow("upstream unavailable");
  });

  it("renders the privacy and terms routes through the shared managed page", async () => {
    expect(PrivacyPage()).toMatchObject({ type: ManagedPage, props: { slug: "privacy", fallbackTitle: "سیاست حفظ حریم خصوصی" } });
    expect(TermsPage()).toMatchObject({ type: ManagedPage, props: { slug: "terms", fallbackTitle: "قوانین و مقررات استفاده" } });

    const { container } = renderPage(await ManagedPage(PrivacyPage().props));
    expect(screen.getByRole("heading", { level: 1, name: "حریم خصوصی کاربران ترنج" })).toBeInTheDocument();
    expect(container.querySelectorAll("#managed-content p")).toHaveLength(2);
    expect(await axe(container)).toHaveNoViolations();

    expect((await generatePrivacyMetadata()).title).toBe("حریم خصوصی کاربران ترنج | ترنج پلاستیک");
    expect((await generateTermsMetadata()).alternates?.canonical).toBe("/terms");
    vi.mocked(getManagedPage).mockRejectedValueOnce(missingPage);
    await expect(generateTermsMetadata()).resolves.toEqual({ title: "قوانین و مقررات استفاده | ترنج پلاستیک", robots: { index: false, follow: false } });
  });

  it("styles the institutional pages with Toranj tokens and mapped Astryx roles only", () => {
    const stylesheet = readFileSync(join(process.cwd(), "src", "app", "(public)", "(content)", "institutional-pages.module.css"), "utf8");
    expect(stylesheet).not.toMatch(/#[0-9a-f]{3,8}\b|\brgba?\(|\bhsla?\(/i);
    expect(stylesheet).not.toMatch(/\.x[0-9a-z]{5,}\b/);
  });
});
