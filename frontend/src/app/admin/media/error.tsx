'use client';

import { VStack } from '@astryxdesign/core/VStack';
import { useEffect } from 'react';
import { ErrorState } from '@/components/feedback';
import { Button } from '@/components/ui';

/* Error boundary of the media library (task 8.3): bounded message, retry, a way back; renders inside the admin shell. */
export default function AdminMediaError({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  useEffect(() => { console.error('Admin media route failed', error); }, [error]);
  return (
    <VStack gap={3} hAlign="start">
      <ErrorState title="کتابخانه رسانه در دسترس نیست" message="دریافت رسانه‌ها انجام نشد." onRetry={retry} headingLevel={1} />
      <Button href="/admin" variant="secondary">بازگشت به پنل</Button>
    </VStack>
  );
}
