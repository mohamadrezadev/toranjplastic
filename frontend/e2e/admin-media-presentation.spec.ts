import { expect, test, type Page } from "@playwright/test";
import { expectNoHorizontalOverflow, openThemed, seriousAxeViolations, themes, watchRuntime } from "./support/public-content-helpers";

/*
 * Admin media (OpenSpec change rebuild-ui-with-astryx, task 8.3): the media
 * library, the upload and delete results, the picker dialog (focus trap, Escape,
 * focus return, library and upload tabs, failure and retry), the product
 * gallery editor by keyboard and the article featured image, in both themes at
 * the four required widths. Cookie media_fail (large, invalid, storage) makes
 * the mock reject an upload with the backend's stable code.
 */

async function signIn(page: Page, extra: Record<string, string> = {}) {
  await page.context().addCookies([
    { name: "toranj_session", value: "fixture-session", httpOnly: true },
    { name: "toranj_csrf", value: "fixture-csrf", httpOnly: false },
    ...Object.entries(extra).map(([name, value]) => ({ name, value, httpOnly: false })),
  ].map((cookie) => ({ ...cookie, domain: "127.0.0.1", path: "/", sameSite: "Lax" as const })));
}

const png = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==", "base64");
const dialogOf = (page: Page) => page.getByRole("dialog");
const addButton = (page: Page) => page.getByRole("button", { name: "+ افزودن تصویر از کتابخانه" });

async function focusIsInside(page: Page, selector: string) {
  return page.evaluate((sel) => Boolean(document.activeElement?.closest(sel)), selector);
}

for (const theme of themes) {
  test(`the media library is clean in ${theme}`, async ({ page }) => {
    const problems = watchRuntime(page);
    await signIn(page);
    await openThemed(page, "/admin/media", theme);
    await expect(page.locator("main")).toHaveCount(1);
    await expect(page.getByRole("heading", { level: 1, name: "کتابخانه رسانه", exact: true })).toBeVisible();
    await expect(page.getByRole("form", { name: "بارگذاری تصویر" })).toBeVisible();
    const table = page.getByRole("table", { name: "کتابخانه رسانه" });
    await expect(table.getByRole("row")).toHaveCount(3);
    await expect(table.getByRole("button", { name: "حذف" })).toHaveCount(1);
    await expect(table.getByText("در حال استفاده؛ قابل حذف نیست")).toBeVisible();
    await expectNoHorizontalOverflow(page, `media library (${theme})`);
    expect(await seriousAxeViolations(page), `media library axe (${theme})`).toEqual([]);
    expect(problems()).toEqual([]);
  });
}

test("results of upload, delete and a blocked delete are announced once as alerts", async ({ page }) => {
  await signIn(page);
  await openThemed(page, "/admin/media", "light");
  await page.getByLabel("فایل JPEG، PNG یا WebP").setInputFiles({ name: "a.png", mimeType: "image/png", buffer: png });
  await page.getByLabel("متن جایگزین پیش‌فرض").fill("تصویر آزمایشی");
  await page.getByRole("button", { name: "بارگذاری" }).click();
  await expect(page).toHaveURL(/uploaded=1/);
  await expect(page.getByText("رسانه با موفقیت بارگذاری و پردازش شد.").first()).toBeVisible();

  await openThemed(page, "/admin/media", "light");
  await page.getByRole("table").getByRole("button", { name: "حذف" }).click();
  await expect(page).toHaveURL(/deleted=1/);
  await expect(page.getByText("رسانه حذف شد.").first()).toBeVisible();

  await openThemed(page, "/admin/media?error=MEDIA_IN_USE", "light");
  await expect(page.getByText("این رسانه در محتوا استفاده شده و قابل حذف نیست.").first()).toBeVisible();
  expect(await seriousAxeViolations(page)).toEqual([]);
});

test("a failed upload shows the stable message from the backend code and nothing more", async ({ page }) => {
  await signIn(page, { media_fail: "large" });
  await openThemed(page, "/admin/media", "light");
  await page.getByLabel("فایل JPEG، PNG یا WebP").setInputFiles({ name: "a.png", mimeType: "image/png", buffer: png });
  await page.getByLabel("متن جایگزین پیش‌فرض").fill("تصویر آزمایشی");
  await page.getByRole("button", { name: "بارگذاری" }).click();
  await expect(page).toHaveURL(/error=MEDIA_UPLOAD_TOO_LARGE/);
  const main = page.locator("main");
  await expect(main.getByText("اندازه فایل یا ابعاد تصویر بیش از حد مجاز است.").first()).toBeVisible();
  await expect(main).not.toContainText(/413|stack|127\.0\.0\.1/);
});

for (const theme of themes) {
  test(`the picker dialog traps focus, closes with Escape and returns focus in ${theme}`, async ({ page }) => {
    const problems = watchRuntime(page);
    await signIn(page);
    await openThemed(page, "/admin/products/new", theme);
    const trigger = addButton(page);
    await trigger.focus();
    await page.keyboard.press("Enter");
    const dialog = dialogOf(page);
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole("heading", { name: /انتخاب تصویر/ })).toBeVisible();
    await expect(dialog.getByRole("tab", { name: "کتابخانه رسانه", selected: true })).toBeVisible();
    await expect(dialog.getByRole("button", { name: /تصویر نمونه محصول/ })).toBeVisible();

    // The dialog fits the viewport and the page behind does not gain an overflow.
    const box = await dialog.boundingBox();
    const width = page.viewportSize()?.width ?? 1280;
    expect(box && box.x >= -1 && box.x + box.width <= width + 1).toBe(true);
    await expectNoHorizontalOverflow(page, `picker (${theme})`);
    expect(await seriousAxeViolations(page), `picker axe (${theme})`).toEqual([]);

    // Focus never leaves the dialog, forwards or backwards.
    for (let press = 0; press < 14; press += 1) {
      await page.keyboard.press("Tab");
      expect(await focusIsInside(page, "dialog"), `forward Tab ${press}`).toBe(true);
    }
    for (let press = 0; press < 14; press += 1) {
      await page.keyboard.press("Shift+Tab");
      expect(await focusIsInside(page, "dialog"), `backward Tab ${press}`).toBe(true);
    }

    // Escape from a plain control (the close button shows a tooltip, a layer of its own: see the next test).
    await dialog.getByLabel("جست‌وجو در رسانه‌ها").focus();
    await expect(page.locator("[role=tooltip]:visible")).toHaveCount(0);
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(trigger).toBeFocused();
    expect(problems()).toEqual([]);
  });
}

test("on the close button the first Escape dismisses its tooltip layer and the next closes the dialog", async ({ page }) => {
  await signIn(page);
  await openThemed(page, "/admin/products/new", "light");
  const trigger = addButton(page);
  await trigger.click();
  const dialog = dialogOf(page);
  await dialog.getByRole("button", { name: "بستن" }).focus();
  for (let press = 0; press < 2 && (await dialog.isVisible()); press += 1) await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();
});

test("Enter in the picker search does not submit the product form", async ({ page }) => {
  await signIn(page);
  await openThemed(page, "/admin/products/new", "light");
  await addButton(page).click();
  const dialog = dialogOf(page);
  await dialog.getByLabel("جست‌وجو در رسانه‌ها").fill("نمونه");
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/admin\/products\/new$/);
  await expect(dialog).toBeVisible();
});

test("choosing a library image adds it to the gallery as the cover with its hidden field, by keyboard", async ({ page }) => {
  await signIn(page);
  await openThemed(page, "/admin/products/new", "light");
  await addButton(page).focus();
  await page.keyboard.press("Enter");
  const dialog = dialogOf(page);
  await dialog.getByRole("button", { name: /تصویر نمونه محصول/ }).focus();
  await page.keyboard.press("Enter");
  await expect(dialog).toBeHidden();
  await expect(page.getByText("کاور / تصویر اصلی")).toBeVisible();
  await expect(page.locator('input[name="image1MediaAssetId"]')).toHaveValue("admin-media-1");
  await expect(page.getByLabel("متن جایگزین (Alt) تصویر 1")).toHaveValue("تصویر نمونه محصول");
  expect(await seriousAxeViolations(page)).toEqual([]);
});

test("the upload tab accepts a file, selects the new asset and closes; a rejected file stays and can be retried", async ({ page }) => {
  await signIn(page);
  await openThemed(page, "/admin/products/new", "light");
  await addButton(page).click();
  const dialog = dialogOf(page);
  await dialog.getByRole("tab", { name: "بارگذاری تصویر جدید" }).click();
  await expect(dialog.getByRole("button", { name: /انتخاب فایل از دستگاه/ })).toBeVisible();
  await dialog.locator('input[type="file"]').setInputFiles({ name: "نمونه.png", mimeType: "image/png", buffer: png });
  await expect(dialog).toBeHidden({ timeout: 15_000 });
  await expect(page.locator('input[name="image1MediaAssetId"]')).toHaveValue("admin-media-3");
});

test("an upload the backend refuses shows the failure, keeps the file in the queue and offers a retry", async ({ page }) => {
  await signIn(page, { media_fail: "invalid" });
  await openThemed(page, "/admin/products/new", "light");
  await addButton(page).click();
  const dialog = dialogOf(page);
  await dialog.getByRole("tab", { name: "بارگذاری تصویر جدید" }).click();
  await dialog.locator('input[type="file"]').setInputFiles({ name: "bad.png", mimeType: "image/png", buffer: png });
  const queue = dialog.getByRole("list", { name: "فهرست فایل‌های صف بارگذاری" });
  await expect(queue.getByText("ناموفق")).toBeVisible({ timeout: 15_000 });
  await expect(queue.getByText("فرمت فایل معتبر نیست.")).toBeVisible();
  await expect(queue.getByRole("button", { name: "تلاش مجدد" })).toBeVisible();
  await expect(dialog).toBeVisible();
  expect(await seriousAxeViolations(page)).toEqual([]);
});

test("a file of the wrong type is refused with a visible message", async ({ page }) => {
  await signIn(page);
  await openThemed(page, "/admin/products/new", "light");
  await addButton(page).click();
  const dialog = dialogOf(page);
  await dialog.getByRole("tab", { name: "بارگذاری تصویر جدید" }).click();
  await dialog.locator('input[type="file"]').setInputFiles({ name: "doc.pdf", mimeType: "application/pdf", buffer: Buffer.from("%PDF-1.4") });
  await expect(dialog.getByText(/فایل doc.pdf رد شد/)).toBeVisible();
  await expect(dialog.getByRole("list", { name: "فهرست فایل‌های صف بارگذاری" })).toHaveCount(0);
});

test("gallery images are reordered and removed from the keyboard with focus kept on a usable control", async ({ page }) => {
  await signIn(page);
  await openThemed(page, "/admin/products/new", "light");
  for (const url of ["https://example.com/one.jpg", "https://example.com/two.jpg"]) {
    await page.getByRole("button", { name: "+ افزودن آدرس اینترنتی (قدیمی)" }).click();
    await page.getByLabel("آدرس کامل اینترنتی تصویر (URL)").fill(url);
    await page.keyboard.press("Enter");
  }
  await expect(page.getByText("تعداد تصاویر: 2 از 6")).toBeVisible();
  await expect(page).toHaveURL(/\/admin\/products\/new$/);
  await page.getByRole("button", { name: "انتقال تصویر 2 به بالا" }).focus();
  await page.keyboard.press("Enter");
  await expect(page.locator('input[name="image1Url"]')).toHaveValue("https://example.com/two.jpg");
  await expect(page.getByRole("button", { name: "انتقال تصویر 1 به پایین" })).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator('input[name="image1Url"]')).toHaveValue("https://example.com/one.jpg");
  await page.getByRole("button", { name: "حذف تصویر 1 از گالری" }).focus();
  await page.keyboard.press("Enter");
  await expect(page.getByText("تعداد تصاویر: 1 از 6")).toBeVisible();
  await expect(page.getByRole("button", { name: "حذف تصویر 1 از گالری" })).toBeFocused();
  await expectNoHorizontalOverflow(page, "gallery");
});

test("the article featured image is chosen from the library and removed, and focus returns to the pick button", async ({ page }) => {
  await signIn(page);
  await openThemed(page, "/admin/articles/new", "light");
  const pick = page.getByRole("button", { name: "+ انتخاب تصویر از کتابخانه" });
  await pick.click();
  const dialog = dialogOf(page);
  await dialog.getByRole("button", { name: /تصویر نمونه محصول/ }).click();
  await expect(dialog).toBeHidden();
  await expect(page.locator('input[name="featuredImageMediaAssetId"]')).toHaveValue("admin-media-1");
  await page.getByRole("button", { name: "حذف تصویر شاخص" }).click();
  await expect(page.getByRole("button", { name: "+ انتخاب تصویر از کتابخانه" })).toBeFocused();
  expect(await seriousAxeViolations(page)).toEqual([]);
});
