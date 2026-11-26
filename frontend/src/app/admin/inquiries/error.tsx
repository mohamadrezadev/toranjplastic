"use client";

import { VStack } from "@astryxdesign/core/VStack";
import { useEffect } from "react";
import { ErrorState } from "@/components/feedback";
import { Button } from "@/components/ui";

/* Error boundary of the inquiry screens (task 8.4): bounded text, no detail, retry and a way back. */
export default function AdminInquiriesError({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  useEffect(() => { console.error("Admin inquiries route failed", error); }, [error]);
  return (
    <VStack gap={3} hAlign="start">
      <ErrorState title="کارتابل در دسترس نیست" message="دریافت اطلاعات استعلام‌ها با خطا مواجه شد. اطلاعات حساس نمایش داده نشده است." onRetry={retry} headingLevel={1} />
      <Button href="/admin" variant="secondary">بازگشت به پنل</Button>
    </VStack>
  );
}
