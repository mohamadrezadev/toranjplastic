import { Heading } from "@astryxdesign/core/Heading";
import { InternationalizationProvider } from "@astryxdesign/core/i18n";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import Link from "next/link";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import type { ReactNode } from "react";
import { describe, expect, it } from "vitest";
import { astryxPersianOverrides } from "@/design-system/astryx-i18n";
import { ArticleMeta, formatArticleDate } from "./ArticleMeta";
import { CampaignBanner } from "./CampaignBanner";
import { BalancedGrid, CatalogLandingHero, CatalogSectionHeading, ContentCard, ContentGrid, ContentPageHeading, ContentTag, DetailHero, DetailInquiryCard, Eyebrow, ImageGallery, Pagination, PreservedText, SectionTitle, Specifications, contentStyles } from "./ContentPage";

function PersianAstryx({ children }: { children: ReactNode }) {
  return <InternationalizationProvider locale="fa-IR" dir="rtl" overrides={astryxPersianOverrides}>{children}</InternationalizationProvider>;
}

const renderContent = (ui: ReactNode) => render(ui, { wrapper: PersianAstryx });

describe("public content presentation", () => {
  it("renders approved optional data and a valid detail destination", async () => {
    const { container } = renderContent(<ContentCard title="سبد صنعتی" summary="خلاصه تأییدشده" href="/products/industrial-basket" image={null} meta={<ContentTag ltr>PP-H012</ContentTag>} />);
    expect(screen.getByRole("link", { name: "مشاهده جزئیات" })).toHaveAttribute("href", "/products/industrial-basket");
    expect(screen.getByText("PP-H012")).toHaveAttribute("dir", "ltr");
    expect(screen.getByText("تصویر ثبت نشده")).toBeInTheDocument();
    expect(await axe(container)).toHaveNoViolations();
  });

  it("keeps each card one article with a level-two title and two named destinations", () => {
    const image = { url: "/media/product.webp", alt: "سبد صنعتی", width: 800, height: 600 };
    renderContent(<ContentCard title="سبد صنعتی" summary="خلاصه تأییدشده" href="/products/industrial-basket" image={image} meta={<ContentTag>منتخب</ContentTag>} />);
    const card = screen.getByRole("article");
    expect(within(card).getByRole("heading", { level: 2, name: "سبد صنعتی" })).toBeInTheDocument();
    // The media shortcut is hidden from assistive technology and the tab order.
    const links = within(card).getAllByRole("link");
    expect(links.map((link) => link.textContent?.trim())).toEqual(["سبد صنعتی", "مشاهده جزئیات ←"]);
    expect(links.every((link) => link.getAttribute("href") === "/products/industrial-basket")).toBe(true);
    const mediaLink = card.querySelector('a[aria-hidden="true"]');
    expect(mediaLink).toHaveAttribute("tabindex", "-1");
    const img = card.querySelector("img");
    expect(img).toHaveAttribute("alt", "");
    expect(img).toHaveAttribute("width", "800");
    expect(img).toHaveAttribute("height", "600");
    expect(img).toHaveAttribute("loading", "lazy");
    expect(img).toHaveAttribute("decoding", "async");
    expect(card.querySelectorAll("img")).toHaveLength(1);
    expect(screen.getByText("خلاصه تأییدشده").tagName).toBe("P");
    expect(screen.getByText("منتخب")).toBeInTheDocument();
  });

  it("lets a collection under its caller's own level-two heading use level-three card titles", async () => {
    const { container } = renderContent(
      <section aria-labelledby="latest-title">
        <Heading level={2} id="latest-title">آخرین مقالات</Heading>
        <ContentCard title="راهنمای انتخاب ماده" summary="خلاصه تأییدشده" href="/articles/material-selection" image={null} titleLevel={3} />
      </section>,
    );
    const card = screen.getByRole("article");
    expect(within(card).getByRole("heading", { level: 3, name: "راهنمای انتخاب ماده" })).toBeInTheDocument();
    expect(within(card).queryByRole("heading", { level: 2 })).not.toBeInTheDocument();
    expect(within(card).getByRole("link", { name: "راهنمای انتخاب ماده" })).toHaveAttribute("href", "/articles/material-selection");
    expect(await axe(container)).toHaveNoViolations();
  });

  it("shares the eyebrow type role as plain supporting text", () => {
    renderContent(<Eyebrow>۰۳ / دانشنامه و راهنماهای فنی</Eyebrow>);
    const eyebrow = screen.getByText("۰۳ / دانشنامه و راهنماهای فنی");
    expect(eyebrow).toBeInTheDocument();
    expect(screen.queryByRole("heading")).not.toBeInTheDocument();
  });

  it("marks one-, two-, and three-item collections for adaptive responsive layouts", () => {
    const card = (title: string) => <ContentCard key={title} title={title} href={`/products/${title}`} image={null} />;
    const { container, rerender } = renderContent(<ContentGrid featured>{card("featured")}</ContentGrid>);
    expect(container.querySelector('[data-layout="featured"]')).toBeInTheDocument();
    rerender(<ContentGrid>{card("single")}</ContentGrid>);
    expect(container.querySelector('[data-layout="single"]')).toBeInTheDocument();
    rerender(<ContentGrid>{[card("one"), card("two")]}</ContentGrid>);
    expect(container.querySelector('[data-layout="pair"]')).toBeInTheDocument();
    rerender(<ContentGrid>{[card("one"), card("two"), card("three")]}</ContentGrid>);
    expect(container.querySelector('[data-layout="grid"]')).toBeInTheDocument();
    expect(screen.getAllByRole("article")).toHaveLength(3);
  });

  it("renders collection headings and an image-backed card", async () => {
    const image = { url: "/media/product.webp", alt: "سبد صنعتی", width: 800, height: 600 };
    const { container } = renderContent(<>
      <section aria-label="معرفی کاتالوگ"><ContentPageHeading eyebrow="کاتالوگ" title="محصولات" description="فهرست محصولات" /></section>
      <section aria-label="فهرست کاتالوگ"><CatalogSectionHeading eyebrow="منتشرشده" title="انتخاب محصول" description="جزئیات تأییدشده" /></section>
      <ContentCard title="سبد صنعتی" href="/products/industrial-basket" image={image} />
    </>);
    expect(screen.getByRole("heading", { name: "محصولات" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "انتخاب محصول" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 1, name: "محصولات" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: "انتخاب محصول" })).toBeInTheDocument();
    expect(screen.getByText("فهرست محصولات").tagName).toBe("P");
    expect(container.querySelector('img[src="/media/product.webp"]')).toHaveAttribute("alt", "");
    expect(await axe(container)).toHaveNoViolations();
  });

  it("renders keyboard-operable pagination only when needed", () => {
    const { rerender } = renderContent(<Pagination basePath="/products" pageInfo={{ page: 2, pageSize: 12, total: 30, totalPages: 3 }} />);
    expect(screen.getByRole("link", { name: "صفحه قبل" })).toHaveAttribute("href", "/products?page=1");
    expect(screen.getByRole("link", { name: "صفحه بعد" })).toHaveAttribute("href", "/products?page=3");
    rerender(<Pagination basePath="/products" pageInfo={{ page: 1, pageSize: 12, total: 1, totalPages: 1 }} />);
    expect(screen.queryByRole("navigation", { name: "صفحه‌بندی" })).not.toBeInTheDocument();
    rerender(<Pagination basePath="/products" pageInfo={{ page: 1, pageSize: 12, total: 30, totalPages: 3 }} />);
    expect(screen.queryByRole("link", { name: "صفحه قبل" })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "صفحه بعد" })).toBeInTheDocument();
    rerender(<Pagination basePath="/products" pageInfo={{ page: 3, pageSize: 12, total: 30, totalPages: 3 }} />);
    expect(screen.getByRole("link", { name: "صفحه قبل" })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "صفحه بعد" })).not.toBeInTheDocument();
  });

  it("moves keyboard focus card by card through the title and detail links, skipping the media shortcut", async () => {
    const user = userEvent.setup();
    const image = { url: "/media/product.webp", alt: "تصویر نمونه", width: 800, height: 600 };
    const titles = ["کارت اول", "کارت دوم", "کارت سوم"];
    renderContent(<ContentGrid>{titles.map((title, index) => <ContentCard key={title} title={title} href={`/products/item-${index + 1}`} image={image} />)}</ContentGrid>);
    const visited: string[] = [];
    for (let step = 0; step < titles.length * 2; step += 1) {
      await user.tab();
      visited.push(`${document.activeElement?.textContent?.trim()} ${document.activeElement?.getAttribute("href")}`);
    }
    // DOM order is the reading order: in RTL the first card sits at the inline start (right).
    expect(visited).toEqual(titles.flatMap((title, index) => [`${title} /products/item-${index + 1}`, `مشاهده جزئیات ← /products/item-${index + 1}`]));
  });

  it("orders pagination as previous, readout and next so the previous page leads at the inline start", async () => {
    const user = userEvent.setup();
    renderContent(<Pagination basePath="/articles" pageInfo={{ page: 2, pageSize: 12, total: 30, totalPages: 3 }} />);
    const navigation = screen.getByRole("navigation", { name: "صفحه‌بندی" });
    const previous = within(navigation).getByRole("link", { name: "صفحه قبل" });
    const next = within(navigation).getByRole("link", { name: "صفحه بعد" });
    const readout = within(navigation).getByText("صفحه ۲ از ۳");
    expect(previous.compareDocumentPosition(readout) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(readout.compareDocumentPosition(next) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    await user.tab();
    expect(previous).toHaveFocus();
    await user.tab();
    expect(next).toHaveFocus();
  });

  it("keeps pagination crawlable with stable page URLs, link relations and a Persian readout", async () => {
    const { container } = renderContent(<Pagination basePath="/articles/category/tech-production" pageInfo={{ page: 2, pageSize: 12, total: 30, totalPages: 3 }} />);
    const navigation = screen.getByRole("navigation", { name: "صفحه‌بندی" });
    expect(within(navigation).getByRole("link", { name: "صفحه قبل" })).toHaveAttribute("rel", "prev");
    expect(within(navigation).getByRole("link", { name: "صفحه بعد" })).toHaveAttribute("rel", "next");
    expect(within(navigation).getByRole("link", { name: "صفحه بعد" })).toHaveAttribute("href", "/articles/category/tech-production?page=3");
    expect(navigation).toHaveTextContent("صفحه ۲ از ۳");
    expect(within(navigation).queryByRole("button")).not.toBeInTheDocument();
    expect(await axe(container)).toHaveNoViolations();
  });

  it("preserves paragraphs as text without creating an HTML boundary", () => {
    const { container, rerender } = renderContent(<PreservedText body={'بند اول\n\n<script>alert("x")</script>'} />);
    expect(container.querySelector("script")).toBeNull();
    expect(screen.getByText(/<script>/)).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: "توضیحات" })).toBeInTheDocument();
    expect(container.querySelectorAll("p")).toHaveLength(2);
    rerender(<PreservedText title="" body="بند بدون عنوان" />);
    expect(screen.queryByRole("heading")).not.toBeInTheDocument();
    rerender(<PreservedText body="   " />);
    expect(container).toBeEmptyDOMElement();
  });

  it("renders a semantic campaign image inside a real destination link", async () => {
    const { container } = renderContent(
      <CampaignBanner
        src="/branding/banners/products.png"
        alt="معرفی محصولات ترنج پلاستیک"
        href="#catalog"
        actionLabel="مشاهده فهرست محصولات"
        priority
      />,
    );
    expect(screen.getByRole("link", { name: "مشاهده فهرست محصولات" })).toHaveAttribute("href", "#catalog");
    expect(screen.getByRole("img", { name: "معرفی محصولات ترنج پلاستیک" })).toHaveAttribute("src", expect.stringContaining("products.png"));
    expect(await axe(container)).toHaveNoViolations();
  });

  it("composes catalog meaning and actions outside campaign artwork", async () => {
    const { container, rerender } = renderContent(
      <CatalogLandingHero
        eyebrow="محصولات ترنج"
        title="محصولات را دقیق‌تر ببینید."
        description="فهرست محصولات منتشرشده"
        imageSrc="/branding/banners/products.png"
        mobileImageSrc="/media/product.webp"
        imageAlt="محصولات ترنج پلاستیک"
        actions={<Link href="#catalog">مشاهده محصولات</Link>}
      />,
    );
    expect(screen.getByRole("heading", { name: "محصولات را دقیق‌تر ببینید." })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "مشاهده محصولات" })).toHaveAttribute("href", "#catalog");
    expect(screen.getByRole("img", { name: "محصولات ترنج پلاستیک" })).toBeInTheDocument();
    expect(container.querySelector("source")).toHaveAttribute("srcset", "/media/product.webp");
    rerender(<CatalogLandingHero eyebrow="محصولات ترنج" title="محصولات" description="فهرست" imageSrc="/branding/banners/products.png" imageAlt="محصولات ترنج" actions={<Link href="#catalog">مشاهده</Link>} />);
    expect(container.querySelector("source")).not.toBeInTheDocument();
    expect(await axe(container)).toHaveNoViolations();
  });

  it("keeps the landing hero a section labelled by its level-one title with the approved artwork contract", () => {
    const { container } = renderContent(
      <CatalogLandingHero eyebrow="محصولات ترنج" title="محصولات را دقیق‌تر ببینید." description="فهرست محصولات منتشرشده" imageSrc="/branding/banners/products.png" imageAlt="محصولات ترنج پلاستیک" imagePosition="center bottom" actions={<Link href="#catalog">مشاهده محصولات</Link>} />,
    );
    const hero = container.querySelector('section[aria-labelledby="catalog-landing-title"]');
    expect(hero).toBeInTheDocument();
    expect(screen.getByRole("region", { name: "محصولات را دقیق‌تر ببینید." })).toBe(hero);
    expect(screen.getByRole("heading", { level: 1, name: "محصولات را دقیق‌تر ببینید." })).toHaveAttribute("id", "catalog-landing-title");
    const img = screen.getByRole("img", { name: "محصولات ترنج پلاستیک" });
    expect(img).toHaveAttribute("width", "1122");
    expect(img).toHaveAttribute("height", "1402");
    expect(img).toHaveAttribute("fetchpriority", "high");
    expect(img).toHaveStyle({ objectPosition: "center bottom" });
    // The artwork panel is an always-dark brand surface; its Latin label stays an isolated LTR run.
    expect(img.closest("[data-toranj-surface='inverse']")).not.toBeNull();
    const stamp = screen.getByText("TORANJ / PRODUCT CATALOG");
    expect(stamp).toHaveAttribute("dir", "ltr");
    // The English stamp is decorative: screen readers never read it with the Persian voice.
    expect(stamp.closest('[aria-hidden="true"]')).not.toBeNull();
  });

  it("keeps product detail identity and inquiry guidance semantic", async () => {
    const { container } = renderContent(<DetailHero eyebrow="محصول" title="سبد صنعتی" summary="خلاصه منتشرشده" image={null} imagePlaceholder="تصویر محصول ثبت نشده است" action={<Link href="/inquiry/product">ثبت استعلام محصول</Link>} note="قیمت و موجودی تأیید نشده است." />);
    expect(screen.getByRole("heading", { name: "سبد صنعتی" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 1, name: "سبد صنعتی" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "ثبت استعلام محصول" })).toHaveAttribute("href", "/inquiry/product");
    expect(screen.getByText("تصویر محصول ثبت نشده است")).toBeInTheDocument();
    expect(container.querySelector('[data-media="placeholder"]')).toBeInTheDocument();
    expect(screen.getByText("قیمت و موجودی تأیید نشده است.")).toBeInTheDocument();
    expect(screen.getByText("خلاصه منتشرشده").tagName).toBe("P");
    expect(await axe(container)).toHaveNoViolations();
  });

  it("lets the copy fill the detail hero when there is no image and no named placeholder", async () => {
    const { container } = renderContent(<DetailHero eyebrow="درباره ما" title="درباره ما" summary="خلاصه منتشرشده" image={null} action={<Link href="/inquiry">ثبت استعلام مستقیم پروژه</Link>} note="یادداشت تأییدشده" />);
    expect(container.querySelector('[data-media="none"]')).toBeInTheDocument();
    expect(container.querySelector("img")).toBeNull();
    // No product-specific or empty media frame on non-product pages.
    expect(screen.queryByText("تصویر محصول ثبت نشده است")).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 1, name: "درباره ما" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "ثبت استعلام مستقیم پروژه" })).toHaveAttribute("href", "/inquiry");
    expect(screen.getByText("یادداشت تأییدشده")).toBeInTheDocument();
    expect(await axe(container)).toHaveNoViolations();
  });

  it("renders the complete detail, gallery, and specification variants", async () => {
    const image = { url: "/media/product.webp", alt: "نمای محصول", width: 800, height: 600 };
    const secondImage = { url: "/media/product-side.webp", alt: "نمای کناری محصول", width: 800, height: 600 };
    const { container, rerender } = renderContent(<>
      <DetailHero eyebrow="محصول" title="سبد صنعتی" summary="خلاصه محصول" image={image} meta={<ContentTag>منتخب</ContentTag>} action={<Link href="/inquiry/product">استعلام</Link>} note="اطلاعات تأییدشده" />
      <ImageGallery images={[image, secondImage]} />
      <Specifications items={[{ label: "کد", value: "TRJ-001" }, { label: "جنس", value: "پلی‌پروپیلن" }]} />
    </>);
    expect(screen.getByRole("img", { name: "نمای محصول" })).toBeInTheDocument();
    expect(container.querySelector('[data-media="image"]')).toBeInTheDocument();
    expect(screen.getByRole("region", { name: "تصاویر محتوا" })).toBeInTheDocument();
    expect(screen.getByText("TRJ-001")).toHaveAttribute("dir", "ltr");
    expect(screen.getByText("پلی‌پروپیلن")).not.toHaveAttribute("dir");
    expect(await axe(container)).toHaveNoViolations();

    rerender(<><ImageGallery images={[image]} /><Specifications items={[]} /></>);
    expect(screen.queryByRole("region", { name: "تصاویر محتوا" })).not.toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "مشخصات تأییدشده" })).not.toBeInTheDocument();
  });

  it("keeps detail media attributes, the gallery's remaining images and paired specification terms", () => {
    const image = { url: "/media/product.webp", alt: "نمای محصول", width: 800, height: 600 };
    const secondImage = { url: "/media/product-side.webp", alt: "نمای کناری محصول", width: 640, height: 480 };
    renderContent(<>
      <DetailHero eyebrow="محصول" title="سبد صنعتی" image={image} />
      <ImageGallery images={[image, secondImage]} />
      <Specifications items={[{ label: "کد", value: "TRJ-001" }, { label: "جنس", value: "پلی‌پروپیلن" }]} />
    </>);
    expect(screen.getByRole("img", { name: "نمای محصول" })).toHaveAttribute("fetchpriority", "high");
    const gallery = screen.getByRole("region", { name: "تصاویر محتوا" });
    const galleryImages = within(gallery).getAllByRole("img");
    expect(galleryImages).toHaveLength(1);
    expect(galleryImages[0]).toHaveAttribute("alt", "نمای کناری محصول");
    expect(galleryImages[0]).toHaveAttribute("width", "640");
    expect(galleryImages[0]).toHaveAttribute("loading", "lazy");
    expect(screen.getByRole("heading", { level: 2, name: "مشخصات تأییدشده" })).toBeInTheDocument();
    expect(screen.getAllByRole("term").map((term) => term.textContent)).toEqual(["کد", "جنس"]);
    expect(screen.getAllByRole("definition").map((definition) => definition.textContent)).toEqual(["TRJ-001", "پلی‌پروپیلن"]);
  });

  it("draws the specifications as a framed spec sheet with monospaced LTR values", () => {
    const { container } = renderContent(<Specifications items={[{ label: "ظرفیت تناژ دستگاه‌ها", value: "80T - 450T" }, { label: "حداکثر وزن تزریق (شات)", value: "1500 g" }, { label: "جنس", value: "پلی‌پروپیلن" }]} />);
    const section = container.querySelector("section") as HTMLElement;
    expect(within(section).getByRole("heading", { level: 2, name: "مشخصات تأییدشده" })).toBeInTheDocument();
    expect(section.querySelector("dl")).not.toBeNull();
    expect(within(section).getAllByRole("term")).toHaveLength(3);
    // LTR values keep their isolated run and take the code face; Persian values stay in the body face.
    const ltrValue = screen.getByText("80T - 450T");
    expect(ltrValue).toHaveAttribute("dir", "ltr");
    expect(ltrValue.classList.length).toBeGreaterThan(1);
    expect(screen.getByText("پلی‌پروپیلن")).not.toHaveAttribute("dir");

    // The sheet is drawn on MetadataList's own <dl>/<dt>/<dd> elements, never on Astryx internals.
    const stylesheet = readFileSync(join(process.cwd(), "src", "components", "content", "Content.module.css"), "utf8");
    expect(stylesheet).toMatch(/\.specifications\s*\{[^}]*border:[^}]*\}/);
    expect(stylesheet).toMatch(/\.specificationsTitle\s*\{[^}]*background-color:[^}]*\}/);
    expect(stylesheet).toMatch(/\.specSheet dt,\s*\.specSheet dd\s*\{[^}]*border-block-end:[^}]*\}/);
    expect(stylesheet).toMatch(/\.specSheet dd:nth-of-type\(even\)/);
    expect(stylesheet).toMatch(/\.specValue\s*\{[^}]*--font-family-code/);
    expect(stylesheet).not.toMatch(/astryx-metadata-list|\.x[0-9a-z]{5,}\b/);
  });

  it("lays three or more cards out in the balanced steps and marks the set for browser tests", () => {
    const { container } = renderContent(
      <BalancedGrid>
        <span>یک</span>
        <span>دو</span>
        <span>سه</span>
      </BalancedGrid>,
    );
    const grid = container.querySelector('[data-layout="balanced"]') as HTMLElement;
    expect(grid).toBeInTheDocument();
    expect(grid).toHaveClass("astryx-grid");
    expect(Array.from(grid.children).map((child) => child.textContent)).toEqual(["یک", "دو", "سه"]);
    const stylesheet = readFileSync(join(process.cwd(), "src", "components", "content", "Content.module.css"), "utf8");
    // Two columns from 40rem with the odd last item spanning the row, one column at or below 40rem.
    expect(stylesheet).toMatch(/@media \(max-width: 64rem\)\s*\{\s*\.balancedGrid\s*\{\s*grid-template-columns: repeat\(2, minmax\(0, 1fr\)\);/);
    expect(stylesheet).toMatch(/\.balancedGrid > :last-child:nth-child\(odd\)\s*\{\s*grid-column: 1 \/ -1;/);
    expect(stylesheet).toMatch(/@media \(max-width: 40rem\)\s*\{\s*\.balancedGrid\s*\{\s*grid-template-columns: minmax\(0, 1fr\);/);
  });

  it("renders a region heading one step below the page title", () => {
    renderContent(<SectionTitle id="latest-title">آخرین مقالات</SectionTitle>);
    expect(screen.getByRole("heading", { level: 2, name: "آخرین مقالات" })).toHaveAttribute("id", "latest-title");
  });

  it("keeps long CMS tag values whole instead of cutting them", () => {
    const longValue = "تأمین‌کننده ثبت‌شده با نام بسیار طولانی برای بررسی شکستن سطر در برچسب";
    renderContent(<ContentTag>{longValue}</ContentTag>);
    expect(screen.getByText(longValue)).toBeInTheDocument();
    const stylesheet = readFileSync(join(process.cwd(), "src", "components", "content", "Content.module.css"), "utf8");
    // The Badge's single-line ellipsis gives way to wrapping.
    expect(stylesheet).toMatch(/\.tag\s*\{[^}]*white-space: normal;[^}]*\}/);
  });

  it("dates articles with supporting text and links the category only when asked", async () => {
    const category = { name: "فنی و مهندسی", slug: "engineering" };
    const { container, rerender } = renderContent(<ArticleMeta category={category} publishedAt="2026-10-27T10:00:00.000Z" categoryLink />);
    const link = screen.getByRole("link", { name: "فنی و مهندسی" });
    expect(link).toHaveAttribute("href", "/articles/category/engineering");
    const time = container.querySelector("time");
    expect(time).toHaveAttribute("datetime", "2026-10-27T10:00:00.000Z");
    expect(time?.textContent).toBe(formatArticleDate("2026-10-27T10:00:00.000Z"));
    // The date is plain supporting text, not a badge, and not inside the link.
    expect(time?.closest(".astryx-badge")).toBeNull();
    expect(link.contains(time)).toBe(false);
    expect(await axe(container)).toHaveNoViolations();

    rerender(<ArticleMeta category={category} publishedAt="not-a-date" />);
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
    expect(screen.getByText("فنی و مهندسی").closest(".astryx-badge")).not.toBeNull();
    expect(container.querySelector("time")).toBeNull();
    expect(formatArticleDate("not-a-date")).toBeNull();
  });

  it("renders accessible B2B detail inquiry reassurance card", async () => {
    const { container } = renderContent(
      <DetailInquiryCard
        actionHref="/inquiry/product?slug=industrial-basket"
        actionLabel="استعلام این محصول"
      />,
    );
    expect(screen.getByRole("heading", { name: "سفارش مستقیم و تیراژ تولید این محصول" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "استعلام این محصول" })).toHaveAttribute("href", "/inquiry/product?slug=industrial-basket");
    expect(screen.getByText("ثبت استعلام به معنی تأیید قیمت یا موجودی نیست")).toBeInTheDocument();
    // No unsourced capacity, lead-time, certificate or delivery promise (OD-4).
    expect(container.textContent).not.toMatch(/ساعت|CoA|MFI|تحویل مستقیم|برنامه تحویل/);
    expect(await axe(container)).toHaveNoViolations();
  });

  it("labels the inquiry region by its title and lists each reassurance point once", () => {
    renderContent(<DetailInquiryCard eyebrow="تأمین رسمی پلیمر" title="نیاز به تأمین این گرید دارید؟" description="شرح تأییدشده" actionHref="/inquiry/material?slug=pp" actionLabel="ثبت استعلام مستقیم این ماده" trustPoints={["ارائه برگه فنی", "صدور پیش‌فاکتور رسمی"]} />);
    const region = screen.getByRole("region", { name: "نیاز به تأمین این گرید دارید؟" });
    expect(within(region).getByRole("heading", { level: 2, name: "نیاز به تأمین این گرید دارید؟" })).toHaveAttribute("id", "inquiry-fast-track-title");
    const items = within(within(region).getByRole("list")).getAllByRole("listitem");
    expect(items.map((item) => item.textContent)).toEqual(["ارائه برگه فنی", "صدور پیش‌فاکتور رسمی"]);
    expect(within(region).getByRole("link", { name: "ثبت استعلام مستقیم این ماده" })).toHaveAttribute("href", "/inquiry/material?slug=pp");
  });

  it("keeps every route-level style hook that the page files compose", () => {
    const stylesheet = readFileSync(join(process.cwd(), "src", "components", "content", "Content.module.css"), "utf8");
    const routeHooks = ["main", "section", "managed", "catalogSection", "detailContent"] as const;
    // Route frames only: actions use the shared Button adapter, and about/contact own their composition.
    expect(Object.keys(contentStyles)).toEqual([...routeHooks]);
    for (const key of routeHooks) {
      expect(contentStyles[key], key).toEqual(expect.any(String));
      expect(contentStyles[key].length, key).toBeGreaterThan(0);
      expect(stylesheet, key).toMatch(new RegExp(`\\.${key}\\b[^{]*\\{`));
    }
    for (const retired of ["primaryLink", "secondaryLink", "institutionalSection", "institutionalGrid", "institutionalCard", "contactChannelValue", "contactMetaGrid", "contactMetaCard"]) {
      expect(stylesheet, retired).not.toMatch(new RegExp(`\\.${retired}\\b`));
    }
    // Colours come from Toranj tokens or mapped Astryx roles only.
    expect(stylesheet).not.toMatch(/#[0-9a-f]{3,8}\b|\brgba?\(|\bhsla?\(/i);
  });
});
