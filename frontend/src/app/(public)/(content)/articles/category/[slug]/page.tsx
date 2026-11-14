import type { Metadata } from "next";
import { Center } from "@astryxdesign/core/Center";
import { HStack } from "@astryxdesign/core/HStack";
import { Link } from "@astryxdesign/core/Link";
import { VStack } from "@astryxdesign/core/VStack";
import { notFound } from "next/navigation";
import { Breadcrumb } from "@/components/navigation";
import { EmptyState } from "@/components/feedback";
import { ArticleMeta, ContentCard, ContentGrid, ContentPageHeading, Pagination, contentStyles } from "@/components/content";
import { parsePageNumber, type PageResult } from "@/lib/public-content";
import { listStrapiArticles, listStrapiCategories, getStrapiCategory, isStrapiNotFoundError, type StrapiArticle, type StrapiCategory } from "@/lib/strapi";
import { publicCollectionMetadata } from "@/lib/content-metadata";
import { ArticleCategoryTabs } from "../../ArticleCategoryTabs";
import styles from "../../articles.module.css";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string | string[] }>;
};

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  try {
    const category = await getStrapiCategory(slug);
    return publicCollectionMetadata(
      `مقالات دسته‌بندی ${category.name}`,
      category.description || `مجموعه مقالات و مطالب آموزشی در دسته‌بندی ${category.name} ترنج پلاستیک`,
      `/articles/category/${category.slug}`,
    );
  } catch (error) {
    if (isStrapiNotFoundError(error)) {
      return { title: "دسته‌بندی پیدا نشد", robots: { index: false, follow: false } };
    }
    throw error;
  }
}

const emptyResult: PageResult<StrapiArticle> = { items: [], pageInfo: { page: 1, pageSize: 12, total: 0, totalPages: 0 } };

/*
 * Article category collection (OpenSpec change rebuild-ui-with-astryx,
 * task 5.3). The shared frame convention: an Astryx VStack page frame and a
 * Center for the honest empty state. The category strip persists from the
 * article index and marks this category as the current view; the strip, like
 * the index, is omitted when the category list is unavailable.
 */
export default async function ArticleCategoryPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const page = parsePageNumber((await searchParams).page);

  let category: StrapiCategory;
  try {
    category = await getStrapiCategory(slug);
  } catch (error) {
    if (isStrapiNotFoundError(error)) {
      notFound();
    }
    throw error;
  }

  const [result, categories] = await Promise.all([
    listStrapiArticles({ page, categorySlug: category.slug }).catch(() => emptyResult),
    listStrapiCategories().catch(() => []),
  ]);
  const currentPath = `/articles/category/${category.slug}`;
  // The current category always has its tab, even if the list response omits it.
  const stripCategories = categories.some((entry) => entry.slug === category.slug) ? categories : [...categories, category];

  return (
    <main className={contentStyles.main}>
      <Breadcrumb
        items={[
          { label: "خانه", href: "/" },
          { label: "مقالات", href: "/articles" },
          { label: category.name },
        ]}
      />
      <VStack as="section" gap={0} className={`${contentStyles.section} content-container`}>
        <ContentPageHeading
          eyebrow="دسته‌بندی مقالات"
          title={category.name}
          description={category.description || `مجموعه مقالات و مطالب آموزشی منتشرشده در دسته‌بندی ${category.name}.`}
        />

        {categories.length > 0 ? (
          <ArticleCategoryTabs className={styles.categoryNav} value={currentPath} categories={stripCategories.map(({ slug: categorySlug, name }) => ({ slug: categorySlug, name }))} />
        ) : null}

        <HStack className={styles.backLink}>
          <Link href="/articles" size="sm" weight="bold" className={styles.targetLink}>
            <span aria-hidden="true">←</span> مشاهده همه دسته‌بندی‌ها و مقالات
          </Link>
        </HStack>

        {result.items.length ? (
          <>
            <ContentGrid>
              {result.items.map((item) => (
                <ContentCard
                  key={item.id}
                  title={item.title}
                  summary={item.summary}
                  href={`/articles/${item.slug}`}
                  image={item.featuredImage}
                  meta={<ArticleMeta category={category} publishedAt={item.publishedAt} />}
                />
              ))}
            </ContentGrid>
            <Pagination pageInfo={result.pageInfo} basePath={`/articles/category/${category.slug}`} />
          </>
        ) : (
          <Center className={contentStyles.section}>
            <EmptyState
              title={`مقاله‌ای در دسته‌بندی «${category.name}» منتشر نشده است`}
              description="مقاله‌های جدید پس از انتشار رسمی در این بخش قرار می‌گیرند."
            />
          </Center>
        )}
      </VStack>
    </main>
  );
}
