import { Center } from "@astryxdesign/core/Center";
import { VStack } from "@astryxdesign/core/VStack";
import { Breadcrumb } from "@/components/navigation";
import { EmptyState } from "@/components/feedback";
import { ArticleMeta, ContentCard, ContentGrid, ContentPageHeading, Pagination, contentStyles } from "@/components/content";
import { parsePageNumber } from "@/lib/public-content";
import { listStrapiArticles, listStrapiCategories } from "@/lib/strapi";
import { publicCollectionMetadata } from "@/lib/content-metadata";
import { ArticleCategoryTabs } from "./ArticleCategoryTabs";
import styles from "./articles.module.css";

const description = "مقاله‌ها و یادداشت‌های تخصصی و آموزشی ترنج پلاستیک در صنعت قالب‌گیری و تزریق پلاستیک.";
export const metadata = publicCollectionMetadata("مقالات", description, "/articles");

/*
 * Article collection (OpenSpec change rebuild-ui-with-astryx, task 5.3).
 * The shared frame convention: an Astryx VStack page frame and a Center for
 * the honest empty state. The category strip marks this view ("/articles")
 * as current; each card links its category through the shared ArticleMeta.
 */
export default async function ArticlesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string | string[] }>;
}) {
  const page = parsePageNumber((await searchParams).page);

  let result;
  let categories: Awaited<ReturnType<typeof listStrapiCategories>> = [];

  try {
    [result, categories] = await Promise.all([
      listStrapiArticles({ page }),
      listStrapiCategories().catch(() => []),
    ]);
  } catch {
    result = { items: [], pageInfo: { page: 1, pageSize: 12, total: 0, totalPages: 0 } };
  }

  return (
    <main className={contentStyles.main}>
      <Breadcrumb items={[{ label: "خانه", href: "/" }, { label: "مقالات" }]} />
      <VStack as="section" gap={0} className={`${contentStyles.section} content-container`}>
        <ContentPageHeading eyebrow="دانشنامه" title="مقالات تخصصی" description={description} />

        {categories.length > 0 ? (
          <ArticleCategoryTabs className={styles.categoryNav} categories={categories.map(({ slug, name }) => ({ slug, name }))} />
        ) : null}

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
                  meta={<ArticleMeta category={item.category} publishedAt={item.publishedAt} categoryLink />}
                />
              ))}
            </ContentGrid>
            <Pagination pageInfo={result.pageInfo} basePath="/articles" />
          </>
        ) : (
          <Center className={contentStyles.section}>
            <EmptyState
              title="مقاله منتشرشده‌ای وجود ندارد"
              description="مقاله‌ها پس از بازبینی و انتشار رسمی در سامانه مدیریت محتوا در این بخش قرار می‌گیرند."
            />
          </Center>
        )}
      </VStack>
    </main>
  );
}
