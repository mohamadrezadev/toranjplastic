import { expect, test } from "@playwright/test";

async function signInAsAdmin(page: import("@playwright/test").Page) {
  await page.context().addCookies([
    { name: "toranj_session", value: "fixture-session", domain: "127.0.0.1", path: "/", httpOnly: true, sameSite: "Lax" },
    { name: "toranj_csrf", value: "fixture-csrf", domain: "127.0.0.1", path: "/", sameSite: "Lax" },
  ]);
}

test("admin inquiry inbox and detail remain RTL, private and responsive", async ({ page }) => {
  test.setTimeout(60_000);
  await signInAsAdmin(page);
  await page.addInitScript(() => localStorage.setItem("toranj-theme", "dark"));

  await page.goto("/admin/inquiries");
  await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  const mobileMenu = page.locator('details').filter({ hasText: 'منو' });
  if (await mobileMenu.isVisible()) await mobileMenu.locator('summary').click();
  await expect(page.locator('a[href="/admin/inquiries"][aria-current="page"]').filter({ visible: true })).toBeVisible();
  await expect(page.locator('section[aria-label] strong').first()).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)).toBe(false);

  await page.goto("/admin/inquiries/inquiry-1");
  await expect(page).toHaveURL(/\/admin\/inquiries\/inquiry-1$/);
  await expect(page.getByText("یادداشت فقط برای کارکنان")).toBeVisible();
  await expect(page.getByRole("heading", { name: "گفتگو با مشتری" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "یادداشت‌های داخلی" })).toBeVisible();
  await page.getByLabel("پیام جدید برای مشتری").fill("پیام آزمایشی برای مشتری");
  await page.getByRole("button", { name: "ارسال پیام به مشتری" }).click();
  await expect(page).toHaveURL(/success=message/);
  await expect(page.getByRole("status")).toContainText("پیام برای مشتری ثبت شد");
  await expect(page.locator('input[name="expectedVersion"]').first()).toHaveValue("0");
  expect(await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)).toBe(false);
});

test("customer inquiry API never exposes admin-only fields", async ({ page }) => {
  await signInAsAdmin(page);
  const response = await page.request.get("http://127.0.0.1:3199/api/v1/inquiries/inquiry-1");
  expect(response.ok()).toBe(true);
  const body = await response.json();
  expect(body).not.toHaveProperty("internalNotes");
  expect(body).not.toHaveProperty("assignmentHistory");
  expect(body).not.toHaveProperty("assigneeSummary");
  expect(body).not.toHaveProperty("version");
});
