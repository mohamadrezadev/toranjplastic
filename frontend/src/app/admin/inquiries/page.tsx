import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui";
import { getAdminInquirySummary, inquiryQuery, inquiryStatusLabels, inquiryStatuses, inquiryTypeLabels, inquiryTypes, listAdminAssignees, listAdminInquiries } from "@/features/admin-inquiries";
import styles from "./Inquiry.module.css";

export const metadata: Metadata = { title: "کارتابل استعلام‌ها", robots: { index: false, follow: false } };
export const instant = false;

type Params = { page?: string; q?: string; type?: string; status?: string; assignment?: string; from?: string; to?: string };

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
  const pageHref = (target: number) => `?${inquiryQuery({ ...filters, page: target })}`;

  return <div className={styles.page}>
    <header className={styles.heading}><div><p className={styles.eyebrow}>عملیات مشتریان</p><h1>کارتابل استعلام‌ها</h1><p className={styles.lead}>درخواست‌های ثبت‌شده را بررسی، فیلتر و برای پیگیری به مدیر فعال اختصاص دهید.</p></div></header>
    <section className={styles.summaryGrid} aria-label="خلاصه استعلام‌ها">
      <div className={styles.summaryCard}><span>کل درخواست‌ها</span><strong>{summary.total.toLocaleString("fa-IR")}</strong></div>
      <div className={styles.summaryCard}><span>بدون مسئول</span><strong>{summary.unassigned.toLocaleString("fa-IR")}</strong></div>
      <div className={styles.summaryCard}><span>ثبت‌شده</span><strong>{summary.submitted.toLocaleString("fa-IR")}</strong></div>
      <div className={styles.summaryCard}><span>در حال بررسی</span><strong>{summary.underReview.toLocaleString("fa-IR")}</strong></div>
    </section>
    <section className={styles.panel} aria-labelledby="filters-title"><h2 id="filters-title">جست‌وجو و فیلتر</h2>
      <form className={styles.filters}>
        <div className={styles.filterField}><label htmlFor="q">شناسه، عنوان یا موبایل</label><input id="q" name="q" maxLength={80} defaultValue={params.q ?? ""} /></div>
        <div className={styles.filterField}><label htmlFor="type">نوع درخواست</label><select id="type" name="type" defaultValue={filters.type ?? ""}><option value="">همه</option>{inquiryTypes.map((item) => <option key={item} value={item}>{inquiryTypeLabels[item]}</option>)}</select></div>
        <div className={styles.filterField}><label htmlFor="status">وضعیت</label><select id="status" name="status" defaultValue={filters.status ?? ""}><option value="">همه</option>{inquiryStatuses.map((item) => <option key={item} value={item}>{inquiryStatusLabels[item]}</option>)}</select></div>
        <div className={styles.filterField}><label htmlFor="assignment">مسئول</label><select id="assignment" name="assignment" defaultValue={params.assignment ?? ""}><option value="">همه</option><option value="unassigned">بدون مسئول</option>{assignees.map((item) => <option key={item.id} value={item.id}>{item.displayName}</option>)}</select></div>
        <div className={styles.filterField}><label htmlFor="from">از تاریخ</label><input id="from" name="from" type="date" defaultValue={params.from ?? ""} /></div>
        <div className={styles.filterField}><label htmlFor="to">تا قبل از تاریخ</label><input id="to" name="to" type="date" defaultValue={params.to ?? ""} /></div>
        <div className={styles.filterActions}><Button type="submit">اعمال فیلتر</Button><Link className={styles.clearLink} href="/admin/inquiries">پاک‌کردن</Link></div>
      </form>
    </section>
    <section className={styles.panel} aria-labelledby="results-title"><div className={styles.heading}><div><h2 id="results-title">نتایج</h2><p className={styles.lead}>{result.total.toLocaleString("fa-IR")} درخواست</p></div></div>
      {result.items.length === 0 ? <p className={styles.empty}>استعلامی با این فیلترها پیدا نشد.</p> : <>
        <div className={styles.desktopTable}><table className={styles.table}><thead><tr><th>درخواست</th><th>مشتری</th><th>نوع</th><th>وضعیت</th><th>مسئول</th><th>تاریخ</th></tr></thead><tbody>{result.items.map((item) => <tr key={item.id}><td><Link className={styles.rowLink} href={`/admin/inquiries/${item.id}`}>{item.catalogItemName ?? "درخواست مشتری"}</Link><br /><small dir="ltr">{item.id.slice(-10)}</small></td><td>{item.ownerSummary.displayName}<br /><small dir="ltr">{item.ownerSummary.mobile}</small></td><td>{inquiryTypeLabels[item.type]}</td><td><span className={styles.badge} data-status={item.status}>{inquiryStatusLabels[item.status]}</span></td><td>{item.assigneeSummary?.displayName ?? "بدون مسئول"}</td><td>{new Intl.DateTimeFormat("fa-IR").format(new Date(item.createdAt))}</td></tr>)}</tbody></table></div>
        <div className={styles.mobileCards}>{result.items.map((item) => <article key={item.id} className={styles.mobileCard}><div className={styles.mobileCardHeader}><Link className={styles.rowLink} href={`/admin/inquiries/${item.id}`}>{item.catalogItemName ?? "درخواست مشتری"}</Link><span className={styles.badge} data-status={item.status}>{inquiryStatusLabels[item.status]}</span></div><div className={styles.metaRow}><span>{item.ownerSummary.displayName}</span><span>{inquiryTypeLabels[item.type]}</span></div><div className={styles.metaRow}><span>{item.assigneeSummary?.displayName ?? "بدون مسئول"}</span><time dateTime={item.createdAt}>{new Intl.DateTimeFormat("fa-IR").format(new Date(item.createdAt))}</time></div></article>)}</div>
      </>}
      {result.pageCount > 1 ? <nav className={styles.pagination} aria-label="صفحه‌بندی">{page > 1 ? <Link href={pageHref(page - 1)}>قبلی</Link> : <span />}<span>صفحه {result.page.toLocaleString("fa-IR")} از {result.pageCount.toLocaleString("fa-IR")}</span>{page < result.pageCount ? <Link href={pageHref(page + 1)}>بعدی</Link> : <span />}</nav> : null}
    </section>
  </div>;
}
