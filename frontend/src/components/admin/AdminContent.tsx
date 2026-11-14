import { Card } from "@astryxdesign/core/Card";
import { Grid } from "@astryxdesign/core/Grid";
import { Heading } from "@astryxdesign/core/Heading";
import { HStack } from "@astryxdesign/core/HStack";
import { Link } from "@astryxdesign/core/Link";
import { Table, TableBody, TableCell, TableHeader, TableHeaderCell, TableRow } from "@astryxdesign/core/Table";
import { Text } from "@astryxdesign/core/Text";
import { VStack } from "@astryxdesign/core/VStack";
import type { ReactNode } from "react";
import { Alert, EmptyState } from "@/components/feedback";
import { Button, Select, StatusBadge, type StatusBadgeTone } from "@/components/ui";
import styles from "./AdminContent.module.css";

/*
 * Shared Astryx-backed patterns of the admin content screens (OpenSpec change
 * rebuild-ui-with-astryx, task 8.2): page card, list with filters, table and
 * pagination, authoring form, rows, status actions and feedback. They carry
 * presentation only; routes keep their data loading, server actions, version
 * parameters and redirects.
 */

export function AdminPage({ title, subtitle, badge, actions, children }: { title: string; subtitle?: string; badge?: ReactNode; actions?: ReactNode; children: ReactNode }) {
  return (
    <Card className={styles.page}>
      <VStack gap={4}>
        <HStack as="header" gap={3} hAlign="between" vAlign="center" wrap="wrap" className={styles.pageHeader}>
          <VStack gap={1} hAlign="start" className={styles.headerCopy}>
            <HStack gap={3} vAlign="center" wrap="wrap">
              <Heading level={1} color="inherit" className={styles.title}>{title}</Heading>
              {badge}
            </HStack>
            {subtitle ? <Text as="p" type="supporting" color="secondary">{subtitle}</Text> : null}
          </VStack>
          {actions}
        </HStack>
        {children}
      </VStack>
    </Card>
  );
}

export type ContentStatusValue = "DRAFT" | "PUBLISHED" | "ARCHIVED";
const statusLabels: Record<ContentStatusValue, string> = { DRAFT: "پیش‌نویس", PUBLISHED: "منتشرشده", ARCHIVED: "آرشیوشده" };
const statusTones: Record<ContentStatusValue, StatusBadgeTone> = { DRAFT: "warning", PUBLISHED: "success", ARCHIVED: "neutral" };

export function ContentStatusBadge({ status }: { status: ContentStatusValue }) {
  return <StatusBadge label={statusLabels[status]} tone={statusTones[status]} />;
}

/** Row link of a list: the record's name opens its editor. */
export function AdminRowLink({ href, children }: { href: string; children: ReactNode }) {
  return <Link href={href} className={styles.rowLink}>{children}</Link>;
}

/** One row of a content list: name link, slug, optional featured flag, status and last update. */
export function AdminContentRow({ href, name, slug, status, updatedAt, featured }: { href: string; name: string; slug: string; status: ContentStatusValue; updatedAt: string; featured?: boolean }) {
  return (
    <TableRow>
      <TableCell><AdminRowLink href={href}>{name}</AdminRowLink></TableCell>
      <TableCell><span dir="ltr">{slug}</span></TableCell>
      {featured === undefined ? null : <TableCell>{featured ? "بله" : "خیر"}</TableCell>}
      <TableCell><ContentStatusBadge status={status} /></TableCell>
      <TableCell>{new Date(updatedAt).toLocaleDateString("fa-IR")}</TableCell>
    </TableRow>
  );
}

/**
 * A list screen: header with the create action, a GET filter form, the table
 * (or the empty state) and previous/next links that keep the filters. The
 * filter form is a plain GET so it works without script and keeps the URL as
 * the state.
 */
export function AdminListPage({
  title, total, countLabel = "رکورد", createHref, createLabel, notice, intro, filters, headers, rows, emptyTitle, pagination, before,
}: {
  title: string;
  total: number;
  /** Unit of the count under the title (default "رکورد"). */
  countLabel?: string;
  createHref?: string;
  createLabel?: string;
  /** Result or failure messages shown first inside the card. */
  notice?: ReactNode;
  /** Content between the notices and the filters (for example an upload form). */
  intro?: ReactNode;
  filters?: ReactNode;
  headers: string[];
  rows: ReactNode[];
  emptyTitle: string;
  pagination?: { basePath: string; page: number; totalPages: number; query: string; pageParam?: string };
  before?: ReactNode;
}) {
  return (
    <VStack gap={4}>
      {before}
      <AdminPage title={title} subtitle={`${total.toLocaleString("fa-IR")} ${countLabel}`} actions={createHref && createLabel ? <Button href={createHref}>{createLabel}</Button> : undefined}>
        {notice}
        {intro}
        {filters ? (
          <form className={styles.filters} aria-label="فیلتر فهرست">
            {filters}
            <Button type="submit" variant="secondary">اعمال فیلتر</Button>
          </form>
        ) : null}
        {rows.length === 0 ? (
          <EmptyState title={emptyTitle} description="فیلتر را تغییر دهید یا رکورد تازه‌ای ایجاد کنید." />
        ) : (
          <Table aria-label={title} dividers="rows" hasHover>
            <TableHeader>
              <TableRow>{headers.map((header) => <TableHeaderCell key={header}>{header}</TableHeaderCell>)}</TableRow>
            </TableHeader>
            <TableBody>{rows}</TableBody>
          </Table>
        )}
        {pagination && pagination.totalPages > 1 ? <AdminPagination {...pagination} /> : null}
      </AdminPage>
    </VStack>
  );
}

/** Previous/next as links (the pages stay reachable without script and keep the filters). */
export function AdminPagination({ basePath, page, totalPages, query, pageParam = "page" }: { basePath: string; page: number; totalPages: number; query: string; pageParam?: string }) {
  const href = (target: number) => `${basePath}?${pageParam}=${target}${query}`;
  return (
    <HStack as="nav" gap={3} hAlign="center" vAlign="center" wrap="wrap" aria-label="صفحه‌بندی فهرست">
      {page > 1 ? <Button href={href(page - 1)} variant="secondary">قبلی</Button> : null}
      <Text as="span" type="supporting" color="secondary">صفحه {page.toLocaleString("fa-IR")} از {totalPages.toLocaleString("fa-IR")}</Text>
      {page < totalPages ? <Button href={href(page + 1)} variant="secondary">بعدی</Button> : null}
    </HStack>
  );
}

export function AdminStatusFilter({ value }: { value?: string }) {
  return (
    <Select label="وضعیت" name="status" defaultValue={value ?? ""}>
      <option value="">همه</option>
      <option value="DRAFT">پیش‌نویس</option>
      <option value="PUBLISHED">منتشرشده</option>
      <option value="ARCHIVED">آرشیوشده</option>
    </Select>
  );
}

/** Failure of the create or save step: a danger alert, and a refresh link for a version conflict. */
export function AdminFormAlert({ message, refreshHref }: { message: string; refreshHref?: string }) {
  return (
    <Alert variant="danger" title={message}>
      {refreshHref ? <Button href={refreshHref} variant="secondary">تازه‌سازی و بارگذاری آخرین اطلاعات</Button> : null}
    </Alert>
  );
}

/** Publish and archive controls; a state already reached shows as a label instead of an action. */
export function AdminStatusActions({ status, publishAction, archiveAction }: { status: ContentStatusValue; publishAction: () => void | Promise<void>; archiveAction: () => void | Promise<void> }) {
  return (
    <HStack gap={3} vAlign="center" wrap="wrap" className={styles.statusActions}>
      {status === "PUBLISHED" ? <StatusBadge label="منتشرشده" tone="success" /> : <form action={publishAction}><Button type="submit">انتشار</Button></form>}
      {status === "ARCHIVED" ? <StatusBadge label="آرشیوشده" tone="neutral" /> : <form action={archiveAction}><Button type="submit" variant="danger">آرشیو</Button></form>}
    </HStack>
  );
}

export function AdminForm({ action, submitLabel, children }: { action: (formData: FormData) => void | Promise<void>; submitLabel: string; children: ReactNode }) {
  return (
    <form action={action} className={styles.form}>
      <VStack gap={4}>
        {children}
        <HStack gap={3} wrap="wrap" className={styles.formActions}><Button type="submit">{submitLabel}</Button></HStack>
      </VStack>
    </form>
  );
}

/** Fields that sit side by side and reflow to one column on narrow screens. */
export function AdminFormRow({ children }: { children: ReactNode }) {
  return <Grid columns={{ minWidth: 160 }} gap={3} align="start" className={styles.formRow}>{children}</Grid>;
}

export function AdminFieldset({ legend, children }: { legend: ReactNode; children: ReactNode }) {
  return (
    <fieldset className={styles.fieldset}>
      <legend className={styles.legend}>{legend}</legend>
      <VStack gap={3}>{children}</VStack>
    </fieldset>
  );
}
