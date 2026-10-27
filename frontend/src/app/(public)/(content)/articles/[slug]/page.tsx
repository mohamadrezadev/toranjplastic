import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumb } from "@/components/navigation";
import { ContentCard, ContentGrid, ContentTag, DetailHero, PreservedText, contentStyles } from "@/components/content";
import { getStrapiArticle, getRelatedStrapiArticles, isStrapiNotFoundError, StrapiArticle } from "@/lib/strapi";
import { publicContentMetadata } from "@/lib/content-metadata";
import { absoluteUrl, siteName } from "@/lib/site";
import { serializeJsonLd } from "@/lib/product-jsonld";

type Props = { params: Promise<{ slug: string }> };

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("fa-IR", { dateStyle: "long", timeZone: "UTC" }).format(new Date(value));

function articleJsonLd(article: StrapiArticle) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.summary || article.metaDescription || undefined,
    url: absoluteUrl(`/articles/${article.slug}`),
    datePublished: article.publishedAt,
    ...(article.featuredImage ? { image: [article.featuredImage.url] } : {}),
    author: {
      "@type": "Organization",
      name: siteName,
    },
    publisher: {
      "@type": "Organization",
      name: siteName,
      url: absoluteUrl("/"),
    },
  };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const item = await getStrapiArticle((await params).slug);
    const meta = publicContentMetadata({
      title: item.title,
      path: `/articles/${item.slug}`,
      summary: item.summary,
      metaTitle: item.metaTitle,
      metaDescription: item.metaDescription,
      images: item.featuredImage ? [item.featuredImage] : [],
    });

    if (item.canonicalUrl) {
      meta.alternates = {
        ...meta.alternates,
        canonical: item.canonicalUrl,
      };
    }

    return meta;
  } catch (error) {
    if (isStrapiNotFoundError(error)) {
      return { title: "مقاله پیدا نشد", robots: { index: false, follow: false } };
    }
    throw error;
  }
}

export default async function ArticleDetailPage({ params }: Props) {
  const { slug } = await params;

  let item: StrapiArticle;
  try {
    item = await getStrapiArticle(slug);
  } catch (error) {
    if (isStrapiNotFoundError(error)) {
      notFound();
    }
    throw error;
  }

  const relatedArticles = await getRelatedStrapiArticles(
    item.slug,
    item.category?.slug,
    item.tags,
    3,
  ).catch(() => []);

  const breadcrumbItems = [
    { label: "خانه", href: "/" },
    { label: "مقالات", href: "/articles" },
    ...(item.category ? [{ label: item.category.name, href: `/articles/category/${item.category.slug}` }] : []),
    { label: item.title },
  ];

  return (
    <main className={contentStyles.main}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(articleJsonLd(item)) }}
      />
      <Breadcrumb items={breadcrumbItems} />
      <article className={`${contentStyles.section} content-container ${contentStyles.managed}`}>
        <DetailHero
          eyebrow={item.category?.name || "مقاله دانشنامه"}
          title={item.title}
          summary={item.summary}
          image={item.featuredImage}
          meta={
            <>
              {item.category ? (
                <Link href={`/articles/category/${item.category.slug}`} style={{ textDecoration: "none" }}>
                  <ContentTag>{item.category.name}</ContentTag>
                </Link>
              ) : null}
              <ContentTag>{formatDate(item.publishedAt)}</ContentTag>
            </>
          }
        />

        <PreservedText title="متن مقاله" body={item.body} />

        {item.tags.length > 0 ? (
          <div style={{ marginBlockStart: "2.5rem", display: "flex", flexWrap: "wrap", gap: "0.5rem", alignItems: "center" }}>
            <span style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)", fontWeight: 600 }}>برچسب‌ها:</span>
            {item.tags.map((tag) => (
              <span
                key={tag.id}
                style={{
                  padding: "0.25rem 0.6rem",
                  background: "var(--color-surface-raised)",
                  border: "1px solid var(--color-border-default)",
                  borderRadius: "var(--radius-sm)",
                  fontSize: "0.8rem",
                  color: "var(--color-text-secondary)",
                }}
              >
                #{tag.name}
              </span>
            ))}
          </div>
        ) : null}

        {relatedArticles.length > 0 ? (
          <section
            style={{
              marginBlockStart: "clamp(3rem, 6vw, 5rem)",
              borderBlockStart: "1px solid var(--color-border-default)",
              paddingBlockStart: "2.5rem",
            }}
          >
            <h2
              style={{
                fontSize: "clamp(1.3rem, 2.5vw, 1.8rem)",
                fontWeight: 700,
                color: "var(--color-brand-primary)",
                marginBlockEnd: "1.5rem",
              }}
            >
              مقاله‌های مرتبط
            </h2>
            <ContentGrid>
              {relatedArticles.map((rel) => (
                <ContentCard
                  key={rel.id}
                  title={rel.title}
                  summary={rel.summary}
                  href={`/articles/${rel.slug}`}
                  image={rel.featuredImage}
                  meta={
                    <>
                      {rel.category ? <ContentTag>{rel.category.name}</ContentTag> : null}
                      <ContentTag>{formatDate(rel.publishedAt)}</ContentTag>
                    </>
                  }
                />
              ))}
            </ContentGrid>
          </section>
        ) : null}
      </article>
    </main>
  );
}
