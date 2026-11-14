import type { Metadata } from "next";
import { VStack } from "@astryxdesign/core/VStack";
import { notFound } from "next/navigation";
import { Breadcrumb } from "@/components/navigation";
import { ContentTag, DetailHero, DetailInquiryCard, ImageGallery, PreservedText, Specifications, contentStyles } from "@/components/content";
import { Button } from "@/components/ui";
import { getMaterial, isNotFoundError } from "@/lib/public-content";
import { publicContentMetadata } from "@/lib/content-metadata";

type Props = { params: Promise<{ slug: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> { try { const item = await getMaterial((await params).slug); return publicContentMetadata({ title: item.name, path: `/materials/${item.slug}`, summary: item.summary, metaTitle: item.metaTitle, metaDescription: item.metaDescription, images: item.images }); } catch (error) { if (isNotFoundError(error)) return { title: "ماده پیدا نشد", robots: { index: false, follow: false } }; throw error; } }

/*
 * Material detail (OpenSpec change rebuild-ui-with-astryx, task 5.3).
 * The record is an Astryx VStack rendered as <article>; grades stay LTR inside
 * the tags. Only the hero action follows the API's `inquiryAvailable` flag (the
 * editor's "inquiry enabled for this material" setting). The material inquiry
 * card is always shown, as before the migration and as public-visual-experience
 * requires on every catalog item detail page (owner decision OD-1, option B).
 */
export default async function MaterialDetailPage({ params }: Props) {
  let item; try { item = await getMaterial((await params).slug); } catch (error) { if (isNotFoundError(error)) notFound(); throw error; }
  const inquiryHref = `/inquiry/material?slug=${encodeURIComponent(item.slug)}`;
  return (
    <main className={contentStyles.main}>
      <Breadcrumb items={[{ label: "خانه", href: "/" }, { label: "مواد اولیه", href: "/materials" }, { label: item.name }]} />
      <VStack as="article" gap={0} className={`${contentStyles.section} content-container`}>
        <DetailHero
          eyebrow="ماده اولیه"
          title={item.name}
          summary={item.summary}
          image={item.images[0]}
          meta={item.family || item.grade || item.manufacturer ? <>
            {item.family ? <ContentTag>{item.family}</ContentTag> : null}
            {item.grade ? <ContentTag ltr>{item.grade}</ContentTag> : null}
            {item.manufacturer ? <ContentTag>{item.manufacturer}</ContentTag> : null}
          </> : undefined}
          action={item.inquiryAvailable ? <Button href={inquiryHref} variant="primary">ثبت استعلام ماده</Button> : undefined}
        />
        <VStack gap={0} className={contentStyles.detailContent}>
          <PreservedText body={item.description} />
          <Specifications items={item.specifications} />
          <ImageGallery images={item.images} />
          <DetailInquiryCard
            eyebrow="استعلام ماده اولیه"
            title="نیاز به تأمین تناژ یا فرمولاسیون این گرید دارید؟"
            description="گرید، تناژ و مشخصات موردنیاز را ثبت کنید تا درخواست شما بررسی شود و در صورت نیاز برای تکمیل اطلاعات با شما هماهنگ شود."
            actionHref={inquiryHref}
            actionLabel="ثبت استعلام مستقیم این ماده"
            trustPoints={["ثبت درخواست همراه با گرید و تناژ موردنیاز", "پیگیری وضعیت درخواست از حساب کاربری", "ثبت استعلام به معنی تأیید قیمت یا موجودی نیست"]}
          />
        </VStack>
      </VStack>
    </main>
  );
}
