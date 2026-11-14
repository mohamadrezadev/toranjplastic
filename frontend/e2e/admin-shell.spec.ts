import { expect, test, type Page } from "@playwright/test";
import { expectNoHorizontalOverflow, openThemed, seriousAxeViolations, themes, watchRuntime } from "./support/public-content-helpers";

/*
 * Admin shell (OpenSpec change rebuild-ui-with-astryx, task 8.1): one main
 * landmark, the skip link, capability-aware navigation, breadcrumbs, secure
 * logout and the phone/tablet menu, in both themes at the four required
 * widths. The mock derives the role from the session cookie prefix
 * (admin: any other value, sales-, operator-).
 */

let counter = 0;
async function signIn(page: Page, prefix = "admin-shell") {
  const session = prefix === "admin-shell" ? "fixture-session" : `${prefix}-${page.viewportSize()?.width ?? 0}-${(counter += 1)}`;
  await page.context().addCookies([
    { name: "toranj_session", value: session, httpOnly: true },
    { name: "toranj_csrf", value: "fixture-csrf", httpOnly: false },
  ].map((cookie) => ({ ...cookie, domain: "127.0.0.1", path: "/", sameSite: "Lax" as const })));
}

const isPhoneFrame = (page: Page) => (page.viewportSize()?.width ?? 1280) <= 1024;
const sidebar = (page: Page) => page.getByRole("complementary", { name: "ناوبری پنل مدیریت" });
const phoneMenu = (page: Page) => page.locator("details").filter({ hasText: "منو" });

/** The destinations list that is on screen: the sidebar on desktop, the opened menu on phone and tablet. */
async function visibleNav(page: Page) {
  if (isPhoneFrame(page)) {
    const menu = phoneMenu(page);
    if (!(await menu.evaluate((node) => (node as HTMLDetailsElement).open))) await menu.locator("summary").click();
    return menu.getByRole("navigation", { name: "بخش‌های پنل مدیریت" });
  }
  return sidebar(page).getByRole("navigation", { name: "بخش‌های پنل مدیریت" });
}

const routes = [
  { path: "/admin/inquiries", heading: "کارتابل استعلام‌ها", current: "استعلام‌ها", content: true },
  { path: "/admin/products", heading: "محصولات", current: "محصولات", content: true },
] as const;

for (const route of routes) {
  for (const theme of themes) {
    test(`${route.path} keeps the private admin shell, one main and no overflow in ${theme}`, async ({ page }) => {
      const problems = watchRuntime(page);
      await signIn(page);
      await openThemed(page, route.path, theme);
      await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
      await expect(page.locator("main")).toHaveCount(1);
      await expect(page.locator("main")).toHaveAttribute("id", "admin-content");
      await expect(page.getByRole("heading", { level: 1, name: route.heading, exact: true })).toBeVisible();
      const crumbs = page.getByRole("navigation", { name: "مسیر صفحه" });
      await expect(crumbs).toBeVisible();
      await expect(crumbs.locator('[aria-current="page"]')).toHaveCount(1);
      await expect(crumbs.getByRole("link", { name: "مدیریت", exact: true })).toHaveAttribute("href", "/admin");
      await expect((await visibleNav(page)).getByRole("link", { name: route.current, exact: true })).toHaveAttribute("aria-current", "page");
      if (route.content) await expectNoHorizontalOverflow(page, `${route.path} (${theme})`);
      if (route.content) expect(await seriousAxeViolations(page), `${route.path} axe (${theme})`).toEqual([]);
      expect(problems()).toEqual([]);
    });
  }
}

test("the frame follows the viewport: a sidebar on desktop, a menu on phone and tablet", async ({ page }) => {
  await signIn(page);
  await openThemed(page, "/admin", "light");
  if (isPhoneFrame(page)) {
    await expect(sidebar(page)).toBeHidden();
    await expect(phoneMenu(page).locator("summary")).toBeVisible();
    const box = await phoneMenu(page).locator("summary").boundingBox();
    expect(box?.height ?? 0).toBeGreaterThanOrEqual(44);
  } else {
    await expect(sidebar(page)).toBeVisible();
    await expect(phoneMenu(page)).toBeHidden();
  }
  await expectNoHorizontalOverflow(page, "admin frame");
});

test("the skip link is the first stop and moves to the main content", async ({ page }) => {
  await signIn(page);
  await openThemed(page, "/admin/inquiries", "light");
  await page.keyboard.press("Tab");
  const skip = page.getByRole("link", { name: "رفتن به محتوای اصلی" });
  await expect(skip).toBeFocused();
  await expect(skip).toBeInViewport();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/#admin-content$/);
  const reached = await page.evaluate(() => document.getElementById("admin-content")?.contains(document.activeElement) || document.activeElement?.id === "admin-content" || location.hash === "#admin-content");
  expect(reached).toBe(true);
});

test("the phone menu opens from the keyboard, closes with Escape and after navigating, and exposes secure logout", async ({ page }) => {
  test.skip(!isPhoneFrame(page), "the phone and tablet menu does not exist on desktop");
  await signIn(page);
  await openThemed(page, "/admin/inquiries", "light");
  const menu = phoneMenu(page);
  const summary = menu.locator("summary");
  await summary.focus();
  await page.keyboard.press("Enter");
  await expect(menu).toHaveJSProperty("open", true);
  await expect(menu.getByRole("button", { name: "خروج امن" })).toBeVisible();
  await expect(menu.getByRole("link").first()).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(menu).toHaveJSProperty("open", false);
  await expect(summary).toBeFocused();

  await summary.click();
  await expect(menu).toHaveJSProperty("open", true);
  await page.locator("header").first().click({ position: { x: (page.viewportSize()?.width ?? 360) / 2, y: 2 } });
  await expect(menu).toHaveJSProperty("open", false);

  await summary.click();
  await menu.getByRole("link", { name: "محصولات", exact: true }).click();
  await expect(page).toHaveURL(/\/admin\/products$/);
  await expect(page.locator("details").filter({ hasText: "منو" })).toHaveJSProperty("open", false);
});

test("logout is reachable and ends the session", async ({ page }) => {
  await signIn(page);
  await openThemed(page, "/admin", "light");
  if (isPhoneFrame(page)) await phoneMenu(page).locator("summary").click();
  const logout = page.locator(isPhoneFrame(page) ? "details" : "aside").getByRole("button", { name: "خروج امن" });
  await expect(logout).toBeVisible();
  await logout.click();
  await expect(page).not.toHaveURL(/\/admin(\/|$)/, { timeout: 15_000 });
});

test("Sales sees only the inquiry destinations and Operator no staff or inquiry links", async ({ page }) => {
  await signIn(page, "sales");
  await openThemed(page, "/admin/inquiries", "light");
  const salesNav = await visibleNav(page);
  await expect(salesNav.getByRole("link", { name: "استعلام‌ها", exact: true })).toBeVisible();
  for (const hidden of ["محصولات", "رسانه‌ها", "کاربران سازمانی"]) await expect(salesNav.getByRole("link", { name: hidden, exact: true })).toHaveCount(0);

  await page.context().clearCookies();
  await signIn(page, "operator");
  await openThemed(page, "/admin/products", "light");
  const operatorNav = await visibleNav(page);
  await expect(operatorNav.getByRole("link", { name: "محصولات", exact: true })).toBeVisible();
  for (const hidden of ["استعلام‌ها", "کاربران سازمانی"]) await expect(operatorNav.getByRole("link", { name: hidden, exact: true })).toHaveCount(0);
});

test("a route without capability shows the bounded error with one heading and a way back", async ({ page }) => {
  await signIn(page, "sales");
  await openThemed(page, "/admin/products", "light");
  await expect(page.getByRole("heading", { level: 1, name: "امکان نمایش این بخش وجود ندارد", exact: true })).toHaveCount(1);
  await expect(page.locator("main")).toHaveCount(1);
  await expect(page.locator("main").getByRole("alert")).not.toContainText(/stack|403|127\.0\.0\.1|postgres/i);
  await expect(page.getByRole("button", { name: "تلاش دوباره" })).toBeVisible();
  await expect(page.getByRole("link", { name: "بازگشت به پنل" })).toHaveAttribute("href", "/admin");
  await expectNoHorizontalOverflow(page, "admin error");
  expect(await seriousAxeViolations(page)).toEqual([]);
});

test("an unauthenticated visit is redirected to sign-in without any admin shell content", async ({ page }) => {
  await page.goto("/admin/inquiries");
  await expect(page).toHaveURL(/\/auth\/login/, { timeout: 15_000 });
  await expect(page.getByRole("navigation", { name: "بخش‌های پنل مدیریت" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "خروج امن" })).toHaveCount(0);
});
