import { Text } from "@astryxdesign/core/Text";
import { AdminPage } from "@/components/admin/AdminContent";

export default function StaffLoading() {
  return (
    <AdminPage title="کاربران سازمانی">
      <Text as="p" role="status" color="secondary">
        در حال دریافت اطلاعات کاربران سازمانی…
      </Text>
    </AdminPage>
  );
}
