import { expect, test } from "@playwright/test";

const publicPaths = ["/", "/products", "/injection-molding", "/materials", "/articles", "/about", "/contact", "/inquiry", "/account"];

test("public shell is responsive without horizontal overflow", async ({ page }, testInfo) => {
  await page.goto("/");
  const viewport = page.viewportSize();
  const hasOverflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
  expect(hasOverflow).toBe(false);

  const desktopNavigation = page.getByRole("navigation", { name: "ناوبری اصلی" });
  const mobileTrigger = page.getByRole("button", { name: "بازکردن فهرست" });
  if ((viewport?.width ?? 0) > 1024) {
    await expect(desktopNavigation).toBeVisible();
    await expect(mobileTrigger).toBeHidden();
  } else {
    await expect(desktopNavigation).toBeHidden();
    await expect(mobileTrigger).toBeVisible();
  }

  await expect(page.getByText("TRJ-2048-A")).toHaveCSS("direction", "ltr");
  await page.screenshot({ path: testInfo.outputPath("public-home.png"), fullPage: true });
});

test("mobile drawer supports keyboard, focus return and inert background", async ({ page }) => {
  test.skip((page.viewportSize()?.width ?? 0) > 1024, "mobile navigation flow");
  await page.goto("/");
  const trigger = page.getByRole("button", { name: "بازکردن فهرست" });
  await trigger.focus();
  await page.keyboard.press("Enter");
  await expect(trigger).toHaveAttribute("aria-expanded", "true");
  await expect(page.getByRole("button", { name: "بستن فهرست" })).toBeFocused();
  await expect(page.locator("[data-shell-inert]").first()).toHaveAttribute("inert", "");
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(trigger).toBeFocused();
  await expect(page.locator("[data-shell-inert]").first()).not.toHaveAttribute("inert", "");
});

test("all registered destinations resolve and provisional pages stay noindex", async ({ page, request }) => {
  for (const path of publicPaths) {
    const response = await request.get(path);
    expect(response.status(), `${path} should resolve`).toBe(200);
  }
  await page.goto("/products");
  await expect(page.getByRole("heading", { name: "محصولات در حال آماده‌سازی است" })).toBeVisible();
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
  await expect(page.locator("body")).not.toContainText(/سبد خرید|پرداخت آنلاین|موجودی لحظه‌ای/);
});
