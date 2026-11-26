import type { Metadata } from "next";
import { Card } from "@astryxdesign/core/Card";
import { Grid } from "@astryxdesign/core/Grid";
import { HStack } from "@astryxdesign/core/HStack";
import { Link } from "@astryxdesign/core/Link";
import { Table, TableBody, TableCell, TableHeader, TableHeaderCell, TableRow } from "@astryxdesign/core/Table";
import { Text } from "@astryxdesign/core/Text";
import { VStack } from "@astryxdesign/core/VStack";
import { AdminHeader, AdminPagination, AdminSection, AdminStat } from "@/components/admin/AdminContent";
import { EmptyState } from "@/components/feedback";
import { Button, Input, Select, StatusBadge } from "@/components/ui";
import { inquiryStatusTone } from "@/components/account/inquiry-labels";
import { getAdminInquirySummary, inquiryStatusLabels, inquiryStatuses, inquiryTypeLabels, inquiryTypes, listAdminAssignees, listAdminInquiries } from "@/features/admin-inquiries";
import styles from "./Inquiry.module.css";

export const metadata: Metadata = { title: "کارتابل استعلام‌ها", robots: { index: false, follow: false } };
export const instant = false;

type Params = { page?: string; q?: string; type?: string; status?: string; assignment?: string; from?: string; to?: string };

const day = (value: string) => new Intl.DateTimeFormat("fa-IR").format(new Date(value));

/*
 * Inquiry inbox (OpenSpec change rebuild-ui-with-astryx, task 8.4): real summary
 * counts, URL-based filters (a plain GET form), an Astryx Table on wide screens
 * and cards on narrow ones, the shared empty state and page links that keep
 * every filter. Data loading and the filter contract are unchanged.
 */
export default async function AdminInquiriesPage({ searchParams }: { searchParams: Promise<Params> }) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page ?? "1") || 1);
  const filters = {
    page, pageSize: 20, q: params.q?.trim() || undefined,
    type: inquiryTypes.includes(params.type as never) ? params.type : undefined,
    status: inquiryStatuses.includes(params.status as never) ? params.status : undefined,
    assignedAdminId: params.assignment && params.assignment !== "unassigned" ? params.assignment : undefined,
    unassigned: params.assignment === "unassigned" ? true : undefined,
    from: params.from || undefined, to: params.to || undefined,
  };
  const [result, summary, assignees] = await Promise.all([listAdminInquiries(filters), getAdminInquirySummary(), listAdminAssignees()]);
  // Page links use the page's own parameter names (`assignment`), so every filter survives a page change.
  const pageHref = (target: number) => {
    const query = new URLSearchParams();
    if (params.q?.trim()) query.set("q", params.q.trim());
    if (filters.type) query.set("type", filters.type);
    if (filters.status) query.set("status", filters.status);
    if (params.assignment) query.set("assignment", params.assignment);
    if (filters.from) query.set("from", filters.from);
    if (filters.to) query.set("to", filters.to);
    query.set("page", String(target));
    return `/admin/inquiries?${query}`;
  };
  const hasFilters = Boolean(filters.q || filters.type || filters.status || params.assignment || filters.from || filters.to);

  return (
    <VStack gap={4}>
      <AdminHeader eyebrow="عملیات مشتریان" title="کارتابل استعلام‌ها" lead="درخواست‌های ثبت‌شده را بررسی، فیلتر و برای پیگیری به مدیر فعال اختصاص دهید." />

      <Grid columns={{ minWidth: 150, max: 4 }} gap={3} role="group" aria-label="خلاصه استعلام‌ها">
        <AdminStat label="کل درخواست‌ها" value={summary.total.toLocaleString("fa-IR")} />
        <AdminStat label="بدون مسئول" value={summary.unassigned.toLocaleString("fa-IR")} />
        <AdminStat label="ثبت‌شده" value={summary.submitted.toLocaleString("fa-IR")} />
        <AdminStat label="در حال بررسی" value={summary.underReview.toLocaleString("fa-IR")} />
      </Grid>

      <AdminSection title="جست‌وجو و فیلتر" id="filters-title">
        <form aria-labelledby="filters-title">
          <VStack gap={3}>
            <Grid columns={{ minWidth: 170 }} gap={3} align="end">
              <Input label="شناسه، عنوان یا موبایل" name="q" maxLength={80} defaultValue={params.q ?? ""} />
              <Select label="نوع درخواست" name="type" defaultValue={filters.type ?? ""}>
                <option value="">همه</option>
                {inquiryTypes.map((item) => <option key={item} value={item}>{inquiryTypeLabels[item]}</option>)}
              </Select>
              <Select label="وضعیت" name="status" defaultValue={filters.status ?? ""}>
                <option value="">همه</option>
                {inquiryStatuses.map((item) => <option key={item} value={item}>{inquiryStatusLabels[item]}</option>)}
              </Select>
              <Select label="مسئول" name="assignment" defaultValue={params.assignment ?? ""}>
                <option value="">همه</option>
                <option value="unassigned">بدون مسئول</option>
                {assignees.map((item) => <option key={item.id} value={item.id}>{item.displayName}</option>)}
              </Select>
              <Input label="از تاریخ" name="from" type="date" defaultValue={params.from ?? ""} />
              <Input label="تا قبل از تاریخ" name="to" type="date" defaultValue={params.to ?? ""} />
            </Grid>
            <HStack gap={2} wrap="wrap" className={styles.filterActions}>
              <Button type="submit">اعمال فیلتر</Button>
              <Button href="/admin/inquiries" variant="ghost">پاک‌کردن</Button>
            </HStack>
          </VStack>
        </form>
      </AdminSection>

      <AdminSection title="نتایج" id="results-title" hint={`${result.total.toLocaleString("fa-IR")} درخواست`}>
        {result.items.length === 0 ? (
          <EmptyState title="استعلامی با این فیلترها پیدا نشد." description={hasFilters ? "فیلترها را تغییر دهید یا پاک کنید." : "هنوز درخواستی ثبت نشده است."} action={hasFilters ? { label: "پاک‌کردن فیلترها", href: "/admin/inquiries" } : undefined} />
        ) : (
          <>
            <div className={styles.desktopTable}>
              <Table aria-label="فهرست استعلام‌ها" dividers="rows" hasHover>
                <TableHeader>
                  <TableRow>
                    {["درخواست", "مشتری", "نوع", "وضعیت", "مسئول", "تاریخ"].map((header) => <TableHeaderCell key={header}>{header}</TableHeaderCell>)}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {result.items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <VStack gap={0.5} hAlign="start">
                          <Link href={`/admin/inquiries/${item.id}`} className={styles.rowLink}>{item.catalogItemName ?? "درخواست مشتری"}</Link>
                          <Text as="span" type="supporting" color="secondary" dir="ltr">{item.id.slice(-10)}</Text>
                        </VStack>
                      </TableCell>
                      <TableCell>
                        <VStack gap={0.5} hAlign="start">
                          <Text as="span">{item.ownerSummary.displayName}</Text>
                          <Text as="span" type="supporting" color="secondary" dir="ltr">{item.ownerSummary.mobile}</Text>
                        </VStack>
                      </TableCell>
                      <TableCell>{inquiryTypeLabels[item.type]}</TableCell>
                      <TableCell><StatusBadge label={inquiryStatusLabels[item.status]} tone={inquiryStatusTone(item.status)} /></TableCell>
                      <TableCell>{item.assigneeSummary?.displayName ?? "بدون مسئول"}</TableCell>
                      <TableCell>{day(item.createdAt)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <ul className={styles.mobileCards} aria-label="فهرست استعلام‌ها (کارت)">
              {result.items.map((item) => (
                <li key={item.id}>
                  <Card variant="muted">
                    <VStack gap={2}>
                      <HStack gap={2} hAlign="between" vAlign="start" wrap="wrap">
                        <Link href={`/admin/inquiries/${item.id}`} className={styles.rowLink}>{item.catalogItemName ?? "درخواست مشتری"}</Link>
                        <StatusBadge label={inquiryStatusLabels[item.status]} tone={inquiryStatusTone(item.status)} />
                      </HStack>
                      <HStack gap={2} hAlign="between" wrap="wrap">
                        <Text as="span" type="supporting" color="secondary">{item.ownerSummary.displayName}</Text>
                        <Text as="span" type="supporting" color="secondary">{inquiryTypeLabels[item.type]}</Text>
                      </HStack>
                      <HStack gap={2} hAlign="between" wrap="wrap">
                        <Text as="span" type="supporting" color="secondary">{item.assigneeSummary?.displayName ?? "بدون مسئول"}</Text>
                        <Text as="span" type="supporting" color="secondary"><time dateTime={item.createdAt}>{day(item.createdAt)}</time></Text>
                      </HStack>
                    </VStack>
                  </Card>
                </li>
              ))}
            </ul>
          </>
        )}
        {result.pageCount > 1 ? <AdminPagination basePath="/admin/inquiries" page={result.page} totalPages={result.pageCount} query="" hrefFor={pageHref} /> : null}
      </AdminSection>
    </VStack>
  );
}
