import { Center } from "@astryxdesign/core/Center";
import { EmptyState } from "@astryxdesign/core/EmptyState";
import { Breadcrumb } from "@/components/navigation";
import { contentStyles } from "@/components/content";
import { Button } from "@/components/ui";

/*
 * Shared not-found experience for public content (OpenSpec change
 * rebuild-ui-with-astryx, task 5.3). The same message covers missing, draft,
 * archived and otherwise hidden records, so nothing reveals which case
 * applies. Astryx Center holds the empty state and its route back home.
 *
 * The message is the page's only heading, so it is the level-one heading:
 * the Astryx EmptyState sets the heading tag through headingLevel without
 * changing the title's size. The shared feedback EmptyState adapter fixes
 * level two for empty states inside a page, so this whole-page state
 * composes the same Astryx EmptyState and secondary Button action directly.
 */
export default function ContentNotFound() {
  return (
    <main className={contentStyles.main}>
      <Breadcrumb items={[{ label: "خانه", href: "/" }, { label: "صفحه پیدا نشد" }]} />
      <Center className={`${contentStyles.section} content-container`}>
        <EmptyState
          headingLevel={1}
          title="محتوای موردنظر پیدا نشد"
          description="این محتوا وجود ندارد یا هنوز برای نمایش عمومی منتشر نشده است."
          actions={<Button href="/" variant="secondary">بازگشت به خانه</Button>}
        />
      </Center>
    </main>
  );
}
