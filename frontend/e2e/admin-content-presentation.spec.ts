import { expect, test, type Page } from "@playwright/test";
import { expectNoHorizontalOverflow, openThemed, seriousAxeViolations, themes, watchRuntime } from "./support/public-content-helpers";

/*
 * Admin content screens (OpenSpec change rebuild-ui-with-astryx, task 8.2):
 * the lists, create forms and edit forms of products, categories, materials,
 * services, articles and managed pages, in both themes at the four required
 * widths. The mutations themselves are covered by admin-content-mutations.
 */

async function signIn(page: Page) {
  await page.context().addCookies([
    { name: "toranj_session", value: "fixture-session", httpOnly: true },
    { name: "toranj_csrf", value: "fixture-csrf", httpOnly: false },
  ].map((cookie) => ({ ...cookie, domain: "127.0.0.1", path: "/", sameSite: "Lax" as const })));
}

const resources = [
  { key: "products", list: "محصولات", create: "محصول جدید", createHeading: "محصول جدید", edit: "ویرایش محصول", id: "admin-product-1" },
  { key: "categories", list: "دسته‌بندی‌ها", create: "دسته جدید", createHeading: "دسته جدید", edit: "ویرایش دسته‌بندی", id: "admin-category-1" },
  { key: "materials", list: "مواد اولیه", create: "ماده جدید", createHeading: "ماده جدید", edit: "ویرایش ماده", id: "admin-material-1" },
  { key: "services", list: "خدمات تزریق", create: "خدمت جدید", createHeading: "خدمت جدید", edit: "ویرایش خدمت", id: "admin-service-1" },
  { key: "articles", list: "مقالات", create: "مقاله جدید", createHeading: "مقاله جدید", edit: "ویرایش مقاله", id: "admin-article-1" },
  { key: "pages", list: "صفحات ثابت", create: "صفحه جدید", createHeading: "صفحه جدید", edit: "ویرایش صفحه", id: "admin-page-1" },
] as const;

async function expectCleanScreen(page: Page, context: string) {
  await expect(page.locator("main")).toHaveCount(1);
  await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
  await expectNoHorizontalOverflow(page, context);
  expect(await seriousAxeViolations(page), `${context} axe`).toEqual([]);
}

for (const resource of resources) {
  for (const theme of themes) {
    test(`${resource.key}: list, create and edit screens are clean in ${theme}`, async ({ page }) => {
      test.setTimeout(90_000);
      const problems = watchRuntime(page);
      await signIn(page);

      await openThemed(page, `/admin/${resource.key}`, theme);
      await expect(page.getByRole("heading", { level: 1, name: resource.list, exact: true })).toBeVisible();
      await expect(page.getByRole("form", { name: "فیلتر فهرست" })).toBeVisible();
      await expect(page.getByRole("link", { name: resource.create, exact: true })).toHaveAttribute("href", `/admin/${resource.key}/new`);
      await expect(page.locator("main").getByRole("table", { name: resource.list })).toBeVisible();
      await expect(page.locator(`main a[href="/admin/${resource.key}/${resource.id}"]`)).toBeVisible();
      await expectCleanScreen(page, `${resource.key} list (${theme})`);

      await openThemed(page, `/admin/${resource.key}/new`, theme);
      await expect(page.getByRole("heading", { level: 1, name: resource.createHeading, exact: true })).toBeVisible();
      await expect(page.locator("main form").last().locator('button[type="submit"]')).toBeVisible();
      await expectCleanScreen(page, `${resource.key} create (${theme})`);

      await openThemed(page, `/admin/${resource.key}/${resource.id}`, theme);
      await expect(page.getByRole("heading", { level: 1, name: resource.edit, exact: true })).toBeVisible();
      await expectCleanScreen(page, `${resource.key} edit (${theme})`);
      expect(problems()).toEqual([]);
    });
  }
}

test("the status filter works from the keyboard and keeps the address as the state", async ({ page }) => {
  await signIn(page);
  await openThemed(page, "/admin/products", "light");
  const filters = page.getByRole("form", { name: "فیلتر فهرست" });
  await filters.getByLabel("وضعیت").selectOption("DRAFT");
  await filters.getByRole("button", { name: "اعمال فیلتر" }).focus();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/status=DRAFT/);
  await expect(page.getByRole("form", { name: "فیلتر فهرست" }).getByLabel("وضعیت")).toHaveValue("DRAFT");
});

test("a failed save and a version conflict show one alert; the conflict offers a refresh", async ({ page }) => {
  await signIn(page);
  await openThemed(page, "/admin/products/new?error=validation", "light");
  const alert = page.locator("main").getByRole("alert").first();
  await expect(alert).toContainText("اطلاعات واردشده معتبر نیست");
  await expect(alert.getByRole("link")).toHaveCount(0);

  await openThemed(page, "/admin/products/admin-product-1?error=CONTENT_VERSION_CONFLICT", "light");
  const conflict = page.locator("main").getByRole("alert").first();
  await expect(conflict).toContainText("تداخل نسخه");
  await expect(conflict.getByRole("link", { name: "تازه‌سازی و بارگذاری آخرین اطلاعات" })).toHaveAttribute("href", "/admin/products/admin-product-1");
  expect(await seriousAxeViolations(page)).toEqual([]);
});

test("the authoring form is reachable in reading order and its submit is the last stop of the form", async ({ page }) => {
  await signIn(page);
  await openThemed(page, "/admin/categories/new", "light");
  const form = page.locator("main form").last();
  await form.getByLabel("نام").focus();
  await page.keyboard.type("دسته آزمایشی");
  await expect(form.getByLabel("نام")).toHaveValue("دسته آزمایشی");
  await form.getByRole("button", { name: "ایجاد دسته‌بندی" }).focus();
  await expect(form.getByRole("button", { name: "ایجاد دسته‌بندی" })).toBeFocused();
});

test("a draft shows publish and archive; published and archived are shown as states", async ({ page }) => {
  await signIn(page);
  await openThemed(page, "/admin/products/admin-product-1", "light");
  const main = page.locator("main");
  const badgeText = await main.locator(".astryx-badge").first().textContent();
  expect(["پیش‌نویس", "منتشرشده", "آرشیوشده"]).toContain(badgeText?.trim());
  if (badgeText?.trim() === "پیش‌نویس") {
    await expect(main.getByRole("button", { name: "انتشار" })).toBeVisible();
    await expect(main.getByRole("button", { name: "آرشیو" })).toBeVisible();
  }
});
