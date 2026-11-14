import { Center } from "@astryxdesign/core/Center";
import { VStack } from "@astryxdesign/core/VStack";
import { LoadingState } from "@/components/feedback";
import { contentStyles } from "@/components/content";

/*
 * Streaming fallback for every public content route (OpenSpec change
 * rebuild-ui-with-astryx, task 5.3). The routes differ in shape, so this uses
 * the shared Spinner-based LoadingState rather than Skeleton placeholders
 * (Astryx: Skeleton only when the content dimensions are known). It keeps the
 * page frame without a second <main>, so streamed content never briefly sits
 * next to another main landmark.
 */
export default function ContentLoading() {
  return (
    <VStack gap={0} className={contentStyles.main}>
      <Center className={`${contentStyles.section} content-container`}>
        <LoadingState label="در حال دریافت محتوای منتشرشده…" />
      </Center>
    </VStack>
  );
}
