import { EmptyState } from "@/components/feedback";
import { Breadcrumb } from "@/components/navigation";
import { contentStyles } from "@/components/content";

export default function ContentNotFound() {
  return <main className={contentStyles.main}><Breadcrumb items={[{ label: "خانه", href: "/" }, { label: "صفحه پیدا نشد" }]} /><div className={`${contentStyles.section} content-container`}><EmptyState title="محتوای موردنظر پیدا نشد" description="این محتوا وجود ندارد یا هنوز برای نمایش عمومی منتشر نشده است." action={{ label: "بازگشت به خانه", href: "/" }} /></div></main>;
}
