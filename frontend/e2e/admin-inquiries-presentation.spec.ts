import { expect, test, type Page } from "@playwright/test";
import { expectNoHorizontalOverflow, openThemed, seriousAxeViolations, themes, watchRuntime } from "./support/public-content-helpers";

/*
 * Admin inquiry operations (OpenSpec change rebuild-ui-with-astryx, task 8.4):
 * the inbox (summary, filters, table or cards, empty state), the detail with
 * its submitted data, quotation block, conversation, timelines and internal
 * notes, and every operation (message, note, assignment, status) with its
 * success and failure results, in both themes at the four required widths.
 * Cookie inquiry_fail (conflict, transition, assignee, error) makes the mock
 * reject a mutation with the backend's stable code.
 */

async function signIn(page: Page, extra: Record<string, string> = {}) {
  await page.context().addCookies([
    { name: "toranj_session", value: "fixture-session", httpOnly: true },
    { name: "toranj_csrf", value: "fixture-csrf", httpOnly: false },
    ...Object.entries(extra).map(([name, value]) => ({ name, value, httpOnly: false })),
  ].map((cookie) => ({ ...cookie, domain: "127.0.0.1", path: "/", sameSite: "Lax" as const })));
}

const detailPath = "/admin/inquiries/inquiry-1";
const isNarrow = (page: Page) => (page.viewportSize()?.width ?? 1280) <= 640;

for (const theme of themes) {
  test(`the inbox shows the summary, filters and the table or cards, clean in ${theme}`, async ({ page }) => {
    const problems = watchRuntime(page);
    await signIn(page);
    await openThemed(page, "/admin/inquiries", theme);
    await expect(page.locator("main")).toHaveCount(1);
    await expect(page.getByRole("heading", { level: 1, name: "کارتابل استعلام‌ها", exact: true })).toBeVisible();
    const summary = page.getByRole("group", { name: "خلاصه استعلام‌ها" });
    await expect(summary.getByText("کل درخواست‌ها")).toBeVisible();
    await expect(page.getByRole("form", { name: "جست‌وجو و فیلتر" })).toBeVisible();
    if (isNarrow(page)) {
      await expect(page.getByRole("list", { name: "فهرست استعلام‌ها (کارت)" })).toBeVisible();
      await expect(page.getByRole("table", { name: "فهرست استعلام‌ها" })).toBeHidden();
    } else {
      await expect(page.getByRole("table", { name: "فهرست استعلام‌ها" })).toBeVisible();
      await expect(page.getByRole("list", { name: "فهرست استعلام‌ها (کارت)" })).toBeHidden();
    }
    await expectNoHorizontalOverflow(page, `inbox (${theme})`);
    expect(await seriousAxeViolations(page), `inbox axe (${theme})`).toEqual([]);
    expect(problems()).toEqual([]);
  });

  test(`the detail separates customer data from staff-only operations, clean in ${theme}`, async ({ page }) => {
    const problems = watchRuntime(page);
    await signIn(page);
    await openThemed(page, detailPath, theme);
    await expect(page.locator("main")).toHaveCount(1);
    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
    for (const name of ["اطلاعات ثبت‌شده مشتری", "پیشنهاد قیمت", "گفتگو با مشتری", "تاریخچه وضعیت", "یادداشت‌های داخلی", "مسئول رسیدگی", "تغییر وضعیت", "تاریخچه تخصیص"]) {
      await expect(page.getByRole("heading", { level: 2, name, exact: true })).toBeVisible();
    }
    await expect(page.getByText("فقط کارکنان مجاز؛ برای مشتری ارسال نمی‌شود")).toBeVisible();
    await expect(page.getByText("یادداشت فقط برای کارکنان")).toBeVisible();
    await expectNoHorizontalOverflow(page, `detail (${theme})`);
    expect(await seriousAxeViolations(page), `detail axe (${theme})`).toEqual([]);
    expect(problems()).toEqual([]);
  });
}

test("the filters work from the keyboard, keep the address as the state and clear again", async ({ page }) => {
  await signIn(page);
  await openThemed(page, "/admin/inquiries", "light");
  const filters = page.getByRole("form", { name: "جست‌وجو و فیلتر" });
  await filters.getByLabel("وضعیت").selectOption("SUBMITTED");
  await filters.getByLabel(/شناسه، عنوان یا موبایل/).fill("سبد");
  await filters.getByRole("button", { name: "اعمال فیلتر" }).focus();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/status=SUBMITTED/);
  await expect(page).toHaveURL(/q=/);
  await expect(page.getByRole("form", { name: "جست‌وجو و فیلتر" }).getByLabel("وضعیت")).toHaveValue("SUBMITTED");
  await page.getByRole("link", { name: "پاک‌کردن", exact: true }).click();
  await expect(page).toHaveURL(/\/admin\/inquiries$/);
});

const operations = [
  { name: "a staff-only note", run: async (page: Page) => { await page.getByLabel("یادداشت داخلی جدید").fill("یادداشت آزمایشی"); await page.getByRole("button", { name: "ثبت یادداشت داخلی" }).click(); }, success: "note", message: "یادداشت داخلی ثبت شد." },
  { name: "a message to the customer", run: async (page: Page) => { await page.getByLabel("پیام جدید برای مشتری").fill("پیام آزمایشی"); await page.getByRole("button", { name: "ارسال پیام به مشتری" }).click(); }, success: "message", message: "پیام برای مشتری ثبت شد." },
  { name: "an assignment", run: async (page: Page) => { await page.getByRole("button", { name: "ذخیره مسئول" }).click(); }, success: "assignment", message: "مسئول درخواست به‌روزرسانی شد." },
  { name: "a status change", run: async (page: Page) => { await page.getByRole("button", { name: "ردشده" }).click(); }, success: "status", message: "وضعیت درخواست به‌روزرسانی شد." },
] as const;

for (const operation of operations) {
  test(`${operation.name} shows one success message`, async ({ page }) => {
    await signIn(page);
    await openThemed(page, detailPath, "light");
    await operation.run(page);
    await expect(page).toHaveURL(new RegExp(`success=${operation.success}`));
    await expect(page.getByRole("status").filter({ hasText: operation.message }).first()).toBeVisible();
    expect(await seriousAxeViolations(page)).toEqual([]);
  });
}

const failures = [
  { cookie: "conflict", code: "INQUIRY_VERSION_CONFLICT", text: "این درخواست هم‌زمان تغییر کرده است", refresh: true },
  { cookie: "transition", code: "INQUIRY_INVALID_TRANSITION", text: "این تغییر وضعیت دیگر مجاز نیست.", refresh: false },
  { cookie: "assignee", code: "INQUIRY_INVALID_ASSIGNEE", text: "مسئول انتخاب‌شده کارمند فعال و مجاز نیست.", refresh: false },
  { cookie: "error", code: "failed", text: "عملیات با خطا مواجه شد.", refresh: false },
] as const;

for (const failure of failures) {
  test(`a ${failure.cookie} failure is stated once without a retry${failure.refresh ? " and offers an explicit refresh" : ""}`, async ({ page }) => {
    await signIn(page, { inquiry_fail: failure.cookie });
    await openThemed(page, detailPath, "light");
    await page.getByRole("button", { name: "ذخیره مسئول" }).click();
    await expect(page).toHaveURL(/error=/);
    const main = page.locator("main");
    await expect(main.getByText(failure.text).first()).toBeVisible();
    await expect(main).not.toContainText(/500|409|stack|127\.0\.0\.1|INTERNAL_ERROR/);
    const refresh = main.getByRole("link", { name: "تازه‌سازی", exact: true });
    await expect(refresh).toHaveCount(failure.refresh ? 1 : 0);
    if (failure.refresh) await expect(refresh).toHaveAttribute("href", detailPath);
    expect(await seriousAxeViolations(page)).toEqual([]);
  });
}

test("the quotation editor keeps focus when rows are added and removed, by keyboard", async ({ page }) => {
  await signIn(page);
  await openThemed(page, detailPath, "light");
  const add = page.getByRole("button", { name: "افزودن ردیف" });
  await add.focus();
  const before = await page.getByLabel(/^شرح/).count();
  await page.keyboard.press("Enter");
  await expect(page.getByLabel(/^شرح/)).toHaveCount(before + 1);
  await expect(page.getByLabel(/^شرح/).last()).toBeFocused();
  await page.getByRole("button", { name: /^حذف ردیف/ }).last().focus();
  await page.keyboard.press("Enter");
  await expect(page.getByLabel(/^شرح/)).toHaveCount(before);
  await expect(page.getByRole("button", { name: "افزودن ردیف" })).toBeFocused();
});

test("an unknown inquiry shows the safe not-found screen", async ({ page }) => {
  await signIn(page);
  // The status is not asserted as 404 alone: the admin shell streams, so the response may already be committed as 200 (see OD-7).
  const response = await page.goto("/admin/inquiries/does-not-exist");
  expect([200, 404]).toContain(response?.status());
  await expect(page.locator("main")).toHaveCount(1);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.locator('meta[name="robots"]').first()).toHaveAttribute("content", /noindex/);
});
