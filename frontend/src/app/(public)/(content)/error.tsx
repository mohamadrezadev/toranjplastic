"use client";

import { VStack } from "@astryxdesign/core/VStack";
import { useEffect } from "react";
import { ErrorState } from "@/components/feedback";
import { contentStyles } from "@/components/content";

/*
 * Error boundary for the public content routes (OpenSpec change
 * rebuild-ui-with-astryx, task 5.3). The shared Astryx Banner-based ErrorState
 * explains the temporary failure without exposing the underlying error and
 * offers the idempotent retry that Next.js passes in.
 *
 * The message is the page's only heading, as on the not-found screen, so it is
 * the level-one heading (headingLevel, drawn in the Banner title's own type).
 * The screen asks crawlers not to index it (owner decision OD-7, option A): the
 * boundary is a client component and cannot export metadata, so it renders a
 * robots meta element, which React hoists into the document head.
 */
export default function ContentError({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  useEffect(() => { console.error("Public content route failed", error); }, [error]);
  return (
    <main className={contentStyles.main}>
      <meta name="robots" content="noindex, nofollow" />
      <VStack gap={0} className={`${contentStyles.section} content-container`}>
        <ErrorState title="محتوای این صفحه اکنون در دسترس نیست" message="ارتباط با سرویس محتوا برقرار نشد. کمی بعد دوباره تلاش کنید." onRetry={retry} headingLevel={1} />
      </VStack>
    </main>
  );
}
