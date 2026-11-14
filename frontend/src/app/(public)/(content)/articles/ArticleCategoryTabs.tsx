"use client";

import { Tab, TabList } from "@astryxdesign/core/TabList";
import styles from "./articles.module.css";

export type ArticleCategoryLink = Readonly<{ slug: string; name: string }>;

const allArticlesPath = "/articles";

// Selecting a tab follows its link. The page it opens renders this strip
// again with its own path as `value`, which marks that view as current.
const followLink = () => {};

/**
 * Article category navigation: the Astryx TabList navigation pattern, which
 * renders a labelled nav landmark of links and marks the current view with
 * aria-current. The article index and every category page render the strip,
 * each passing its own path as `value`. Every view keeps a stable, crawlable
 * URL, the strip is a single Tab stop with arrow-key movement, and a strip
 * wider than the page scrolls inside itself instead of widening the page.
 *
 * A category name is CMS content and can be longer than the strip. Each tab
 * therefore takes a `className` (articles.module.css .categoryTab) that caps
 * its width below the strip's and lets the whole name wrap inside it: the
 * label is never shortened (it stays the link's accessible name and the
 * visible text), and the focus ring and the label are never cut by the strip.
 *
 * TabList needs an onChange callback, so this small client boundary keeps
 * the route pages Server Components that pass plain data only.
 */
export function ArticleCategoryTabs({ categories, value = allArticlesPath, className }: { categories: ReadonlyArray<ArticleCategoryLink>; value?: string; className?: string }) {
  return (
    <TabList value={value} onChange={followLink} aria-label="دسته‌بندی مقالات" className={className}>
      <Tab value={allArticlesPath} label="همه مقالات" href={allArticlesPath} className={styles.categoryTab} />
      {categories.map((category) => {
        const path = `/articles/category/${category.slug}`;
        return <Tab key={category.slug} value={path} label={category.name} href={path} className={styles.categoryTab} />;
      })}
    </TabList>
  );
}
