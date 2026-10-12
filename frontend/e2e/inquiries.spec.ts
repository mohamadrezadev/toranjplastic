import { expect, test } from "@playwright/test";

test("authenticated customer can submit and view a private product inquiry", async ({ page }, testInfo) => {
  for (const theme of ["light", "dark"] as const) {
    await page.emulateMedia({ colorScheme: theme });
    await page.goto("/auth/login?next=/inquiry/product");
    await page.getByLabel("شماره موبایل").fill("09123456789");
    await page.getByLabel("رمز عبور").fill("strong-password");
    await page.getByRole("button", { name: "ورود" }).click();
    await expect(page).toHaveURL(/\/inquiry\/product$/);
    await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
    await page.getByLabel("محصول").selectOption("product-1");
    await page.getByLabel("مقدار تقریبی (اختیاری)").fill("100");
    await page.getByLabel("شهر یا محل تحویل").fill("تهران");
    await page.getByLabel("توضیحات تکمیلی").fill("درخواست آزمون");
    await page.getByRole("button", { name: "ثبت درخواست" }).click();
    await expect(page).toHaveURL(/\/account\/inquiries\/inquiry-1\?created=1$/, { timeout: 15_000 });
    await expect(page.getByRole("status")).toContainText("با موفقیت ثبت شد");
    await expect(page.getByText("ثبت‌شده", { exact: true }).first()).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)).toBe(false);
    await page.screenshot({ path: testInfo.outputPath(`inquiry-detail-${theme}.png`), fullPage: true });
  }
});
