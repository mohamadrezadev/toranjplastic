import { expect, test } from '@playwright/test';

const adminRoutes = [
  '/admin/categories',
  '/admin/products',
  '/admin/services',
  '/admin/materials',
  '/admin/articles',
  '/admin/pages',
] as const;

for (const path of adminRoutes) {
  test(`${path} remains private, RTL and responsive`, async ({ page }) => {
    test.setTimeout(45_000);
    await page.context().addCookies([
      { name: 'toranj_session', value: 'fixture-session', domain: '127.0.0.1', path: '/', httpOnly: true, sameSite: 'Lax' },
      { name: 'toranj_csrf', value: 'fixture-csrf', domain: '127.0.0.1', path: '/', sameSite: 'Lax' },
    ]);
    await page.goto(path);
    await expect(page.getByRole('status')).toBeHidden({ timeout: 15_000 });
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
    await expect(page.locator('a[href="/admin/inquiries"]')).toHaveCount(2);
    await expect(page.locator('main h1').first()).toBeVisible({ timeout: 15_000 });
    await expect(page.locator('a[href$="/new"]').first()).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)).toBe(false);

    const recordLink = page.locator(`a[href^="${path}/admin-"]`).first();
    await expect(recordLink).toBeVisible();
    const recordHref = await recordLink.getAttribute('href');
    expect(recordHref).toBeTruthy();
    await page.goto(recordHref!);
    await expect(page.locator('form:visible').first()).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)).toBe(false);

    await page.goto(`${path}/new`);
    await expect(page.locator('form:visible button[type="submit"]').first()).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)).toBe(false);
  });
}
