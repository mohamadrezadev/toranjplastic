import { expect, test, type Page } from "@playwright/test";

async function expectVisibleActionsNotToOverlap(page: Page) {
  const overlaps = await page.locator("a:visible, button:visible, [role='button']:visible").evaluateAll((elements) => {
    const visible = elements.map((element) => ({
      element,
      label: element.getAttribute("aria-label") || element.textContent?.trim() || element.tagName,
      rect: element.getBoundingClientRect(),
    })).filter(({ rect }) => rect.width > 0 && rect.height > 0 && rect.bottom > 0 && rect.top < window.innerHeight && rect.right > 0 && rect.left < window.innerWidth);

    const collisions: Array<{ first: string; second: string; horizontal: number; vertical: number }> = [];
    for (let firstIndex = 0; firstIndex < visible.length; firstIndex += 1) {
      for (let secondIndex = firstIndex + 1; secondIndex < visible.length; secondIndex += 1) {
        const first = visible[firstIndex];
        const second = visible[secondIndex];
        if (first.element.contains(second.element) || second.element.contains(first.element)) continue;
        const horizontal = Math.min(first.rect.right, second.rect.right) - Math.max(first.rect.left, second.rect.left);
        const vertical = Math.min(first.rect.bottom, second.rect.bottom) - Math.max(first.rect.top, second.rect.top);
        if (horizontal > 1 && vertical > 1) collisions.push({ first: first.label, second: second.label, horizontal: Math.round(horizontal), vertical: Math.round(vertical) });
      }
    }
    return collisions;
  });
  expect(overlaps).toEqual([]);
}

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
    await expect(page.getByRole("navigation", { name: "بخش‌های پنل مشتری" })).toBeVisible();
    await expect(page.getByRole("status")).toContainText("مرحله 1 از 3");
    await expect(page.getByRole("group", { name: /موضوع درخواست/ })).toBeVisible();
    await expect(page.getByRole("group", { name: /مقدار و تحویل/ })).toBeHidden();
    await expect(page.getByRole("button", { name: "مرحله بعد" })).toBeVisible();
    await expect(page.getByRole("button", { name: "ثبت درخواست" })).toHaveCount(0);
    expect(await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)).toBe(false);
    if (testInfo.project.name === "mobile-360" || testInfo.project.name === "mobile-390") {
      const navigation = page.getByRole("navigation", { name: "بخش‌های پنل مشتری" });
      await expect(navigation).toHaveCSS("position", "fixed");
      const navBottomBeforeScroll = await navigation.evaluate((element) => Math.round(element.getBoundingClientRect().bottom));
      expect(navBottomBeforeScroll).toBe(page.viewportSize()?.height);
      await page.evaluate(() => window.scrollTo(0, 500));
      const navBottomAfterScroll = await navigation.evaluate((element) => Math.round(element.getBoundingClientRect().bottom));
      expect(navBottomAfterScroll).toBe(navBottomBeforeScroll);
      const undersizedTargets = await page.locator("a:visible, button:visible, input:visible, select:visible, textarea:visible").evaluateAll((elements) => elements
        .map((element) => ({ label: element.getAttribute("aria-label") || element.textContent?.trim() || element.tagName, rect: element.getBoundingClientRect() }))
        .filter(({ rect }) => rect.width < 44 || rect.height < 44)
        .map(({ label, rect }) => ({ label, width: Math.round(rect.width), height: Math.round(rect.height) })));
      expect(undersizedTargets).toEqual([]);
      await expectVisibleActionsNotToOverlap(page);
      await page.screenshot({ path: testInfo.outputPath(`inquiry-form-${theme}.png`), fullPage: false });
      await page.evaluate(() => window.scrollTo(0, 0));
    }
    await page.getByLabel("محصول *", { exact: true }).selectOption("product-1");
    await page.getByRole("button", { name: "مرحله بعد" }).click();
    await expect(page.getByRole("status")).toContainText("مرحله 2 از 3");
    await expect(page.getByRole("group", { name: /موضوع درخواست/ })).toBeHidden();
    await expect(page.getByRole("group", { name: /مقدار و تحویل/ })).toBeVisible();
    await page.getByLabel("مقدار تقریبی (اختیاری)").fill("100");
    await page.getByLabel("شهر یا محل تحویل").fill("تهران");
    await page.getByRole("button", { name: "مرحله بعد" }).click();
    await expect(page.getByRole("status")).toContainText("مرحله 3 از 3");
    await expect(page.getByRole("group", { name: /توضیحات تکمیلی/ })).toBeVisible();
    await page.getByLabel("توضیحات تکمیلی").fill("درخواست آزمون");
    if (testInfo.project.name === "mobile-360" || testInfo.project.name === "mobile-390") {
      const submit = page.getByRole("button", { name: "ثبت درخواست" });
      const navigation = page.getByRole("navigation", { name: "بخش‌های پنل مشتری" });
      await submit.evaluate((element) => element.scrollIntoView({ block: "center" }));
      const submitRect = await submit.boundingBox();
      const navigationRect = await navigation.boundingBox();
      expect(submitRect).not.toBeNull();
      expect(navigationRect).not.toBeNull();
      expect((submitRect?.y ?? 0) + (submitRect?.height ?? 0)).toBeLessThanOrEqual(navigationRect?.y ?? 0);
      await expectVisibleActionsNotToOverlap(page);
      await page.screenshot({ path: testInfo.outputPath(`inquiry-form-final-${theme}.png`), fullPage: false });
    }
    await page.getByRole("button", { name: "ثبت درخواست" }).click();
    await expect(page).toHaveURL(/\/account\/inquiries\/inquiry-1\?created=1$/, { timeout: 15_000 });
    await expect(page.getByRole("status")).toContainText("درخواست شما ثبت شد");
    await expect(page.getByText("ثبت‌شده", { exact: true }).first()).toBeVisible();
    await expect(page.getByRole("heading", { name: "اطلاعات ثبت‌شده" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "گفتگو با کارشناس" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "تاریخچه وضعیت" })).toBeVisible();
    await page.getByLabel("پیام شما").fill("پاسخ آزمایشی مشتری");
    await page.getByRole("button", { name: "ارسال پیام" }).click();
    await expect(page).toHaveURL(/success=message/);
    await expect(page.getByRole("status")).toContainText("پیام شما برای کارشناس ثبت شد");
    expect(await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)).toBe(false);
    if (testInfo.project.name === "mobile-360" || testInfo.project.name === "mobile-390") await expectVisibleActionsNotToOverlap(page);
    if (testInfo.project.name === "desktop-1280") {
      const sidebar = page.getByRole("complementary", { name: "ناوبری پنل مشتری" }).last();
      const topBeforeScroll = await sidebar.evaluate((element) => element.getBoundingClientRect().top);
      await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
      const topAfterScroll = await sidebar.evaluate((element) => element.getBoundingClientRect().top);
      expect(topBeforeScroll).toBe(0);
      expect(topAfterScroll).toBe(0);
      await page.evaluate(() => window.scrollTo(0, 0));
    }
    await page.screenshot({ path: testInfo.outputPath(`inquiry-detail-${theme}.png`), fullPage: true });
  }
});
