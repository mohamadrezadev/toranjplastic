'use client';
import { Button } from '@/components/ui';

export default function AdminMediaError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <section role="alert"><h1>کتابخانه رسانه در دسترس نیست</h1><p>دریافت رسانه‌ها انجام نشد.</p><Button type="button" onClick={reset}>تلاش دوباره</Button></section>;
}
