import type { Metadata } from "next";
import { Card } from "@astryxdesign/core/Card";
import { Grid } from "@astryxdesign/core/Grid";
import { MetadataList, MetadataListItem } from "@astryxdesign/core/MetadataList";
import { Text } from "@astryxdesign/core/Text";
import { VStack } from "@astryxdesign/core/VStack";
import { notFound, redirect } from "next/navigation";
import { AdminHeader, AdminPage, AdminSection } from "@/components/admin/AdminContent";
import { Alert } from "@/components/feedback";
import { Button, Select, StatusBadge, type StatusBadgeTone } from "@/components/ui";
import {
  changeStaffRoleAction,
  changeStaffStatusAction,
  getStaff,
  StaffApiError,
} from "@/features/admin-staff";
import { getAdminAccess, hasCapability } from "@/lib/auth";

export const metadata: Metadata = { title: "جزئیات کاربر سازمانی", robots: { index: false, follow: false } };
export const instant = false;

const errors: Record<string, string> = {
  STAFF_VERSION_CONFLICT: "اطلاعات توسط شخص دیگری تغییر کرده است؛ صفحه را تازه‌سازی کنید.",
  STAFF_LAST_ADMIN_CONFLICT: "آخرین مدیر فعال را نمی‌توان غیرفعال یا تنزل داد.",
  STAFF_SELF_CHANGE_FORBIDDEN: "نقش یا وضعیت حساب جاری را نمی‌توانید تغییر دهید.",
  validation: "درخواست معتبر نیست.",
  failed: "عملیات انجام نشد.",
};

const roles = { ADMIN: "مدیر", SALES: "فروش", OPERATOR: "اپراتور محتوا" } as const;
const statusLabel = { ACTIVE: "فعال", DISABLED: "غیرفعال", SUSPENDED: "تعلیق‌شده" } as const;
const statusTone: Record<keyof typeof statusLabel, StatusBadgeTone> = {
  ACTIVE: "success",
  DISABLED: "neutral",
  SUSPENDED: "warning",
};

/*
 * Staff detail (OpenSpec change rebuild-ui-with-astryx, task 8.5):
 * capability-gated detail view with optimistic-versioned role/status forms,
 * conflict recovery, inactive-account notice, and self-change protection.
 */
export default async function StaffDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string; success?: string }>;
}) {
  const access = await getAdminAccess();
  if (access.status === 401) redirect("/auth/login");
  if (!access.account || !hasCapability(access.account, "STAFF_MANAGEMENT")) {
    return (
      <AdminPage title="جزئیات کاربر سازمانی">
        <Alert variant="danger" title="عدم دسترسی">
          شما اجازه مشاهده این صفحه را ندارید.
        </Alert>
      </AdminPage>
    );
  }

  const { id } = await params;
  let item;
  try {
    item = await getStaff(id);
  } catch (error) {
    if (error instanceof StaffApiError && error.status === 404) notFound();
    throw error;
  }

  const query = await searchParams;
  const isSelf = item.id === access.account.id;
  const isInactive = item.status !== "ACTIVE";

  return (
    <VStack gap={4}>
      <AdminHeader
        eyebrow="کاربران سازمانی"
        title={item.displayName}
        lead="مدیریت نقش و وضعیت حساب سازمانی"
        badge={<StatusBadge label={statusLabel[item.status]} tone={statusTone[item.status]} />}
        actions={
          <Button href="/admin/staff" variant="ghost">
            بازگشت به فهرست
          </Button>
        }
      />

      {query.error ? (
        <Alert variant="danger" title={errors[query.error] ?? errors.failed}>
          {query.error === "STAFF_VERSION_CONFLICT" ? (
            <Button href={`/admin/staff/${item.id}`} variant="secondary">
              تازه‌سازی اطلاعات
            </Button>
          ) : null}
        </Alert>
      ) : null}

      {query.success ? (
        <Alert variant="success" title="تغییر با موفقیت ذخیره شد و نشست‌های قبلی این کاربر باطل شدند." />
      ) : null}

      <AdminSection title="مشخصات حساب" id="staff-meta">
        <MetadataList>
          <MetadataListItem label="شماره موبایل">
            <span dir="ltr">{item.mobile}</span>
          </MetadataListItem>
          <MetadataListItem label="نقش فعلی">{roles[item.role]}</MetadataListItem>
          <MetadataListItem label="آخرین ورود">
            {item.lastLoginAt ? new Date(item.lastLoginAt).toLocaleString("fa-IR") : "بدون ورود"}
          </MetadataListItem>
          <MetadataListItem label="تاریخ ایجاد">
            {new Date(item.createdAt).toLocaleDateString("fa-IR")}
          </MetadataListItem>
          <MetadataListItem label="نسخه">{item.version.toLocaleString("fa-IR")}</MetadataListItem>
        </MetadataList>
        {isInactive ? (
          <Card variant="muted">
            <Text as="p" type="supporting" color="secondary">
              این حساب در وضعیت «{statusLabel[item.status]}» است؛ امکان ورود به سامانه تا زمان فعال‌سازی مجدد مسدود خواهد بود.
            </Text>
          </Card>
        ) : null}
      </AdminSection>

      <Grid columns={{ minWidth: 260 }} gap={4} align="start">
        <AdminSection title="تغییر نقش" id="staff-role">
          <form action={changeStaffRoleAction.bind(null, item.id)}>
            <VStack gap={3}>
              <input type="hidden" name="expectedVersion" value={item.version} />
              <Select label="سطح دسترسی" name="role" defaultValue={item.role}>
                <option value="ADMIN">مدیر — دسترسی کامل</option>
                <option value="SALES">فروش — مدیریت استعلام‌ها</option>
                <option value="OPERATOR">اپراتور — مدیریت محتوا</option>
              </Select>
              <Button type="submit" disabled={isSelf}>
                ذخیره نقش
              </Button>
            </VStack>
          </form>
        </AdminSection>

        <AdminSection title="تغییر وضعیت" id="staff-status">
          <form action={changeStaffStatusAction.bind(null, item.id)}>
            <VStack gap={3}>
              <input type="hidden" name="expectedVersion" value={item.version} />
              <Select
                label="وضعیت حساب"
                name="status"
                defaultValue={item.status === "ACTIVE" ? "ACTIVE" : "DISABLED"}
              >
                <option value="ACTIVE">فعال</option>
                <option value="DISABLED">غیرفعال</option>
              </Select>
              <Button type="submit" variant="secondary" disabled={isSelf}>
                ذخیره وضعیت
              </Button>
            </VStack>
          </form>
        </AdminSection>
      </Grid>

      <Text as="p" type="supporting" color="secondary">
        {isSelf
          ? "نقش یا وضعیت حساب جاری را نمی‌توانید تغییر دهید. "
          : ""}
        حذف دائمی حساب در این سامانه انجام نمی‌شود.
      </Text>
    </VStack>
  );
}
