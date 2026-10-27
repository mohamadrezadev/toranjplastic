import Link from "next/link";
import { Breadcrumb } from "@/components/navigation";
import { EmptyState } from "@/components/feedback";
import { ContentCard, ContentGrid, ContentPageHeading, ContentTag, Pagination, contentStyles } from "@/components/content";
import { parsePageNumber } from "@/lib/public-content";
import { listStrapiArticles, listStrapiCategories } from "@/lib/strapi";
import { publicCollectionMetadata } from "@/lib/content-metadata";

const description = "مقاله‌ها و یادداشت‌های تخصصی و آموزشی ترنج پلاستیک در صنعت قالب‌گیری و تزریق پلاستیک.";
export const metadata = publicCollectionMetadata("مقالات", description, "/articles");

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("fa-IR", { dateStyle: "long", timeZone: "UTC" }).format(new Date(value));

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
      <section className={`${contentStyles.section} content-container`}>
        <ContentPageHeading eyebrow="دانشنامه" title="مقالات تخصصی" description={description} />

        {categories.length > 0 ? (
          <nav aria-label="دسته‌بندی مقالات" style={{ marginBlockStart: "1.5rem", display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
            <span style={{ display: "inline-flex", alignItems: "center", padding: "0.4rem 0.85rem", borderRadius: "9999px", background: "var(--color-brand-primary)", color: "#fff", fontSize: "0.875rem", fontWeight: 600 }}>
              همه مقالات
            </span>
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/articles/category/${cat.slug}`}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  padding: "0.4rem 0.85rem",
                  borderRadius: "9999px",
                  background: "var(--color-surface-card)",
                  border: "1px solid var(--color-border-default)",
                  color: "var(--color-text-secondary)",
                  fontSize: "0.875rem",
                  textDecoration: "none",
                }}
              >
                {cat.name}
              </Link>
            ))}
          </nav>
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
              ))}
            </ContentGrid>
            <Pagination pageInfo={result.pageInfo} basePath="/articles" />
          </>
        ) : (
          <div className={contentStyles.section}>
            <EmptyState
              title="مقاله منتشرشده‌ای وجود ندارد"
              description="مقاله‌ها پس از بازبینی و انتشار رسمی در سامانه مدیریت محتوا در این بخش قرار می‌گیرند."
            />
          </div>
        )}
      </section>
    </main>
  );
}
