import { expect, test } from '@playwright/test';

test.describe('Admin Media Management E2E', () => {
  test('Media Library route is private, RTL, noindex and responsive', async ({ page }) => {
    test.setTimeout(45_000);
    await page.context().addCookies([
      { name: 'toranj_session', value: 'fixture-session', domain: '127.0.0.1', path: '/', httpOnly: true, sameSite: 'Lax' },
      { name: 'toranj_csrf', value: 'fixture-csrf', domain: '127.0.0.1', path: '/', sameSite: 'Lax' },
    ]);

    await page.goto('/admin/media');
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
    await expect(page.getByRole('heading', { name: 'کتابخانه رسانه' })).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText('تصویر نمونه محصول')).toBeVisible();

    // Verify no horizontal overflow
    expect(await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)).toBe(false);
  });

  test('Product form renders ProductGalleryEditor and opens MediaPicker', async ({ page }) => {
    test.setTimeout(45_000);
    await page.context().addCookies([
      { name: 'toranj_session', value: 'fixture-session', domain: '127.0.0.1', path: '/', httpOnly: true, sameSite: 'Lax' },
      { name: 'toranj_csrf', value: 'fixture-csrf', domain: '127.0.0.1', path: '/', sameSite: 'Lax' },
    ]);

    await page.goto('/admin/products/new');
    await expect(page.getByRole('heading', { name: 'محصول جدید' })).toBeVisible({ timeout: 15_000 });

    // Verify Gallery Editor
    await expect(page.getByText(/گالری تصاویر محصول/)).toBeVisible();
    const addMediaBtn = page.getByRole('button', { name: '+ افزودن تصویر از کتابخانه' });
    await expect(addMediaBtn).toBeVisible();

    // Open MediaPicker
    await addMediaBtn.click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole('tab', { name: 'کتابخانه رسانه' })).toBeVisible();

    // Close on Escape
    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();

    // Verify no horizontal overflow
    expect(await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)).toBe(false);
  });

  test('Article form renders ArticleFeaturedImageEditor with MediaPicker trigger', async ({ page }) => {
    test.setTimeout(45_000);
    await page.context().addCookies([
      { name: 'toranj_session', value: 'fixture-session', domain: '127.0.0.1', path: '/', httpOnly: true, sameSite: 'Lax' },
      { name: 'toranj_csrf', value: 'fixture-csrf', domain: '127.0.0.1', path: '/', sameSite: 'Lax' },
    ]);

    await page.goto('/admin/articles/new');
    await expect(page.getByRole('heading', { name: 'مقاله جدید' })).toBeVisible({ timeout: 15_000 });

    // Verify Featured Image Editor
    await expect(page.getByText(/تصویر شاخص مقاله/)).toBeVisible();
    const pickBtn = page.getByRole('button', { name: '+ انتخاب تصویر از کتابخانه' });
    await expect(pickBtn).toBeVisible();

    // Open MediaPicker
    await pickBtn.click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();

    // Close on Escape
    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();

    // Verify no horizontal overflow
    expect(await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)).toBe(false);
  });
});
