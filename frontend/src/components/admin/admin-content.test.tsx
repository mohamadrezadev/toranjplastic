// @vitest-environment jsdom
import { InternationalizationProvider } from "@astryxdesign/core/i18n";
import { render, screen, within } from "@testing-library/react";
import { axe } from "jest-axe";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { astryxPersianOverrides } from "@/design-system/astryx-i18n";
import { Input } from "@/components/ui";
import {
  AdminContentRow, AdminFieldset, AdminForm, AdminFormAlert, AdminFormRow, AdminListPage, AdminPage, AdminStatusActions, AdminStatusFilter,
} from "./AdminContent";

function PersianAstryx({ children }: { children: ReactNode }) {
  return <InternationalizationProvider locale="fa-IR" dir="rtl" overrides={astryxPersianOverrides}>{children}</InternationalizationProvider>;
}
const renderUi = (ui: ReactNode) => render(ui, { wrapper: PersianAstryx });

const row = (id: string, status: "DRAFT" | "PUBLISHED" | "ARCHIVED" = "DRAFT") => (
  <AdminContentRow key={id} href={`/admin/products/${id}`} name={`محصول ${id}`} slug={`product-${id}`} status={status} updatedAt="2026-10-10T08:00:00.000Z" featured />
);

describe("admin content patterns (task 8.2)", () => {
  it("renders a list with the heading, count, create action, filters, a table and the page links", async () => {
    const { container } = renderUi(
      <AdminListPage
        title="محصولات" total={25} createHref="/admin/products/new" createLabel="محصول جدید" emptyTitle="هیچ محصولی یافت نشد."
        headers={["نام", "اسلاگ", "ویژه", "وضعیت", "به‌روزرسانی"]} filters={<AdminStatusFilter value="DRAFT" />}
        rows={[row("a"), row("b", "PUBLISHED")]}
        pagination={{ basePath: "/admin/products", page: 2, totalPages: 3, query: "&status=DRAFT" }}
      />,
    );
    expect(screen.getByRole("heading", { level: 1, name: "محصولات" })).toBeInTheDocument();
    expect(screen.getByText("۲۵ رکورد")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "محصول جدید" })).toHaveAttribute("href", "/admin/products/new");
    const filters = screen.getByRole("form", { name: "فیلتر فهرست" });
    expect(within(filters).getByLabelText("وضعیت")).toHaveValue("DRAFT");
    expect(within(filters).getByRole("button", { name: "اعمال فیلتر" })).toHaveAttribute("type", "submit");
    const table = screen.getByRole("table", { name: "محصولات" });
    expect(within(table).getAllByRole("columnheader")).toHaveLength(5);
    expect(within(table).getByRole("link", { name: "محصول a" })).toHaveAttribute("href", "/admin/products/a");
    expect(within(table).getByText("پیش‌نویس")).toBeInTheDocument();
    expect(within(table).getByText("منتشرشده")).toBeInTheDocument();
    const pages = screen.getByRole("navigation", { name: "صفحه‌بندی فهرست" });
    expect(within(pages).getByRole("link", { name: "قبلی" })).toHaveAttribute("href", "/admin/products?page=1&status=DRAFT");
    expect(within(pages).getByRole("link", { name: "بعدی" })).toHaveAttribute("href", "/admin/products?page=3&status=DRAFT");
    expect(within(pages).getByText("صفحه ۲ از ۳")).toBeInTheDocument();
    expect(await axe(container)).toHaveNoViolations();
  });

  it("shows the empty state instead of a table, and no page links for a single page", () => {
    renderUi(
      <AdminListPage
        title="دسته‌بندی‌ها" total={0} createHref="/admin/categories/new" createLabel="دسته جدید" emptyTitle="هیچ دسته‌بندی‌ای با این فیلتر یافت نشد."
        headers={["نام"]} rows={[]} pagination={{ basePath: "/admin/categories", page: 1, totalPages: 1, query: "" }}
      />,
    );
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
    expect(screen.getByText("هیچ دسته‌بندی‌ای با این فیلتر یافت نشد.")).toBeInTheDocument();
    expect(screen.queryByRole("navigation", { name: "صفحه‌بندی فهرست" })).not.toBeInTheDocument();
    expect(screen.queryByRole("form", { name: "فیلتر فهرست" })).not.toBeInTheDocument();
  });

  it("omits the previous link on the first page and the next link on the last", () => {
    const { rerender } = renderUi(
      <AdminListPage title="x" total={20} createHref="/a" createLabel="جدید" emptyTitle="-" headers={["نام"]} rows={[row("a")]} pagination={{ basePath: "/admin/products", page: 1, totalPages: 2, query: "" }} />,
    );
    expect(screen.queryByRole("link", { name: "قبلی" })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "بعدی" })).toBeInTheDocument();
    rerender(
      <AdminListPage title="x" total={20} createHref="/a" createLabel="جدید" emptyTitle="-" headers={["نام"]} rows={[row("a")]} pagination={{ basePath: "/admin/products", page: 2, totalPages: 2, query: "" }} />,
    );
    expect(screen.getByRole("link", { name: "قبلی" })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "بعدی" })).not.toBeInTheDocument();
  });

  it("renders an authoring form with rows, a fieldset and one submit action", async () => {
    const action = vi.fn();
    const { container } = renderUi(
      <AdminPage title="ویرایش محصول">
        <AdminForm action={action} submitLabel="ذخیره تغییرات">
          <AdminFormRow>
            <Input label="نام" name="name" defaultValue="سبد" />
            <Input label="اسلاگ" name="slug" dir="ltr" defaultValue="basket" />
          </AdminFormRow>
          <AdminFieldset legend={<>تصویر (اختیاری)</>}>
            <Input label="آدرس تصویر" name="imageUrl" dir="ltr" />
          </AdminFieldset>
        </AdminForm>
      </AdminPage>,
    );
    expect(screen.getByRole("heading", { level: 1, name: "ویرایش محصول" })).toBeInTheDocument();
    expect(screen.getByRole("group", { name: "تصویر (اختیاری)" })).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: "ذخیره تغییرات" })).toHaveLength(1);
    expect(screen.getByLabelText("نام")).toHaveValue("سبد");
    expect(await axe(container)).toHaveNoViolations();
  });

  it("shows a danger alert and, for a version conflict only, the refresh link", () => {
    const { rerender } = renderUi(<AdminFormAlert message="اطلاعات واردشده معتبر نیست." />);
    // The shared Alert nests the Banner's own alert inside its live region, so there are two.
    expect(screen.getAllByRole("alert").length).toBeGreaterThan(0);
    expect(screen.getByText("اطلاعات واردشده معتبر نیست.")).toBeInTheDocument();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
    rerender(<AdminFormAlert message="تداخل نسخه" refreshHref="/admin/products/p1" />);
    expect(screen.getByRole("link", { name: "تازه‌سازی و بارگذاری آخرین اطلاعات" })).toHaveAttribute("href", "/admin/products/p1");
  });

  it("offers publish and archive only for states not yet reached", () => {
    const noop = () => undefined;
    const { rerender } = renderUi(<AdminStatusActions status="DRAFT" publishAction={noop} archiveAction={noop} />);
    expect(screen.getByRole("button", { name: "انتشار" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "آرشیو" })).toBeInTheDocument();
    rerender(<AdminStatusActions status="PUBLISHED" publishAction={noop} archiveAction={noop} />);
    expect(screen.queryByRole("button", { name: "انتشار" })).not.toBeInTheDocument();
    expect(screen.getByText("منتشرشده")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "آرشیو" })).toBeInTheDocument();
    rerender(<AdminStatusActions status="ARCHIVED" publishAction={noop} archiveAction={noop} />);
    expect(screen.getByRole("button", { name: "انتشار" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "آرشیو" })).not.toBeInTheDocument();
    expect(screen.getByText("آرشیوشده")).toBeInTheDocument();
  });
});
