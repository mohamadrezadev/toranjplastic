import { expect, test } from "@playwright/test";

for (const theme of ["light", "dark"] as const) {
  test(`renders the Persian RTL component lab in ${theme} mode`, async ({ page }, testInfo) => {
    const runtimeErrors: string[] = [];
    const failedResources: string[] = [];
    page.on("console", (message) => {
      if (message.type() === "error" && !message.text().startsWith("Failed to load resource:")) {
        runtimeErrors.push(message.text());
      }
    });
    page.on("pageerror", (error) => runtimeErrors.push(error.message));
    page.on("response", (response) => {
      if (response.status() >= 400) failedResources.push(`${response.status()} ${response.url()}`);
    });
    await page.addInitScript((selectedTheme) => localStorage.setItem("toranj-theme", selectedTheme), theme);
    await page.goto("/brand-preview");

    await expect(page).toHaveTitle(/آزمایشگاه رابط کاربری ترنج/);
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/i);
    await expect(page.getByRole("heading", { level: 1, name: "آزمایشگاه رابط کاربری ترنج" })).toBeVisible();
    await expect(page.getByRole("heading", { level: 2, name: "کنترل‌های فرم استعلام" })).toBeVisible();
    await expect(page.getByRole("navigation", { name: "ناوبری نمونه" })).toBeVisible();
    await expect(page.getByRole("navigation", { name: "مسیر نمونه" })).toBeVisible();
    await expect(page.getByRole("table")).toBeVisible();
    await expect(page.getByLabel("نام و نام خانوادگی")).toHaveValue("نگین محمدی");
    await expect(page.getByLabel("نقشه یا تصویر فنی آماده است")).toBeChecked();
    await expect(page.getByLabel("اعلان تغییر وضعیت")).not.toBeChecked();
    await expect(page.getByRole("button", { name: "در حال بررسی" })).toBeDisabled();
    await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
    await expect(page.locator("html")).toHaveAttribute("data-theme", theme);

    expect(await page.getByLabel("شماره پیگیری").evaluate((element) => getComputedStyle(element).direction)).toBe("ltr");
    expect(
      await page.locator(".ltr-data").first().evaluate((element) => getComputedStyle(element).unicodeBidi),
    ).toBe("isolate");
    expect(await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)).toBe(false);

    const sampleNav = page.getByRole("navigation", { name: "ناوبری نمونه" });
    await sampleNav.getByRole("link", { name: "نمای کلی" }).focus();
    await page.keyboard.press("Tab");
    await expect(sampleNav.getByRole("link", { name: "فرم‌ها" })).toBeFocused();

    const pagination = page.getByRole("navigation", { name: "صفحه‌بندی نمونه" });
    const previousPage = pagination.getByRole("button", { name: "رفتن به صفحهٔ قبل" });
    const nextPage = pagination.getByRole("button", { name: "رفتن به صفحهٔ بعد" });
    const previousBox = await previousPage.boundingBox();
    const nextBox = await nextPage.boundingBox();
    expect(previousBox).not.toBeNull();
    expect(nextBox).not.toBeNull();
    expect(nextBox!.x).toBeLessThan(previousBox!.x);
    await nextPage.click();
    await expect(pagination).toContainText(/صفحهٔ? ۳ از ۵/);

    const dialogTrigger = page.getByRole("button", { name: "بازکردن گفت‌وگوی نمونه" });
    await dialogTrigger.click();
    const dialog = page.getByRole("dialog", { name: "گفت‌وگوی نمونه" });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole("heading", { name: "گفت‌وگوی نمونه" })).toBeFocused();
    await page.keyboard.press("Escape");
    await expect(dialog).not.toBeVisible();
    await expect(dialogTrigger).toBeFocused();

    await dialogTrigger.click();
    await expect(dialog).toBeVisible();
    await page.keyboard.press("Tab");
    await expect(dialog.getByRole("button", { name: "بستن", exact: true }).first()).toBeFocused();
    await dialog.getByRole("button", { name: "بستن", exact: true }).first().click();
    await expect(dialog).not.toBeVisible();
    await expect(dialogTrigger).toBeFocused();

    await page.getByLabel("اعلان تغییر وضعیت").focus();
    await page.keyboard.press("Space");
    await expect(page.getByLabel("اعلان تغییر وضعیت")).toBeChecked();

    await page.screenshot({
      path: testInfo.outputPath(`component-lab-${theme}.png`),
      fullPage: true,
      animations: "disabled",
    });
    expect(runtimeErrors).toEqual([]);
    expect(failedResources).toEqual([]);
  });
}
