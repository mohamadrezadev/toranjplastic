import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumb } from "@/components/navigation";
import { EmptyState } from "@/components/feedback";
import { ContentCard, ContentGrid, ContentPageHeading, ContentTag, Pagination, contentStyles } from "@/components/content";
import { parsePageNumber } from "@/lib/public-content";
import { listStrapiArticles, getStrapiCategory, isStrapiNotFoundError, StrapiCategory } from "@/lib/strapi";
import { publicCollectionMetadata } from "@/lib/content-metadata";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string | string[] }>;
};

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("fa-IR", { dateStyle: "long", timeZone: "UTC" }).format(new Date(value));

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

  let result;
  try {
    result = await listStrapiArticles({ page, categorySlug: category.slug });
  } catch {
    result = { items: [], pageInfo: { page: 1, pageSize: 12, total: 0, totalPages: 0 } };
  }

  return (
    <main className={contentStyles.main}>
      <Breadcrumb
        items={[
          { label: "خانه", href: "/" },
          { label: "مقالات", href: "/articles" },
          { label: category.name },
        ]}
      />
      <section className={`${contentStyles.section} content-container`}>
        <ContentPageHeading
          eyebrow="دسته‌بندی مقالات"
          title={category.name}
          description={category.description || `مجموعه مقالات و مطالب آموزشی منتشرشده در دسته‌بندی ${category.name}.`}
        />

        <div style={{ marginBlockStart: "1.5rem" }}>
          <Link
            href="/articles"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.35rem",
              fontSize: "0.875rem",
              color: "var(--color-brand-action)",
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            ← مشاهده همه دسته‌بندی‌ها و مقالات
          </Link>
        </div>

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
                  meta={
                    <>
                      <ContentTag>{category.name}</ContentTag>
                      <ContentTag>{formatDate(item.publishedAt)}</ContentTag>
                    </>
                  }
                />
              ))}
            </ContentGrid>
            <Pagination pageInfo={result.pageInfo} basePath={`/articles/category/${category.slug}`} />
          </>
        ) : (
          <div className={contentStyles.section}>
            <EmptyState
              title={`مقاله‌ای در دسته‌بندی «${category.name}» منتشر نشده است`}
              description="مقاله‌های جدید پس از انتشار رسمی در این بخش قرار می‌گیرند."
            />
          </div>
        )}
      </section>
    </main>
  );
}
