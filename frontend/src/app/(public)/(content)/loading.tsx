import { LoadingState } from "@/components/feedback";
import { contentStyles } from "@/components/content";

export default function ContentLoading() {
  return <div className={contentStyles.main}><div className={`${contentStyles.section} content-container`}><LoadingState label="در حال دریافت محتوای منتشرشده…" /></div></div>;
}
