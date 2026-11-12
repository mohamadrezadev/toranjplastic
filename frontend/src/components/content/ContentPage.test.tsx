import { InternationalizationProvider } from "@astryxdesign/core/i18n";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import Link from "next/link";
import { render, screen, within } from "@testing-library/react";
import { axe } from "jest-axe";
import type { ReactNode } from "react";
import { describe, expect, it } from "vitest";
import { astryxPersianOverrides } from "@/design-system/astryx-i18n";
import { CampaignBanner } from "./CampaignBanner";
import { CatalogLandingHero, CatalogSectionHeading, ContentCard, ContentGrid, ContentPageHeading, ContentTag, DetailHero, DetailInquiryCard, ImageGallery, Pagination, PreservedText, Specifications, contentStyles } from "./ContentPage";

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
    expect(screen.getByText("TORANJ / PRODUCT CATALOG")).toHaveAttribute("dir", "ltr");
  });

  it("keeps product detail identity and inquiry guidance semantic", async () => {
    const { container } = renderContent(<DetailHero eyebrow="محصول" title="سبد صنعتی" summary="خلاصه منتشرشده" image={null} action={<Link href="/inquiry/product">ثبت استعلام محصول</Link>} note="قیمت و موجودی تأیید نشده است." />);
    expect(screen.getByRole("heading", { name: "سبد صنعتی" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 1, name: "سبد صنعتی" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "ثبت استعلام محصول" })).toHaveAttribute("href", "/inquiry/product");
    expect(screen.getByText("تصویر محصول ثبت نشده است")).toBeInTheDocument();
    expect(screen.getByText("قیمت و موجودی تأیید نشده است.")).toBeInTheDocument();
    expect(screen.getByText("خلاصه منتشرشده").tagName).toBe("P");
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

  it("renders accessible B2B detail inquiry reassurance card", async () => {
    const { container } = renderContent(
      <DetailInquiryCard
        actionHref="/inquiry/product?slug=industrial-basket"
        actionLabel="استعلام این محصول"
      />,
    );
    expect(screen.getByRole("heading", { name: "سفارش مستقیم و تیراژ تولید این محصول" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "استعلام این محصول" })).toHaveAttribute("href", "/inquiry/product?slug=industrial-basket");
    expect(screen.getByText("صدور پیش‌فاکتور رسمی ظرف ۲۴ الی ۴۸ ساعت کاری")).toBeInTheDocument();
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
    for (const key of ["main", "section", "managed", "primaryLink", "secondaryLink", "catalogSection", "detailContent", "institutionalSection", "institutionalGrid", "institutionalCard", "contactChannelValue", "contactMetaGrid", "contactMetaCard"] as const) {
      expect(contentStyles[key], key).toEqual(expect.any(String));
      expect(contentStyles[key].length, key).toBeGreaterThan(0);
      expect(stylesheet, key).toMatch(new RegExp(`\\.${key}\\b[^{]*\\{`));
    }
    // Colours come from Toranj tokens or mapped Astryx roles only.
    expect(stylesheet).not.toMatch(/#[0-9a-f]{3,8}\b|\brgba?\(|\bhsla?\(/i);
  });
});
