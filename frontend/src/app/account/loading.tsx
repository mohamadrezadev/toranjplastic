import { LoadingState } from "@/components/feedback";

/* Streaming fallback for the portal routes (task 7.1): a polite busy status, no heading of its own. */
export default function AccountLoading() {
  return <LoadingState label="در حال دریافت اطلاعات حساب…" />;
}
