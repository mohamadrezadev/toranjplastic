import Link from "next/link";
import { render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { describe, expect, it } from "vitest";
import { CampaignBanner } from "./CampaignBanner";
import { CatalogLandingHero, CatalogSectionHeading, ContentCard, ContentGrid, ContentPageHeading, ContentTag, DetailHero, DetailInquiryCard, ImageGallery, Pagination, PreservedText, Specifications } from "./ContentPage";

describe("public content presentation", () => {
  it("renders approved optional data and a valid detail destination", async () => {
    const { container } = render(<ContentCard title="سبد صنعتی" summary="خلاصه تأییدشده" href="/products/industrial-basket" image={null} meta={<ContentTag ltr>PP-H012</ContentTag>} />);
    expect(screen.getByRole("link", { name: "مشاهده جزئیات" })).toHaveAttribute("href", "/products/industrial-basket");
    expect(screen.getByText("PP-H012")).toHaveAttribute("dir", "ltr");
    expect(screen.getByText("تصویر ثبت نشده")).toBeInTheDocument();
    expect(await axe(container)).toHaveNoViolations();
  });

  it("marks a sparse collection for the featured responsive layout", () => {
    const { container, rerender } = render(<ContentGrid featured><ContentCard title="سبد صنعتی" href="/products/industrial-basket" image={null} /></ContentGrid>);
    expect(container.querySelector('[data-layout="featured"]')).toBeInTheDocument();
    rerender(<ContentGrid><ContentCard title="سبد صنعتی" href="/products/industrial-basket" image={null} /></ContentGrid>);
    expect(container.querySelector('[data-layout="grid"]')).toBeInTheDocument();
  });

  it("renders collection headings and an image-backed card", async () => {
    const image = { url: "/media/product.webp", alt: "سبد صنعتی", width: 800, height: 600 };
    const { container } = render(<>
      <section aria-label="معرفی کاتالوگ"><ContentPageHeading eyebrow="کاتالوگ" title="محصولات" description="فهرست محصولات" /></section>
      <section aria-label="فهرست کاتالوگ"><CatalogSectionHeading eyebrow="منتشرشده" title="انتخاب محصول" description="جزئیات تأییدشده" /></section>
      <ContentCard title="سبد صنعتی" href="/products/industrial-basket" image={image} />
    </>);
    expect(screen.getByRole("heading", { name: "محصولات" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "انتخاب محصول" })).toBeInTheDocument();
    expect(container.querySelector('img[src="/media/product.webp"]')).toHaveAttribute("alt", "");
    expect(await axe(container)).toHaveNoViolations();
  });

  it("renders keyboard-operable pagination only when needed", () => {
    const { rerender } = render(<Pagination basePath="/products" pageInfo={{ page: 2, pageSize: 12, total: 30, totalPages: 3 }} />);
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

  it("preserves paragraphs as text without creating an HTML boundary", () => {
    const { container, rerender } = render(<PreservedText body={'بند اول\n\n<script>alert("x")</script>'} />);
    expect(container.querySelector("script")).toBeNull();
    expect(screen.getByText(/<script>/)).toBeInTheDocument();
    rerender(<PreservedText title="" body="بند بدون عنوان" />);
    expect(screen.queryByRole("heading")).not.toBeInTheDocument();
    rerender(<PreservedText body="   " />);
    expect(container).toBeEmptyDOMElement();
  });

  it("renders a semantic campaign image inside a real destination link", async () => {
    const { container } = render(
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
    const { container, rerender } = render(
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

  it("keeps product detail identity and inquiry guidance semantic", async () => {
    const { container } = render(<DetailHero eyebrow="محصول" title="سبد صنعتی" summary="خلاصه منتشرشده" image={null} action={<Link href="/inquiry/product">ثبت استعلام محصول</Link>} note="قیمت و موجودی تأیید نشده است." />);
    expect(screen.getByRole("heading", { name: "سبد صنعتی" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "ثبت استعلام محصول" })).toHaveAttribute("href", "/inquiry/product");
    expect(screen.getByText("تصویر محصول ثبت نشده است")).toBeInTheDocument();
    expect(await axe(container)).toHaveNoViolations();
  });

  it("renders the complete detail, gallery, and specification variants", async () => {
    const image = { url: "/media/product.webp", alt: "نمای محصول", width: 800, height: 600 };
    const secondImage = { url: "/media/product-side.webp", alt: "نمای کناری محصول", width: 800, height: 600 };
    const { container, rerender } = render(<>
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

  it("renders accessible B2B detail inquiry reassurance card", async () => {
    const { container } = render(
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
});
