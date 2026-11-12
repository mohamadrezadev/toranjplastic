import { expect, test, type Locator, type Page } from "@playwright/test";

type Theme = "light" | "dark";
const themes: Theme[] = ["light", "dark"];

async function applyColorScheme(page: Page, theme: Theme) {
  await page.emulateMedia({ colorScheme: theme });
}

async function signInAsCustomer(page: Page, suffix: string) {
  await page.context().addCookies([
    { name: "toranj_session", value: `customer-${suffix}`, domain: "127.0.0.1", path: "/", httpOnly: true, sameSite: "Lax" },
    { name: "toranj_csrf", value: "fixture-csrf", domain: "127.0.0.1", path: "/", sameSite: "Lax" },
  ]);
}

async function expectRtlPrivatePage(page: Page, theme: Theme) {
  await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
  await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
  expect(await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)).toBe(false);
}

/** Presses Tab until `target` has focus, failing after a bounded number of stops. */
async function tabTo(page: Page, target: Locator, maxStops = 40) {
  for (let stop = 0; stop < maxStops; stop += 1) {
    if (await target.evaluate((element) => element === document.activeElement)) return;
    await page.keyboard.press("Tab");
  }
  throw new Error("Keyboard focus did not reach the expected control.");
}

function countServerActionPosts(page: Page) {
  const posts: string[] = [];
  page.on("request", (request) => {
    if (request.method() === "POST" && request.headers()["next-action"]) posts.push(request.url());
  });
  return posts;
}

test.describe("Astryx authentication surfaces", () => {
  test("login and registration render Astryx feedback and actions in both themes", async ({ page }) => {
    for (const theme of themes) {
      await applyColorScheme(page, theme);
      await page.goto("/auth/login?error=invalid");
      await expectRtlPrivatePage(page, theme);
      await expect(page.getByRole("heading", { level: 1, name: "ورود به حساب" })).toBeVisible();
      await expect(page.getByRole("alert", { name: "خطا" })).toContainText("شماره موبایل یا رمز عبور صحیح نیست.");
      await expect(page.getByLabel("شماره موبایل")).toHaveAttribute("dir", "ltr");
      const submit = page.getByRole("button", { name: "ورود" });
      expect((await submit.boundingBox())?.height ?? 0).toBeGreaterThanOrEqual(44);

      await page.goto("/auth/login?registered=1");
      await expect(page.getByRole("status").filter({ hasText: /\S/ })).toContainText("حساب شما ساخته شد");
      await expect(page.getByRole("alert", { name: "خطا" })).toHaveCount(0);

      await page.goto("/auth/register?error=invalid");
      await expectRtlPrivatePage(page, theme);
      await expect(page.getByRole("alert", { name: "خطا" })).toContainText("امکان ایجاد حساب با اطلاعات واردشده وجود ندارد.");
      await expect(page.getByLabel(/نقش/)).toHaveCount(0);
      await expect(page.getByRole("link", { name: "وارد شوید" })).toHaveAttribute("href", "/auth/login");
    }
  });

  test("a customer signs in with the keyboard only and reaches the requested inquiry", async ({ page }) => {
    await page.goto("/auth/login?next=/inquiry");
    await tabTo(page, page.getByLabel("شماره موبایل"));
    await page.keyboard.type("09144444444");
    await page.keyboard.press("Tab");
    await expect(page.getByLabel("رمز عبور")).toBeFocused();
    await page.keyboard.type("strong-password");
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/\/inquiry$/);
    await expect(page.getByRole("heading", { level: 1, name: "چه نوع درخواستی دارید؟" })).toBeVisible();
  });

  test("authorization failure shows a private forbidden screen with a keyboard-operable secure logout", async ({ page }) => {
    for (const theme of themes) {
      await applyColorScheme(page, theme);
      await page.context().clearCookies();
      await page.context().addCookies([{ name: "fixture_customer", value: "1", domain: "127.0.0.1", path: "/" }]);
      const response = await page.goto("/admin");
      expect(response?.headers()["cache-control"] ?? "").toMatch(/no-store|private/);
      await expectRtlPrivatePage(page, theme);
      await expect(page.getByRole("heading", { level: 1, name: "دسترسی مجاز نیست" })).toBeVisible();
      await expect(page.getByText("این حساب مجوز ورود به پنل مدیریت را ندارد.")).toBeVisible();
      await expect(page.getByRole("navigation", { name: /مدیریت/ })).toHaveCount(0);
      const logout = page.getByRole("button", { name: "خروج" });
      await tabTo(page, logout);
      await page.keyboard.press("Enter");
      await expect(page).toHaveURL(/\/auth\/login$/);
    }
  });
});

test.describe("Astryx inquiry surfaces", () => {
  test("inquiry type selection is a keyboard-reachable card list in both themes", async ({ page }, testInfo) => {
    await signInAsCustomer(page, `selection-${testInfo.project.name}`);
    for (const theme of themes) {
      await applyColorScheme(page, theme);
      await page.goto("/inquiry");
      await expectRtlPrivatePage(page, theme);
      const choices = page.getByRole("main").getByRole("listitem");
      await expect(choices).toHaveCount(4);
      for (const [name, href] of [["استعلام محصول", "/inquiry/product"], ["خدمات تزریق پلاستیک", "/inquiry/injection"], ["تأمین مواد اولیه", "/inquiry/material"], ["تماس عمومی", "/inquiry/contact"]] as const) {
        await expect(page.getByRole("link", { name })).toHaveAttribute("href", href);
      }
      const cardBoxes = await choices.evaluateAll((items) => items.map((item) => item.getBoundingClientRect().height));
      for (const height of cardBoxes) expect(height).toBeGreaterThanOrEqual(44);
    }
    const contact = page.getByRole("link", { name: "تماس عمومی" });
    await tabTo(page, contact);
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/\/inquiry\/contact$/);
  });

  test("the injection wizard validates per step, keeps values and reports a validation failure without retrying", async ({ page }, testInfo) => {
    await signInAsCustomer(page, `injection-${testInfo.project.name}`);
    for (const theme of themes) {
      await applyColorScheme(page, theme);
      await page.goto("/inquiry/injection");
      await expectRtlPrivatePage(page, theme);
      const status = page.getByRole("status").filter({ hasText: /مرحله/ });
      const steps = page.getByRole("list", { name: "مراحل فرم درخواست" });
      const partDescription = page.getByRole("textbox", { name: /شرح قطعه/ });
      await expect(status).toContainText("مرحله 1 از 4");
      await expect(steps.locator('[aria-current="step"]')).toContainText("موضوع درخواست");

      const next = page.getByRole("button", { name: "مرحله بعد" });
      await tabTo(page, next);
      await page.keyboard.press("Enter");
      await expect(status).toContainText("مرحله 1 از 4");
      await expect(partDescription).toBeFocused();
      await expect(partDescription).toHaveJSProperty("validity.valid", false);

      await page.keyboard.type("قطعهٔ آزمون");
      await tabTo(page, next);
      await page.keyboard.press("Enter");
      await expect(status).toContainText("مرحله 2 از 4");
      await expect(page.getByRole("group", { name: /اطلاعات فنی/ }).locator("legend")).toBeFocused();
      await expect(steps.locator('[aria-current="step"]')).toContainText("اطلاعات فنی");
      expect(await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)).toBe(false);

      await page.getByRole("textbox", { name: "رنگ در صورت اطلاع" }).fill("سفید");
      await page.getByRole("button", { name: "مرحله قبل" }).click();
      await expect(partDescription).toHaveValue("قطعهٔ آزمون");
      await page.getByRole("button", { name: "مرحله بعد" }).click();
      await expect(page.getByRole("textbox", { name: "رنگ در صورت اطلاع" })).toHaveValue("سفید");
      await page.getByRole("button", { name: "مرحله بعد" }).click();
      await expect(status).toContainText("مرحله 3 از 4");
      await page.getByRole("button", { name: "مرحله بعد" }).click();
      await expect(status).toContainText("مرحله 4 از 4");
      const description = page.getByRole("textbox", { name: "توضیحات تکمیلی" });
      await description.fill("شرح آزمون");

      const posts = countServerActionPosts(page);
      const submit = page.getByRole("button", { name: "ثبت درخواست" });
      await submit.focus();
      await page.keyboard.press("Enter");
      await expect(page.getByRole("alert", { name: "خطا" })).toContainText("اطلاعات فرم کامل یا معتبر نیست.");
      await expect(page).toHaveURL(/\/inquiry\/injection$/);
      await expect(description).toHaveValue("شرح آزمون");
      await expect(submit).toBeEnabled();
      await page.waitForTimeout(500);
      expect(posts).toHaveLength(1);
      expect(await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)).toBe(false);
    }
  });

  test("the contact form reports a service failure once and keeps the message", async ({ page }, testInfo) => {
    await signInAsCustomer(page, `contact-${testInfo.project.name}`);
    for (const theme of themes) {
      await applyColorScheme(page, theme);
      await page.goto("/inquiry/contact");
      await expectRtlPrivatePage(page, theme);
      await expect(page.getByRole("list", { name: "مراحل فرم درخواست" })).toHaveCount(0);
      const message = page.getByLabel(/متن درخواست/);
      await tabTo(page, message);
      await page.keyboard.type("پیام آزمون");
      const posts = countServerActionPosts(page);
      await page.keyboard.press("Tab");
      await expect(page.getByRole("button", { name: "ثبت درخواست" })).toBeFocused();
      await page.keyboard.press("Enter");
      await expect(page.getByRole("alert", { name: "خطا" })).toContainText("ثبت درخواست فعلاً ممکن نیست.");
      await expect(message).toHaveValue("پیام آزمون");
      await page.waitForTimeout(500);
      expect(posts).toHaveLength(1);
    }
  });
});
