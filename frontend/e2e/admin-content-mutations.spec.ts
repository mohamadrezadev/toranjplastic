import { expect, test } from '@playwright/test';

const resources = [
  { path: '/admin/categories', record: 'admin-category-1', resourceName: 'دسته', nameField: 'name', name: 'دسته ویرایش‌شده', slug: 'updated-category' },
  { path: '/admin/products', record: 'admin-product-1', resourceName: 'محصول', nameField: 'name', name: 'محصول ویرایش‌شده', slug: 'updated-product' },
  { path: '/admin/services', record: 'admin-service-1', resourceName: 'خدمت', nameField: 'name', name: 'خدمت ویرایش‌شده', slug: 'updated-service' },
  { path: '/admin/materials', record: 'admin-material-1', resourceName: 'ماده', nameField: 'name', name: 'ماده ویرایش‌شده', slug: 'updated-material' },
  { path: '/admin/articles', record: 'admin-article-1', resourceName: 'مقاله', nameField: 'title', name: 'مقاله ویرایش‌شده', slug: 'updated-article', body: 'محتوای آزمایشی' },
  { path: '/admin/pages', record: 'admin-page-1', resourceName: 'صفحه', nameField: 'title', name: 'صفحه ویرایش‌شده', slug: 'updated-page', body: 'محتوای آزمایشی' },
] as const;

for (const resource of resources) {
  test(`${resource.resourceName} admin create, update, publish and archive actions remain wired`, async ({ page }) => {
    test.setTimeout(45_000);
    await page.context().addCookies([
      { name: 'toranj_session', value: 'fixture-session', domain: '127.0.0.1', path: '/', httpOnly: true, sameSite: 'Lax' },
      { name: 'toranj_csrf', value: 'fixture-csrf', domain: '127.0.0.1', path: '/', sameSite: 'Lax' },
    ]);

    await page.goto(`${resource.path}/new`);
    await page.locator(`input[name="${resource.nameField}"]`).fill(resource.name);
    await page.locator('input[name="slug"]').fill(resource.slug);
    if ('body' in resource) await page.locator('textarea[name="body"]').fill(resource.body);
    await page.locator('main form button[type="submit"]').last().click();
    await expect(page).toHaveURL(new RegExp(`${resource.path.replaceAll('/', '\\/')}$`));

    await page.goto(`${resource.path}/${resource.record}`);
    await expect(page.locator('main form').last()).toBeVisible();
    await page.locator('main form').last().locator(`input[name="${resource.nameField}"]`).fill(`${resource.name} updated`);
    await page.locator('main form').last().locator('button[type="submit"]').click();
    await expect(page).toHaveURL(new RegExp(`${resource.path.replaceAll('/', '\\/')}/${resource.record}$`));

    await page.locator('main form').first().locator('button[type="submit"]').click();
    await expect(page).toHaveURL(new RegExp(`${resource.path.replaceAll('/', '\\/')}/${resource.record}$`));
    await page.locator('main form').nth(1).locator('button[type="submit"]').click();
    await expect(page).toHaveURL(new RegExp(`${resource.path.replaceAll('/', '\\/')}/${resource.record}$`));
  });
}
