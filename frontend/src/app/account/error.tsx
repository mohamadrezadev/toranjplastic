"use client";

import { VStack } from "@astryxdesign/core/VStack";
import { useEffect } from "react";
import { ErrorState } from "@/components/feedback";

/*
 * Error boundary of the customer portal (task 7.1): a privacy-safe message that
 * never exposes the underlying error, a retry that Next.js passes in, and the
 * one level-one heading of the screen. It renders inside the portal shell.
 */
export default function AccountError({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  useEffect(() => { console.error("Customer portal route failed", error); }, [error]);
  return (
    <VStack gap={0}>
      <meta name="robots" content="noindex, nofollow" />
      <ErrorState title="اطلاعات این بخش اکنون در دسترس نیست" message="ارتباط با سرویس برقرار نشد. کمی بعد دوباره تلاش کنید." onRetry={retry} headingLevel={1} />
    </VStack>
  );
}
