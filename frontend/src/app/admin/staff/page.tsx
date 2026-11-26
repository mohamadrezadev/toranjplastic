import type { Metadata } from "next";
import { Card } from "@astryxdesign/core/Card";
import { Grid } from "@astryxdesign/core/Grid";
import { HStack } from "@astryxdesign/core/HStack";
import { Link } from "@astryxdesign/core/Link";
import { Table, TableBody, TableCell, TableHeader, TableHeaderCell, TableRow } from "@astryxdesign/core/Table";
import { Text } from "@astryxdesign/core/Text";
import { VStack } from "@astryxdesign/core/VStack";
import { redirect } from "next/navigation";
import { AdminPage, AdminPagination, AdminRowLink } from "@/components/admin/AdminContent";
import { Alert, EmptyState } from "@/components/feedback";
import { Button, Select, StatusBadge, type StatusBadgeTone } from "@/components/ui";
import { listStaff, type StaffRole, type StaffStatus } from "@/features/admin-staff";
import { getAdminAccess, hasCapability } from "@/lib/auth";
import styles from "./Staff.module.css";

export const metadata: Metadata = { title: "کاربران سازمانی", robots: { index: false, follow: false } };
export const instant = false;

const roles: StaffRole[] = ["ADMIN", "SALES", "OPERATOR"];
const statuses: StaffStatus[] = ["ACTIVE", "DISABLED"];
const roleLabel: Record<StaffRole, string> = { ADMIN: "مدیر", SALES: "فروش", OPERATOR: "اپراتور محتوا" };
const statusLabel = { ACTIVE: "فعال", DISABLED: "غیرفعال", SUSPENDED: "تعلیق‌شده" } as const;
const statusTone: Record<keyof typeof statusLabel, StatusBadgeTone> = {
  ACTIVE: "success",
  DISABLED: "neutral",
  SUSPENDED: "warning",
};

/*
 * Staff management list (OpenSpec change rebuild-ui-with-astryx, task 8.5):
 * capability-derived UI (STAFF_MANAGEMENT), URL-based filters, an Astryx Table
 * on wide screens and cards on narrow ones, and shared empty/feedback states.
 */
export default async function StaffPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; role?: string; status?: string; success?: string }>;
}) {
  const access = await getAdminAccess();
  if (access.status === 401) redirect("/auth/login");
  if (!access.account || !hasCapability(access.account, "STAFF_MANAGEMENT")) {
    return (
      <AdminPage title="کاربران سازمانی">
        <Alert variant="danger" title="عدم دسترسی">
          شما اجازه مدیریت کاربران سازمانی را ندارید.
        </Alert>
      </AdminPage>
    );
  }

  const params = await searchParams;
  const page = Math.max(1, Number(params.page ?? 1) || 1);
  const role = roles.includes(params.role as StaffRole) ? (params.role as StaffRole) : undefined;
  const status = statuses.includes(params.status as StaffStatus) ? (params.status as StaffStatus) : undefined;
  const result = await listStaff({ page, role, status });
  const filterSuffix = `${role ? `&role=${role}` : ""}${status ? `&status=${status}` : ""}`;
  const hasFilters = Boolean(role || status);

  return (
    <AdminPage
      title="کاربران سازمانی"
      subtitle={`${result.total.toLocaleString("fa-IR")} حساب`}
      actions={<Button href="/admin/staff/new">کاربر جدید</Button>}
    >
      {params.success === "created" ? (
        <Alert variant="success" title="حساب سازمانی با موفقیت ایجاد شد." />
      ) : null}

      <form aria-label="فیلتر کاربران سازمانی">
        <Grid columns={{ minWidth: 170 }} gap={3} align="end">
          <Select label="نقش" name="role" defaultValue={role ?? ""}>
            <option value="">همه نقش‌ها</option>
            {roles.map((item) => (
              <option key={item} value={item}>
                {roleLabel[item]}
              </option>
            ))}
          </Select>
          <Select label="وضعیت" name="status" defaultValue={status ?? ""}>
            <option value="">همه وضعیت‌ها</option>
            <option value="ACTIVE">فعال</option>
            <option value="DISABLED">غیرفعال</option>
          </Select>
          <HStack gap={2} wrap="wrap">
            <Button type="submit" variant="secondary">
              اعمال فیلتر
            </Button>
            {hasFilters ? (
              <Button href="/admin/staff" variant="ghost">
                پاک‌کردن
              </Button>
            ) : null}
          </HStack>
        </Grid>
      </form>

      {result.items.length === 0 ? (
        <EmptyState
          title="کاربری با این فیلتر پیدا نشد."
          description={hasFilters ? "فیلترها را تغییر دهید یا پاک کنید." : "هنوز حساب سازمانی ثبت نشده است."}
          action={hasFilters ? { label: "پاک‌کردن فیلترها", href: "/admin/staff" } : undefined}
        />
      ) : (
        <>
          <div className={styles.desktopTable}>
            <Table aria-label="فهرست کاربران سازمانی" dividers="rows" hasHover>
              <TableHeader>
                <TableRow>
                  <TableHeaderCell>نام</TableHeaderCell>
                  <TableHeaderCell>شماره موبایل</TableHeaderCell>
                  <TableHeaderCell>نقش</TableHeaderCell>
                  <TableHeaderCell>وضعیت</TableHeaderCell>
                  <TableHeaderCell>به‌روزرسانی</TableHeaderCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {result.items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <AdminRowLink href={`/admin/staff/${item.id}`}>{item.displayName}</AdminRowLink>
                    </TableCell>
                    <TableCell>
                      <span dir="ltr">{item.mobile}</span>
                    </TableCell>
                    <TableCell>{roleLabel[item.role]}</TableCell>
                    <TableCell>
                      <StatusBadge label={statusLabel[item.status]} tone={statusTone[item.status]} />
                    </TableCell>
                    <TableCell>{new Date(item.updatedAt).toLocaleDateString("fa-IR")}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className={styles.cards} role="list" aria-label="فهرست کاربران سازمانی (کارت)">
            {result.items.map((item) => (
              <Card key={item.id} variant="muted" role="listitem">
                <VStack gap={2}>
                  <HStack gap={2} hAlign="between" vAlign="center" wrap="wrap">
                    <Link href={`/admin/staff/${item.id}`}>{item.displayName}</Link>
                    <StatusBadge label={statusLabel[item.status]} tone={statusTone[item.status]} />
                  </HStack>
                  <VStack gap={1}>
                    <Text as="span" type="supporting" color="secondary" dir="ltr">
                      {item.mobile}
                    </Text>
                    <Text as="span" type="supporting" color="secondary">
                      {roleLabel[item.role]} · ویرایش: {new Date(item.updatedAt).toLocaleDateString("fa-IR")}
                    </Text>
                  </VStack>
                </VStack>
              </Card>
            ))}
          </div>
        </>
      )}

      {result.pageCount > 1 ? (
        <AdminPagination
          basePath="/admin/staff"
          page={page}
          totalPages={result.pageCount}
          query={filterSuffix}
        />
      ) : null}
    </AdminPage>
  );
}
