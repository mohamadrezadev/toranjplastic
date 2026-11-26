import type { Metadata } from "next";
import { VStack } from "@astryxdesign/core/VStack";
import { notFound } from "next/navigation";
import { Breadcrumb } from "@/components/navigation";
import { DetailHero, DetailInquiryCard, ImageGallery, PreservedText, Specifications, contentStyles } from "@/components/content";
import { Button } from "@/components/ui";
import { getService, isNotFoundError } from "@/lib/public-content";
import { publicContentMetadata } from "@/lib/content-metadata";

type Props = { params: Promise<{ slug: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> { try { const item = await getService((await params).slug); return publicContentMetadata({ title: item.name, path: `/injection-molding/${item.slug}`, summary: item.summary, metaTitle: item.metaTitle, metaDescription: item.metaDescription, images: item.images }); } catch (error) { if (isNotFoundError(error)) return { title: "خدمت پیدا نشد", robots: { index: false, follow: false } }; throw error; } }
/*
 * An approved call to action is an internal path (OD-10, aligned with the
 * backend contract: assertSafeHref on write and safeInternalHref on read accept
 * only a value that starts with "/" and not with "//"). Anything else, an
 * external https address, a protocol-relative `//host`, `javascript:` or a
 * relative value, falls back to the review inquiry action. A backslash after
 * the first slash and a tab or line break are rejected too: the URL parser turns
 * `/\host` and `/<tab>/host` into the same off-site `//host`.
 */
function safeCta(href: string | null) { return href && /^\/(?![/\\])/.test(href) && !/[\t\n\r]/.test(href) ? href : null; }

/*
 * Injection-service detail (OpenSpec change rebuild-ui-with-astryx, task 5.3).
 * The record is an Astryx VStack rendered as <article>. The hero action is the
 * shared Astryx-backed Button: the approved CMS call to action when both its
 * label and a safe destination exist, otherwise the review inquiry route. The
 * label may come from the CMS, so it wraps (wrapLabel) instead of ending in an
 * ellipsis.
 */
export default async function ServiceDetailPage({ params }: Props) {
  let item; try { item = await getService((await params).slug); } catch (error) { if (isNotFoundError(error)) notFound(); throw error; }
  const ctaHref = safeCta(item.ctaHref);
  const inquiryHref = `/inquiry/injection?slug=${encodeURIComponent(item.slug)}`;
  return (
    <main className={contentStyles.main}>
      <Breadcrumb items={[{ label: "خانه", href: "/" }, { label: "تزریق پلاستیک", href: "/injection-molding" }, { label: item.name }]} />
      <VStack as="article" gap={0} className={`${contentStyles.section} content-container`}>
        <DetailHero
          eyebrow="خدمت تزریق"
          title={item.name}
          summary={item.summary}
          image={item.images[0]}
          action={ctaHref && item.ctaLabel
            ? <Button href={ctaHref} variant="primary" wrapLabel>{item.ctaLabel}</Button>
            : <Button href={inquiryHref} variant="primary" wrapLabel>ثبت درخواست بررسی</Button>}
        />
        <VStack gap={0} className={contentStyles.detailContent}>
          <PreservedText body={item.description} />
          <Specifications items={item.specifications} />
          <ImageGallery images={item.images} />
          <DetailInquiryCard
            eyebrow="استعلام تزریق کارمزدی (تولید با قالب شما)"
            title="نیاز به تولید قطعه با قالب اختصاصی خود دارید؟"
            description="ترنج پلاستیک در کهریزک آماده پذیرش قالب و تولید کارمزدی قطعات شما با متریال ارسالی یا متریال تأمینی است."
            actionHref={inquiryHref}
            actionLabel="ثبت استعلام تزریق با قالب مشتری"
            trustPoints={[
              "پذیرش قالب و انجام تزریق کارمزدی (اجرت تزریق)",
              "امکان تزریق با مواد ارسالی شما یا تأمین توسط ترنج",
              "ثبت درخواست همراه با مشخصات قالب و تیراژ موردنیاز",
              "صدور پیش‌فاکتور رسمی بر اساس تیراژ و سیکل تولید",
            ]}
          />
        </VStack>
      </VStack>
    </main>
  );
}
