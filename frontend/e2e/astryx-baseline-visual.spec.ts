import { expect, test, type BrowserContext, type Page } from "@playwright/test";

type Theme = "light" | "dark";

const sessionCookie = (value: string) => ({
  name: "toranj_session",
  value,
  domain: "127.0.0.1",
  path: "/",
  httpOnly: true,
  sameSite: "Lax" as const,
});

async function setSession(context: BrowserContext, value?: string) {
  await context.clearCookies();
  if (value) await context.addCookies([sessionCookie(value)]);
}

async function openForSnapshot(page: Page, path: string, theme: Theme) {
  await page.addInitScript(({ selectedTheme }) => {
    localStorage.setItem("toranj-theme", selectedTheme);
  }, { selectedTheme: theme });
  await page.goto(path);
  await page.evaluate(() => document.fonts.ready);
  await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
  await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
  expect(await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)).toBe(false);
}

test("records the pre-Astryx representative visual matrix", async ({ page, context }) => {
  test.setTimeout(120_000);

  for (const theme of ["light", "dark"] as const) {
    await setSession(context);
    await openForSnapshot(page, "/", theme);
    await expect.soft(page).toHaveScreenshot(`public-home-${theme}.png`, { fullPage: true });

    await setSession(context);
    await openForSnapshot(page, "/auth/login", theme);
    await expect.soft(page).toHaveScreenshot(`auth-login-${theme}.png`, { fullPage: true });

    await setSession(context, "customer-baseline-session");
    await openForSnapshot(page, "/inquiry/product", theme);
    await expect(page.getByRole("status").filter({ hasText: /\S/ })).toContainText("مرحله 1 از 3");
    await expect.soft(page).toHaveScreenshot(`inquiry-product-${theme}.png`, { fullPage: true });

    await setSession(context, "customer-baseline-session");
    await openForSnapshot(page, "/account/inquiries/inquiry-1", theme);
    await expect(page.getByRole("heading", { name: "اطلاعات ثبت‌شده" })).toBeVisible();
    await expect.soft(page).toHaveScreenshot(`customer-inquiry-${theme}.png`, { fullPage: true });

    await setSession(context, "admin-baseline-session");
    await openForSnapshot(page, "/admin/inquiries/inquiry-1", theme);
    await expect(page.getByRole("heading", { name: "سبد صنعتی نمونه", exact: true })).toBeVisible();
    await expect.soft(page).toHaveScreenshot(`admin-inquiry-${theme}.png`, { fullPage: true });
  }
});
