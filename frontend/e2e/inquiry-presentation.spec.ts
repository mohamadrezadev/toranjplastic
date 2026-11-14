import { expect, test, type Page } from "@playwright/test";
import { expectNoHorizontalOverflow, openThemed, seriousAxeViolations, themes, watchRuntime } from "./support/public-content-helpers";

/*
 * Inquiry presentation (OpenSpec change rebuild-ui-with-astryx, tasks 6.2 and
 * 6.3): the type chooser and the guided multi-step form in both themes at the
 * four required widths, keyboard-only completion, per-step validation,
 * preserved values, the pending state and the failed-submission paths. The mock
 * answers 400 for a description holding FIXTURE_INVALID, 503 for
 * FIXTURE_UNAVAILABLE and replies after 1.5 s for FIXTURE_SLOW; it counts the
 * attempts per description so "no automatic retry" is measured, not assumed.
 */

const mockOrigin = "http://127.0.0.1:3199";

async function signInCustomer(page: Page) {
  await page.context().addCookies([
    { name: "toranj_session", value: "customer-presentation", domain: "127.0.0.1", path: "/", httpOnly: true, sameSite: "Lax" },
    { name: "toranj_csrf", value: "fixture-csrf", domain: "127.0.0.1", path: "/", sameSite: "Lax" },
  ]);
}

const marker = (page: Page, name: string) => `${name}-${page.viewportSize()?.width ?? 0}`;

async function attempts(page: Page, description: string) {
  const response = await page.request.get(`${mockOrigin}/__fixtures/inquiry-attempts?description=${encodeURIComponent(description)}`);
  return ((await response.json()) as { attempts: number }).attempts;
}

const choices = [
  { type: "product", title: "استعلام محصول", steps: 3 },
  { type: "injection", title: "خدمات تزریق پلاستیک", steps: 4 },
  { type: "material", title: "تأمین مواد اولیه", steps: 4 },
  { type: "contact", title: "تماس عمومی", steps: 0 },
] as const;

const progressStatus = (page: Page) => page.getByRole("region", { name: "پیشرفت فرم درخواست" }).getByRole("status");

/** Walks product steps 1 and 2 with the pointer and lands on the final step. */
async function reachProductFinalStep(page: Page) {
  await page.getByLabel("محصول *", { exact: true }).selectOption("product-1");
  await page.getByRole("button", { name: "مرحله بعد" }).click();
  await page.getByLabel("مقدار تقریبی (اختیاری)").fill("100");
  await page.getByRole("button", { name: "مرحله بعد" }).click();
  await expect(progressStatus(page)).toContainText("مرحله 3 از 3");
}

for (const theme of themes) {
  test(`the chooser offers four named links, one heading and no overflow in ${theme}`, async ({ page }) => {
    const problems = watchRuntime(page);
    await signInCustomer(page);
    await openThemed(page, "/inquiry", theme);
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
    await expect(page.locator("main")).toHaveCount(1);
    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
    await expect(page.getByRole("heading", { level: 1, name: "چه نوع درخواستی دارید؟", exact: true })).toBeVisible();
    for (const choice of choices) {
      const link = page.getByRole("link", { name: choice.title, exact: true });
      await expect(link).toHaveAttribute("href", `/inquiry/${choice.type}`);
      // The whole card is the pointer target: it is at least 44px tall and wide.
      const card = link.locator("xpath=ancestor::*[contains(@class,'astryx-card')][1]");
      const box = (await card.boundingBox())!;
      expect(box.height).toBeGreaterThanOrEqual(44);
      expect(box.width).toBeGreaterThanOrEqual(44);
    }
    await expectNoHorizontalOverflow(page, `/inquiry (${theme})`);
    expect(await seriousAxeViolations(page), `/inquiry axe (${theme})`).toEqual([]);
    expect(problems()).toEqual([]);
  });
}

test("the chooser is reachable by keyboard in order and a card click opens its form", async ({ page }) => {
  await signInCustomer(page);
  await openThemed(page, "/inquiry", "light");
  const reached: string[] = [];
  for (let press = 0; press < 40 && reached.length < 4; press += 1) {
    await page.keyboard.press("Tab");
    const info = await page.evaluate(() => {
      const element = document.activeElement as HTMLAnchorElement | null;
      if (!element || element.tagName !== "A" || !element.closest("main section")) return null;
      const outline = getComputedStyle(element.closest("[class*='astryx-card']") ?? element);
      return { href: element.getAttribute("href"), ring: outline.outlineStyle !== "none" && parseFloat(outline.outlineWidth) > 0 };
    });
    if (info?.href?.startsWith("/inquiry/")) {
      expect(info.ring, "the focused card shows a visible ring").toBe(true);
      reached.push(info.href);
    }
  }
  expect(reached).toEqual(choices.map((choice) => `/inquiry/${choice.type}`));
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/inquiry\/contact$/);
  await page.goBack();
  const card = page.getByRole("link", { name: "خدمات تزریق پلاستیک", exact: true }).locator("xpath=ancestor::*[contains(@class,'astryx-card')][1]");
  await card.click({ position: { x: 24, y: 24 } });
  await expect(page).toHaveURL(/\/inquiry\/injection$/);
});

// The material form lists materials through the public API, whose first page the mock answers with the
// designed 503 of the /materials error fixture, so the browser covers the other three forms; the material
// form is covered by the unit tests.
for (const choice of choices.filter((entry) => entry.type !== "material")) {
  test(`${choice.type}: the form shows a stepper of ${choice.steps} steps, the status line and a way back in both themes`, async ({ page }) => {
    const problems = watchRuntime(page);
    await signInCustomer(page);
    for (const theme of themes) {
      await openThemed(page, `/inquiry/${choice.type}`, theme);
      await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
      await expect(page.getByRole("button", { name: "بازگشت به انتخاب نوع درخواست" }).or(page.getByRole("link", { name: "بازگشت به انتخاب نوع درخواست" }))).toHaveAttribute("href", "/inquiry");
      const stepper = page.getByRole("list", { name: "مراحل فرم درخواست" });
      if (choice.steps === 0) {
        await expect(stepper).toHaveCount(0);
        await expect(progressStatus(page)).toContainText("مرحله 1 از 1");
        await expect(page.getByRole("button", { name: "ثبت درخواست" })).toBeEnabled();
      } else {
        await expect(stepper.getByRole("listitem")).toHaveCount(choice.steps);
        await expect(progressStatus(page)).toContainText(`مرحله 1 از ${choice.steps}`);
        await expect(page.getByRole("button", { name: "مرحله بعد" })).toBeVisible();
        await expect(page.getByRole("button", { name: "مرحله قبل" })).toHaveCount(0);
      }
      await expectNoHorizontalOverflow(page, `/inquiry/${choice.type} (${theme})`);
      expect(await seriousAxeViolations(page), `/inquiry/${choice.type} axe (${theme})`).toEqual([]);
    }
    expect(problems()).toEqual([]);
  });
}

test("required fields block the step, focus the first invalid field and keep entered values when moving back", async ({ page }) => {
  await signInCustomer(page);
  await openThemed(page, "/inquiry/injection", "light");
  await page.getByRole("button", { name: "مرحله بعد" }).click();
  await expect(progressStatus(page)).toContainText("مرحله 1 از 4");
  await expect(page.getByLabel(/شرح قطعه/)).toBeFocused();
  await page.getByLabel(/شرح قطعه/).fill("قطعه آزمون");
  await page.getByRole("button", { name: "مرحله بعد" }).click();
  await expect(progressStatus(page)).toContainText("مرحله 2 از 4");
  await expect(page.getByRole("group", { name: /اطلاعات فنی/ })).toBeVisible();
  await page.getByLabel(/وضعیت قالب/).fill("قالب موجود است");
  await page.getByRole("button", { name: "مرحله قبل" }).click();
  await expect(progressStatus(page)).toContainText("مرحله 1 از 4");
  await expect(page.getByLabel(/شرح قطعه/)).toHaveValue("قطعه آزمون");
  await page.getByRole("button", { name: "مرحله بعد" }).click();
  await expect(page.getByLabel(/وضعیت قالب/)).toHaveValue("قالب موجود است");
  // The stepper marks the first step complete once the form moves on.
  await expect(page.getByRole("list", { name: "مراحل فرم درخواست" }).getByRole("listitem").first()).toHaveAttribute("data-progress", "completed");
});

test("the whole product form can be completed and submitted with the keyboard alone", async ({ page }) => {
  await signInCustomer(page);
  await openThemed(page, "/inquiry/product", "light");
  // Step 1: choose the product with the arrow keys on the focused select.
  await page.getByLabel("محصول *", { exact: true }).focus();
  await page.keyboard.press("ArrowDown");
  await expect(page.getByLabel("محصول *", { exact: true })).toHaveValue("product-1");
  await page.keyboard.press("Tab");
  await expect(page.getByRole("button", { name: "مرحله بعد" })).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(progressStatus(page)).toContainText("مرحله 2 از 3");
  // Focus moves to the new step's legend, so the next Tab reaches its first field.
  await page.keyboard.press("Tab");
  await page.keyboard.type("100");
  await page.keyboard.press("Tab");
  await page.keyboard.type("تهران");
  await page.getByRole("button", { name: "مرحله بعد" }).focus();
  await page.keyboard.press("Enter");
  await expect(progressStatus(page)).toContainText("مرحله 3 از 3");
  await page.keyboard.press("Tab");
  await page.keyboard.type("درخواست آزمون با کیبورد");
  // Tab order on the last step: the previous-step action, then the submit action.
  await page.keyboard.press("Tab");
  await expect(page.getByRole("button", { name: "مرحله قبل" })).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(page.getByRole("button", { name: "ثبت درخواست" })).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/account\/inquiries\/inquiry-1\?created=1$/);
});

test("a submission in progress disables the action and is sent once", async ({ page }) => {
  test.setTimeout(60_000);
  await signInCustomer(page);
  await openThemed(page, "/inquiry/product", "light");
  const description = marker(page, "FIXTURE_SLOW");
  await reachProductFinalStep(page);
  await page.getByLabel("توضیحات تکمیلی").fill(description);
  const submit = page.getByRole("button", { name: /ثبت درخواست|در حال ثبت/ });
  await submit.click();
  await expect(submit).toBeDisabled();
  await expect(submit).toContainText("در حال ثبت");
  // A second click while pending changes nothing.
  await submit.click({ force: true, trial: false }).catch(() => undefined);
  await expect(page).toHaveURL(/\/account\/inquiries\/inquiry-1\?created=1$/);
  expect(await attempts(page, description)).toBe(1);
});

for (const [code, message, label] of [
  ["FIXTURE_INVALID", "اطلاعات فرم کامل یا معتبر نیست. لطفاً فیلدهای ضروری را بررسی کنید.", "validation failure (400)"],
  ["FIXTURE_UNAVAILABLE", "ثبت درخواست فعلاً ممکن نیست. کمی بعد دوباره تلاش کنید.", "unavailable service (503)"],
] as const) {
  test(`a ${label} shows one generic message, re-enables the action and is not retried`, async ({ page }) => {
    test.setTimeout(60_000);
    await signInCustomer(page);
    await openThemed(page, "/inquiry/product", "dark");
    const description = marker(page, code);
    await reachProductFinalStep(page);
    await page.getByLabel("توضیحات تکمیلی").fill(description);
    await page.getByRole("button", { name: "ثبت درخواست" }).click();
    const alert = page.locator("main").getByRole("alert");
    await expect(alert).toContainText(message);
    await expect(alert).not.toContainText(/503|400|سرور|stack|Bad request|Service unavailable/i);
    await expect(page.getByRole("button", { name: "ثبت درخواست" })).toBeEnabled();
    await expect(page).toHaveURL(/\/inquiry\/product$/);
    expect(await attempts(page, description)).toBe(1);
    await page.waitForTimeout(1500);
    expect(await attempts(page, description)).toBe(1);
    expect(await seriousAxeViolations(page)).toEqual([]);
    await expectNoHorizontalOverflow(page, `inquiry ${label}`);
    // The customer stays on the final step and can fix and resubmit.
    await expect(progressStatus(page)).toContainText("مرحله 3 از 3");
    // Nothing the customer typed is lost by the failure: this step and the earlier ones keep their values.
    await expect(page.getByLabel("توضیحات تکمیلی")).toHaveValue(description);
    await page.getByRole("button", { name: "مرحله قبل" }).click();
    await expect(page.getByLabel("مقدار تقریبی (اختیاری)")).toHaveValue("100");
    await page.getByRole("button", { name: "مرحله قبل" }).click();
    await expect(page.getByLabel("محصول *", { exact: true })).toHaveValue("product-1");
  });
}
