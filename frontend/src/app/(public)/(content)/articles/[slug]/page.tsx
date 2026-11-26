import type { Metadata } from "next";
import { Divider } from "@astryxdesign/core/Divider";
import { Heading } from "@astryxdesign/core/Heading";
import { HStack } from "@astryxdesign/core/HStack";
import { Text } from "@astryxdesign/core/Text";
import { VStack } from "@astryxdesign/core/VStack";
import { notFound } from "next/navigation";
import { Breadcrumb } from "@/components/navigation";
import { ArticleMeta, ContentCard, ContentGrid, ContentTag, DetailHero, PreservedText, contentStyles } from "@/components/content";
import { getStrapiArticle, getRelatedStrapiArticles, isStrapiNotFoundError, StrapiArticle } from "@/lib/strapi";
import { publicContentMetadata } from "@/lib/content-metadata";
import { serializeJsonLd } from "@/lib/jsonld";
import { absoluteUrl, siteName } from "@/lib/site";
import styles from "../articles.module.css";

type Props = { params: Promise<{ slug: string }> };

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

/*
 * Article detail (OpenSpec change rebuild-ui-with-astryx, task 5.3). The
 * record is an Astryx VStack rendered as <article> (the shared frame
 * convention). The tags keep an explicit list role, and related cards take
 * level-three titles under their region's level-two heading.
 *
 * Each tag is the shared wrapping ContentTag (an Astryx Badge), not an Astryx
 * Token: a Token takes a string label and cuts a long one with an ellipsis, so
 * a tag wider than the screen lost its end (and, being a min-width:auto flex
 * item, widened the page). The tag text sits in a <bdi>, so the "#" stays on
 * the same side as the first letter of a Latin tag instead of landing after it.
 */
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
      <VStack as="article" gap={0} className={`${contentStyles.section} content-container ${contentStyles.managed}`}>
        <DetailHero
          eyebrow={item.category?.name || "مقاله دانشنامه"}
          title={item.title}
          summary={item.summary}
          image={item.featuredImage}
          meta={<ArticleMeta category={item.category} publishedAt={item.publishedAt} categoryLink />}
        />

        <PreservedText title="متن مقاله" body={item.body} />

        {item.tags.length > 0 ? (
          <HStack gap={2} wrap="wrap" vAlign="center" className={styles.tags}>
            <Text id="article-tags-label" size="sm" weight="bold" color="secondary">برچسب‌ها:</Text>
            {/* An explicit list role: Safari/VoiceOver drops implicit list semantics from a list without markers. */}
            <HStack as="ul" role="list" gap={2} wrap="wrap" aria-labelledby="article-tags-label" className={styles.tagList}>
              {item.tags.map((tag) => (
                <li key={tag.id}>
                  <ContentTag><bdi>#{tag.name}</bdi></ContentTag>
                </li>
              ))}
            </HStack>
          </HStack>
        ) : null}

        {relatedArticles.length > 0 ? (
          <section className={styles.related} aria-labelledby="related-articles-title">
            <Divider />
            <Heading level={2} id="related-articles-title" color="inherit" className={styles.relatedTitle}>
              مقاله‌های مرتبط
            </Heading>
            <ContentGrid>
              {relatedArticles.map((rel) => (
                <ContentCard
                  key={rel.id}
                  title={rel.title}
                  summary={rel.summary}
                  href={`/articles/${rel.slug}`}
                  image={rel.featuredImage}
                  titleLevel={3}
                  meta={<ArticleMeta category={rel.category} publishedAt={rel.publishedAt} />}
                />
              ))}
            </ContentGrid>
          </section>
        ) : null}
      </VStack>
    </main>
  );
}
