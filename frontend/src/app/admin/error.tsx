"use client";

import { VStack } from "@astryxdesign/core/VStack";
import { useEffect } from "react";
import { ErrorState } from "@/components/feedback";
import { Button } from "@/components/ui";

/*
 * Error boundary of the admin routes (task 8.1). It renders inside the shell's
 * single <main>, never exposes the underlying error, offers the retry that
 * Next.js passes in and a way back to the panel. It is the one level-one
 * heading of the screen; the admin layout already marks the area noindex.
 */
export default function AdminError({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  useEffect(() => { console.error("Admin route failed", error); }, [error]);
  return (
    <VStack gap={3} hAlign="start">
      <ErrorState
        title="امکان نمایش این بخش وجود ندارد"
        message="ممکن است سطح دسترسی شما برای این صفحه کافی نباشد یا ارتباط با سرویس موقتاً قطع شده باشد."
        onRetry={retry}
        headingLevel={1}
      />
      <Button href="/admin" variant="secondary">بازگشت به پنل</Button>
    </VStack>
  );
}
