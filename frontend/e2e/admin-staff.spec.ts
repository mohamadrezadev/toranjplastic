import { expect, test } from "@playwright/test";

test("staff management is private, RTL, and responsive", async ({ page }) => {
  test.setTimeout(60_000);
  await page.context().addCookies([
    { name: "toranj_session", value: "fixture-session", domain: "127.0.0.1", path: "/", httpOnly: true, sameSite: "Lax" },
    { name: "toranj_csrf", value: "fixture-csrf", domain: "127.0.0.1", path: "/", sameSite: "Lax" },
  ]);
  await page.goto("/admin/staff");
  await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
  await expect(page.getByRole("heading", { name: "کاربران سازمانی" })).toBeVisible();
  await expect(page.getByRole("link", { name: "کارشناس فروش" })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)).toBe(false);

  await page.goto("/admin/staff/new");
  await expect(page.getByLabel("رمز عبور اولیه")).toHaveAttribute("type", "password");
  expect(await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)).toBe(false);

  await page.goto("/admin/staff/staff-1");
  await expect(page.getByRole("heading", { name: "کارشناس فروش" })).toBeVisible();
  await expect(page.locator('input[name="expectedVersion"]').first()).toHaveValue("0");
  expect(await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)).toBe(false);
  await page.evaluate(() => localStorage.setItem("toranj-theme", "dark"));
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect(page.getByRole("heading", { name: "کارشناس فروش" })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)).toBe(false);
});
