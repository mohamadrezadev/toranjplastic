"use client";

import { useEffect } from "react";
import { ErrorState } from "@/components/feedback";
import { contentStyles } from "@/components/content";

export default function ContentError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error("Public content route failed", error); }, [error]);
  return <main className={contentStyles.main}><div className={`${contentStyles.section} content-container`}><ErrorState title="محتوای این صفحه اکنون در دسترس نیست" message="ارتباط با سرویس محتوا برقرار نشد. کمی بعد دوباره تلاش کنید." onRetry={reset} /></div></main>;
}
