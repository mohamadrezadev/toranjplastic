import { LoadingState } from '@/components/feedback';

/* Streaming fallback of the media library (task 8.3). */
export default function AdminMediaLoading() {
  return <LoadingState label="در حال بارگذاری کتابخانه رسانه…" />;
}
