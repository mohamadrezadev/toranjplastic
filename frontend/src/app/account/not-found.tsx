import { Center } from "@astryxdesign/core/Center";
import { EmptyState } from "@astryxdesign/core/EmptyState";
import { Button } from "@/components/ui";

/*
 * Not-found inside the customer portal (task 7.1/7.4). The same message covers
 * a missing request and a request that belongs to someone else, so nothing
 * reveals which case applies (ownership-safe).
 */
export default function AccountNotFound() {
  return (
    <Center>
      <EmptyState
        headingLevel={1}
        title="درخواست موردنظر پیدا نشد"
        description="این درخواست وجود ندارد یا در حساب شما در دسترس نیست."
        actions={<Button href="/account/inquiries" variant="secondary">بازگشت به درخواست‌ها</Button>}
      />
    </Center>
  );
}
