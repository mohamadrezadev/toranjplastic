import { expect, test } from "@playwright/test";

test("auth pages are private, RTL and responsive", async ({ page }, testInfo) => {
  for (const colorScheme of ["light", "dark"] as const) {
    await page.emulateMedia({ colorScheme });
    for (const [name, path] of [["login", "/auth/login"], ["register", "/auth/register"]] as const) {
      await page.goto(path);
      await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
      await expect(page.locator("html")).toHaveAttribute("data-theme", colorScheme);
      await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
      await expect(page.locator('a[href="/"]').first()).toHaveAttribute("href", "/");
      expect(await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)).toBe(false);
      await page.screenshot({ path: testInfo.outputPath(`${name}-${colorScheme}.png`), fullPage: true });
    }
  }
});

test("password login establishes the admin session", async ({ page }) => {
  await page.goto("/auth/login");
  await page.getByLabel("شماره موبایل").fill("09123456789");
  await page.getByLabel("رمز عبور").fill("strong-password");
  await page.getByRole("button", { name: "ورود" }).click();
  await expect(page).toHaveURL(/\/admin$/);
  await expect(page.getByRole("heading", { name: "پنل مدیریت" })).toBeVisible();
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
});

test("anonymous admin access redirects to login", async ({ page }) => {
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/auth\/login$/);
});
