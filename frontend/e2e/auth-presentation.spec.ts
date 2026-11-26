import { expect, test, type Page } from "@playwright/test";
import { expectNoHorizontalOverflow, openThemed, seriousAxeViolations, themes, watchRuntime } from "./support/public-content-helpers";

/*
 * Authentication presentation (OpenSpec change rebuild-ui-with-astryx, tasks
 * 6.1 and 6.3): login, registration and the authorization-failure screen in
 * both themes at the four required widths, keyboard-only sign-in, and the
 * failed sign-in paths (rejected credentials, unavailable service) that must
 * stay generic and must never be retried automatically. The mock server
 * rejects mobile 09000000000 (401) and answers 503 for 09111111111.
 */

const mockOrigin = "http://127.0.0.1:3199";
const pages = [
  { name: "login", path: "/auth/login", heading: "ورود به حساب", submit: "ورود", fields: ["شماره موبایل", "رمز عبور"] },
  { name: "register", path: "/auth/register", heading: "ایجاد حساب مشتری", submit: "ایجاد حساب", fields: ["نام نمایشی", "شماره موبایل", "رمز عبور", "ایمیل (اختیاری)", "نام شرکت (اختیاری)"] },
] as const;

/** Unique per project so parallel workers never share a mobile: 0900000xxxx is rejected, 0911111xxxx is unavailable, 0912000xxxx signs in. */
const mobileFor = (page: Page, prefix: string) => `${prefix}${String(page.viewportSize()?.width ?? 0).padStart(4, "0")}`;

async function loginAttempts(page: Page, mobile: string) {
  const response = await page.request.get(`${mockOrigin}/__fixtures/login-attempts?mobile=${mobile}`);
  return ((await response.json()) as { attempts: number }).attempts;
}

async function focusRing(page: Page) {
  return page.evaluate(() => {
    const element = document.activeElement as HTMLElement | null;
    if (!element || element === document.body) return null;
    const style = getComputedStyle(element);
    const own = style.outlineStyle !== "none" && parseFloat(style.outlineWidth) > 0;
    // Astryx draws its focus ring on the control wrapper or as a shadow.
    const shadow = style.boxShadow !== "none";
    const wrapper = element.closest("label, [class*='astryx']") as HTMLElement | null;
    const wrapperStyle = wrapper ? getComputedStyle(wrapper) : null;
    const wrapperRing = !!wrapperStyle && ((wrapperStyle.outlineStyle !== "none" && parseFloat(wrapperStyle.outlineWidth) > 0) || wrapperStyle.boxShadow !== "none");
    return { visible: own || shadow || wrapperRing, tag: element.tagName.toLowerCase() };
  });
}

for (const entry of pages) {
  for (const theme of themes) {
    test(`${entry.name} presents one heading, private metadata, named fields and no overflow in ${theme}`, async ({ page }) => {
      const problems = watchRuntime(page);
      await openThemed(page, entry.path, theme);
      await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
      await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
      await expect(page.locator("main")).toHaveCount(1);
      await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
      await expect(page.getByRole("heading", { level: 1, name: entry.heading, exact: true })).toBeVisible();
      for (const label of entry.fields) await expect(page.getByLabel(label, { exact: false }).first()).toBeVisible();
      await expect(page.getByRole("button", { name: entry.submit, exact: true })).toBeEnabled();
      // Controls keep the 44px minimum target.
      for (const control of [page.getByRole("button", { name: entry.submit, exact: true }), ...entry.fields.map((label) => page.getByLabel(label, { exact: false }).first())]) {
        // The native input sits inside the Astryx control box; that box carries the 44px target.
        const target = await control.evaluate((element) => {
          let node: HTMLElement | null = element as HTMLElement;
          for (let depth = 0; node && depth < 4; depth += 1, node = node.parentElement) {
            const rect = node.getBoundingClientRect();
            if (rect.height >= 44) return rect.height;
          }
          return 0;
        });
        expect(target, "the control must sit in a 44px target").toBeGreaterThanOrEqual(44);
      }
      await expectNoHorizontalOverflow(page, `${entry.path} (${theme})`);
      expect(await seriousAxeViolations(page), `${entry.path} axe (${theme})`).toEqual([]);
      expect(problems()).toEqual([]);
    });
  }

  test(`${entry.name} is reachable by keyboard in document order with a visible focus ring`, async ({ page }) => {
    await openThemed(page, entry.path, "light");
    const reached: string[] = [];
    for (let press = 0; press < 20; press += 1) {
      await page.keyboard.press("Tab");
      const ring = await focusRing(page);
      if (!ring) break;
      expect(ring.visible, `focus ring on the ${press + 1}th stop (${ring.tag})`).toBe(true);
      const name = await page.evaluate(() => {
        const element = document.activeElement as HTMLElement;
        return element.getAttribute("aria-label") ?? (element as HTMLInputElement).labels?.[0]?.textContent?.replace(/\s*\*\s*$/, "").trim() ?? element.textContent?.trim() ?? "";
      });
      reached.push(name);
      if (name === entry.submit) break;
    }
    // Every field is reached in order, then the submit action.
    let cursor = -1;
    for (const label of [...entry.fields, entry.submit]) {
      const index = reached.findIndex((name, at) => at > cursor && name.startsWith(label));
      expect(index, `${label} must be reached after the previous stop (${reached.join(" > ")})`).toBeGreaterThan(cursor);
      cursor = index;
    }
  });
}

test("keyboard-only sign-in submits with Enter and reaches the admin panel without a retry", async ({ page }) => {
  await openThemed(page, "/auth/login", "light");
  const mobile = mobileFor(page, "0912000");
  const before = await loginAttempts(page, mobile);
  await page.getByLabel("شماره موبایل").focus();
  await page.keyboard.type(mobile);
  await page.keyboard.press("Tab");
  await page.keyboard.type("strong-password");
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/admin$/);
  await expect(page.getByRole("heading", { name: "پنل مدیریت" })).toBeVisible();
  expect(await loginAttempts(page, mobile)).toBe(before + 1);
});

for (const [prefix, label] of [["0900000", "rejected credentials"], ["0911111", "an unavailable service"]] as const) {
  test(`${label} show one generic error and are not retried`, async ({ page }) => {
    await openThemed(page, "/auth/login", "light");
    const mobile = mobileFor(page, prefix);
    const before = await loginAttempts(page, mobile);
    await page.getByLabel("شماره موبایل").fill(mobile);
    await page.getByLabel("رمز عبور").fill("strong-password");
    await page.getByRole("button", { name: "ورود", exact: true }).click();
    await expect(page).toHaveURL(/\/auth\/login\?error=invalid$/);
    const alert = page.locator("main").getByRole("alert");
    await expect(alert).toContainText("شماره موبایل یا رمز عبور صحیح نیست.");
    // The message never says which part failed or whether the service was down.
    await expect(alert).not.toContainText(/سرویس|۵۰۳|503|وجود ندارد|غیرفعال|ادمین|unauthorized/i);
    await expect(page.getByRole("heading", { level: 1, name: "ورود به حساب", exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "ورود", exact: true })).toBeEnabled();
    expect(await loginAttempts(page, mobile)).toBe(before + 1);
    // Waiting must not trigger a second attempt either.
    await page.waitForTimeout(1500);
    expect(await loginAttempts(page, mobile)).toBe(before + 1);
    expect(await seriousAxeViolations(page)).toEqual([]);
    await expectNoHorizontalOverflow(page, `login error (${label})`);
  });
}

test("a created account is announced politely above the sign-in form", async ({ page }) => {
  await openThemed(page, "/auth/login?registered=1", "dark");
  const status = page.getByRole("status", { name: "موفق" });
  await expect(status).toContainText("حساب شما ساخته شد. اکنون وارد شوید.");
  await expect(page.locator("main").getByRole("alert")).toHaveCount(0);
  expect(await seriousAxeViolations(page)).toEqual([]);
});

test("registration shows one generic failure message", async ({ page }) => {
  await openThemed(page, "/auth/register?error=invalid", "light");
  await expect(page.locator("main").getByRole("alert")).toContainText("امکان ایجاد حساب با اطلاعات واردشده وجود ندارد.");
  await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
  await expectNoHorizontalOverflow(page, "register error");
});

for (const theme of themes) {
  test(`a signed-in customer reaching the admin panel sees a private authorization failure in ${theme}`, async ({ page }, testInfo) => {
    await page.context().addCookies([{ name: "fixture_customer", value: "1", url: String(testInfo.project.use.baseURL ?? "http://127.0.0.1:3100") }]);
    await openThemed(page, "/admin", theme);
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
    await expect(page.locator("main")).toHaveCount(1);
    const heading = page.getByRole("heading", { level: 1, name: "دسترسی مجاز نیست", exact: true });
    await expect(heading).toBeVisible();
    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
    await expect(page.getByText("این حساب مجوز ورود به پنل مدیریت را ندارد.", { exact: true })).toBeVisible();
    await expect(page.getByText(/ADMIN|capabilities|stack|403/)).toHaveCount(0);
    const logout = page.getByRole("button", { name: "خروج", exact: true });
    expect((await logout.boundingBox())?.height ?? 0).toBeGreaterThanOrEqual(44);
    await expectNoHorizontalOverflow(page, `authorization failure (${theme})`);
    expect(await seriousAxeViolations(page)).toEqual([]);
    // Secure logout from the keyboard returns to the sign-in page.
    await logout.focus();
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/\/auth\/login$/);
  });
}
