import { LoadingState } from "@/components/feedback";

/* Streaming fallback for the admin routes (task 8.1): a polite busy status, no heading of its own. */
export default function AdminLoading() {
  return <LoadingState label="در حال دریافت اطلاعات…" />;
}
