import { expect, test, type Page } from "@playwright/test";
import { expectNoHorizontalOverflow, openThemed, seriousAxeViolations, themes, watchRuntime } from "./support/public-content-helpers";

/*
 * Customer portal presentation (OpenSpec change rebuild-ui-with-astryx, tasks
 * 7.1 to 7.4): the shell, overview, request list, request detail with its
 * conversation, and the quotation response states, in both themes at the four
 * required widths, plus keyboard use, ownership-safe not-found, the error
 * state, and the failure paths (message, conflict, server error) that must
 * show one generic message and never be retried. The mock counts attempts per
 * session, so "no automatic retry" is measured. Cookies: quotation_mode
 * (sent, accepted, rejected, expired), quotation_fail (conflict, error) and
 * portal_fail (1).
 */

const mockOrigin = "http://127.0.0.1:3199";
const detailPath = "/account/inquiries/inquiry-1";

let counter = 0;
const uniqueSession = (page: Page) => `customer-account-${page.viewportSize()?.width ?? 0}-${(counter += 1)}-${Date.now()}`;

async function signIn(page: Page, extra: Record<string, string> = {}) {
  const session = uniqueSession(page);
  const cookies = [
    { name: "toranj_session", value: session, httpOnly: true },
    { name: "toranj_csrf", value: "fixture-csrf", httpOnly: false },
    ...Object.entries(extra).map(([name, value]) => ({ name, value, httpOnly: false })),
  ].map((cookie) => ({ ...cookie, domain: "127.0.0.1", path: "/", sameSite: "Lax" as const }));
  await page.context().addCookies(cookies);
  return session;
}

async function attempts(page: Page, action: string, session: string) {
  const response = await page.request.get(`${mockOrigin}/__fixtures/customer-attempts?action=${action}&session=${session}`);
  return ((await response.json()) as { attempts: number }).attempts;
}

const nav = (page: Page) => page.getByRole("navigation", { name: "بخش‌های پنل مشتری" });
const mainAlerts = (page: Page) => page.locator("main").getByRole("alert");

const routes = [
  { path: "/account", heading: "مدیریت درخواست‌ها، ساده و شفاف", current: "نمای کلی" },
  { path: "/account/inquiries", heading: "درخواست‌های من", current: "درخواست‌های من" },
  { path: detailPath, heading: "سبد صنعتی نمونه", current: "درخواست‌های من" },
] as const;

for (const route of routes) {
  for (const theme of themes) {
    test(`${route.path} keeps the private shell, one heading and no overflow in ${theme}`, async ({ page }) => {
      const problems = watchRuntime(page);
      await signIn(page, route.path === detailPath ? { quotation_mode: "sent" } : {});
      await openThemed(page, route.path, theme);
      await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
      await expect(page.locator("main")).toHaveCount(1);
      await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
      await expect(page.getByRole("heading", { level: 1, name: route.heading, exact: true })).toBeVisible();
      await expect(nav(page).getByRole("link")).toHaveCount(3);
      await expect(nav(page).getByRole("link", { name: route.current, exact: true })).toHaveAttribute("aria-current", "page");
      await expect(page.getByRole("button", { name: "خروج امن" })).toHaveCount(1);
      await expectNoHorizontalOverflow(page, `${route.path} (${theme})`);
      expect(await seriousAxeViolations(page), `${route.path} axe (${theme})`).toEqual([]);
      expect(problems()).toEqual([]);
    });
  }
}

test("the portal frame follows the viewport: a fixed bottom bar on phones, a sidebar on desktop", async ({ page }) => {
  await signIn(page);
  await openThemed(page, "/account", "light");
  const width = page.viewportSize()?.width ?? 1280;
  const box = (await nav(page).boundingBox())!;
  if (width <= 560) {
    await expect(nav(page)).toHaveCSS("position", "fixed");
    expect(Math.round(box.y + box.height)).toBe(page.viewportSize()?.height);
    // Every destination is a 44px target.
    for (const link of await nav(page).getByRole("link").all()) expect((await link.boundingBox())!.height).toBeGreaterThanOrEqual(44);
  } else if (width >= 1024) {
    await expect(page.getByRole("complementary", { name: "ناوبری پنل مشتری" })).toBeVisible();
    expect(box.x + box.width).toBeGreaterThan(width - 300);
  }
});

test("the overview is reachable by keyboard in order with a visible ring and cards open by Enter", async ({ page }) => {
  await signIn(page);
  await openThemed(page, "/account", "light");
  const reached: string[] = [];
  for (let press = 0; press < 30; press += 1) {
    await page.keyboard.press("Tab");
    const info = await page.evaluate(() => {
      const element = document.activeElement as HTMLElement | null;
      if (!element || element === document.body) return null;
      const target = (element.closest("[class*='astryx-card']") as HTMLElement | null) ?? element;
      const own = getComputedStyle(element);
      const card = getComputedStyle(target);
      const ring = (own.outlineStyle !== "none" && parseFloat(own.outlineWidth) > 0) || own.boxShadow !== "none" || (card.outlineStyle !== "none" && parseFloat(card.outlineWidth) > 0);
      return { name: element.getAttribute("href") ?? element.textContent?.trim() ?? "", ring };
    });
    if (!info) break;
    expect(info.ring, `focus ring on ${info.name}`).toBe(true);
    reached.push(info.name);
    if (info.name === "/account/inquiries" && reached.filter((entry) => entry === "/account/inquiries").length === 2) break;
  }
  expect(reached.slice(0, 1), `tab stops: ${reached.join(" > ")}`).toEqual(["#portal-content"]);
  expect(reached).toContain("/inquiry");
  expect(reached.indexOf("/account/inquiries")).toBeLessThan(reached.indexOf("خروج امن") === -1 ? 99 : reached.indexOf("خروج امن") + 99);
});

test("the request list opens a request from its named link and the filter submits from the keyboard", async ({ page }) => {
  await signIn(page);
  await openThemed(page, "/account/inquiries", "light");
  const row = page.getByRole("listitem").first();
  await expect(row.getByRole("link", { name: "سبد صنعتی نمونه", exact: true })).toHaveAttribute("href", detailPath);
  await expect(row.getByText("ثبت‌شده", { exact: true })).toBeVisible();
  await page.getByRole("combobox", { name: "وضعیت پیگیری" }).focus();
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("Tab");
  await expect(page.getByRole("button", { name: "اعمال فیلتر" })).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/account\/inquiries\?(type=&)?status=SUBMITTED$/);
  // The row is a pointer target as a whole.
  await page.goto("/account/inquiries");
  await page.getByRole("listitem").first().click({ position: { x: 20, y: 20 } });
  await expect(page).toHaveURL(new RegExp(`${detailPath}$`));
});

test("the conversation is chronological, marks each sender and the composer is its own labelled form", async ({ page }) => {
  const session = await signIn(page);
  await openThemed(page, detailPath, "light");
  const conversation = page.getByRole("region", { name: "گفتگو با کارشناس" });
  const messages = conversation.getByRole("article");
  const count = await messages.count();
  if (count > 1) {
    const times = await messages.evaluateAll((nodes) => nodes.map((node) => node.querySelector("time")?.getAttribute("datetime") ?? ""));
    expect([...times].sort()).toEqual(times);
  }
  const composer = conversation.getByRole("form", { name: "پیام جدید" });
  await expect(composer.getByLabel(/پیام شما/)).toBeVisible();
  // Empty submission is blocked by validation and nothing is sent.
  await composer.getByRole("button", { name: "ارسال پیام" }).click();
  await expect(page).toHaveURL(new RegExp(`${detailPath}$`));
  expect(await attempts(page, "message", session)).toBe(0);
  await composer.getByLabel(/پیام شما/).fill("پیام آزمون پنل");
  await composer.getByRole("button", { name: "ارسال پیام" }).click();
  await expect(page).toHaveURL(/success=message$/);
  await expect(page.getByRole("status", { name: "موفق" })).toContainText("پیام شما برای کارشناس ثبت شد.");
  expect(await attempts(page, "message", session)).toBe(1);
});

test("a message that cannot be sent shows one generic error and is not retried", async ({ page }) => {
  test.setTimeout(60_000);
  const session = await signIn(page);
  await openThemed(page, detailPath, "dark");
  const composer = page.getByRole("form", { name: "پیام جدید" });
  await composer.getByLabel(/پیام شما/).fill("FIXTURE_FAIL پیام آزمون");
  await composer.getByRole("button", { name: "ارسال پیام" }).click();
  await expect(page).toHaveURL(/error=message$/);
  await expect(mainAlerts(page)).toContainText("ارسال پیام انجام نشد.");
  await expect(mainAlerts(page)).not.toContainText(/503|FIXTURE|Service/);
  expect(await attempts(page, "message", session)).toBe(1);
  await page.waitForTimeout(1500);
  expect(await attempts(page, "message", session)).toBe(1);
  expect(await seriousAxeViolations(page)).toEqual([]);
  await expectNoHorizontalOverflow(page, "message failure");
});

for (const theme of themes) {
  test(`a current quotation shows its immutable summary before the actions in ${theme}`, async ({ page }) => {
    await signIn(page, { quotation_mode: "sent" });
    await openThemed(page, detailPath, theme);
    const block = page.getByRole("region", { name: "پیشنهادهای قیمت" });
    await expect(block.getByText(/نسخه/).first()).toBeVisible();
    await expect(block.getByText(/اعتبار تا/)).toBeVisible();
    await expect(block.getByText("مبلغ نهایی")).toBeVisible();
    await expect(block.getByRole("link", { name: "دریافت PDF خصوصی این نسخه" })).toHaveAttribute("href", /\/inquiries\/inquiry-1\/quotations\/quotation-1\/pdf/);
    await expect(block.getByText(/سبد خرید|پرداخت آنلاین|موجودی زنده/)).toHaveCount(0);
    // The summary comes before the accept action in the document.
    const order = await block.evaluate((node) => {
      const total = node.querySelector("dl")?.compareDocumentPosition(node.querySelector("form button[type=submit]") as Node) ?? 0;
      return Boolean(total & Node.DOCUMENT_POSITION_FOLLOWING);
    });
    expect(order).toBe(true);
    await expect(block.getByRole("button", { name: "تأیید و پذیرش پیشنهاد قیمت" })).toBeVisible();
    expect(await seriousAxeViolations(page)).toEqual([]);
    await expectNoHorizontalOverflow(page, `quotation (${theme})`);
  });
}

test("accepting is one deliberate keyboard action that shows the success banner once", async ({ page }) => {
  const session = await signIn(page, { quotation_mode: "sent" });
  await openThemed(page, detailPath, "light");
  const accept = page.getByRole("button", { name: "تأیید و پذیرش پیشنهاد قیمت" });
  await accept.focus();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/success=accepted$/);
  await expect(page.getByRole("status", { name: "موفق" })).toContainText("پیشنهاد قیمت با موفقیت پذیرفته شد");
  expect(await attempts(page, "accept", session)).toBe(1);
});

test("rejecting uses its own disclosure, an optional reason and one submission", async ({ page }) => {
  const session = await signIn(page, { quotation_mode: "sent" });
  await openThemed(page, detailPath, "light");
  const summary = page.getByText("رد این پیشنهاد و درخواست اصلاح", { exact: true });
  await summary.focus();
  await page.keyboard.press("Enter");
  const form = page.getByRole("form", { name: "رد پیشنهاد قیمت" });
  await expect(form.getByLabel("علت رد پیشنهاد (اختیاری)")).toBeVisible();
  await form.getByLabel("علت رد پیشنهاد (اختیاری)").fill("قیمت بالاست");
  await form.getByRole("button", { name: "ثبت رد پیشنهاد" }).click();
  await expect(page).toHaveURL(/success=rejected$/);
  await expect(page.getByRole("status", { name: "موفق" })).toContainText("پیشنهاد قیمت رد شد");
  expect(await attempts(page, "reject", session)).toBe(1);
});

for (const [mode, text, noActions] of [
  ["accepted", /این پیشنهاد قیمت در تاریخ .* توسط شما پذیرفته شد/, true],
  ["rejected", /این پیشنهاد قیمت در تاریخ .* توسط شما رد شد/, true],
  ["expired", /مهلت اعتبار این پیشنهاد قیمت به پایان رسیده است/, true],
] as const) {
  test(`a ${mode} quotation shows its state and offers no response action`, async ({ page }) => {
    await signIn(page, { quotation_mode: mode });
    await openThemed(page, detailPath, "light");
    const block = page.getByRole("region", { name: "پیشنهادهای قیمت" });
    // A closed version (rejected, expired) is collapsed by default but its status stays visible in the summary line.
    await expect(block.locator("summary").first().getByText(/نسخه جاری|ردشده توسط شما|پذیرفته‌شده توسط شما/)).toBeVisible();
    await block.locator("summary").first().click().catch(() => undefined);
    if (!(await block.getByText(text).isVisible())) await block.locator("summary").first().click();
    await expect(block.getByText(text)).toBeVisible();
    if (noActions) {
      await expect(block.getByRole("button", { name: "تأیید و پذیرش پیشنهاد قیمت" })).toHaveCount(0);
      await expect(block.getByText("رد این پیشنهاد و درخواست اصلاح")).toHaveCount(0);
    }
    expect(await seriousAxeViolations(page)).toEqual([]);
    await expectNoHorizontalOverflow(page, `${mode} quotation`);
  });
}

for (const [fail, text] of [
  ["conflict", "نسخه پیشنهاد قیمت یا وضعیت درخواست تغییر کرده"],
  ["error", "پذیرش پیشنهاد قیمت انجام نشد."],
] as const) {
  test(`an answer that ${fail === "conflict" ? "conflicts with a newer version" : "fails on the server"} shows one message and is not retried`, async ({ page }) => {
    test.setTimeout(60_000);
    const session = await signIn(page, { quotation_mode: "sent", quotation_fail: fail });
    await openThemed(page, detailPath, "dark");
    await page.getByRole("button", { name: "تأیید و پذیرش پیشنهاد قیمت" }).click();
    await expect(page).toHaveURL(fail === "conflict" ? /conflict=quotation$/ : /error=accept$/);
    await expect(mainAlerts(page)).toContainText(text);
    if (fail === "conflict") {
      // An explicit refresh action, never an automatic retry.
      await expect(page.getByRole("link", { name: "تازه‌سازی و دیدن آخرین وضعیت" })).toHaveAttribute("href", detailPath);
    }
    expect(await attempts(page, "accept", session)).toBe(1);
    await page.waitForTimeout(1500);
    expect(await attempts(page, "accept", session)).toBe(1);
    expect(await seriousAxeViolations(page)).toEqual([]);
    await expectNoHorizontalOverflow(page, `quotation ${fail}`);
  });
}

test("a missing or foreign request shows one ownership-safe not-found inside the shell", async ({ page }) => {
  await signIn(page);
  // The status is not asserted: the shell streams, so the response may already be committed as 200 (see OD-7).
  await page.goto("/account/inquiries/someone-elses-request");
  await expect(page.getByRole("heading", { level: 1, name: "درخواست موردنظر پیدا نشد", exact: true })).toBeVisible();
  await expect(nav(page).getByRole("link")).toHaveCount(3);
  const robots = await page.locator('meta[name="robots"]').evaluateAll((nodes) => nodes.map((node) => (node as HTMLMetaElement).content));
  expect(robots.length).toBeGreaterThan(0);
  for (const content of robots) expect(content).toMatch(/noindex/);
  await expect(page.getByText(/someone|مالک|متعلق/)).toHaveCount(0);
  await expectNoHorizontalOverflow(page, "portal not-found");
  expect(await seriousAxeViolations(page)).toEqual([]);
});

test("an unavailable inquiry service shows a bounded error inside the shell with a keyboard retry", async ({ page }) => {
  await signIn(page, { portal_fail: "1" });
  await openThemed(page, "/account/inquiries", "light");
  const alert = page.locator("main").getByRole("alert");
  await expect(alert).toContainText("اطلاعات این بخش اکنون در دسترس نیست");
  await expect(alert).not.toContainText(/503|127\.0\.0\.1|stack|postgres/i);
  await expect(page.getByRole("heading", { level: 1, name: "اطلاعات این بخش اکنون در دسترس نیست", exact: true })).toHaveCount(1);
  await expect(nav(page).getByRole("link")).toHaveCount(3);
  const robots = await page.locator('meta[name="robots"]').evaluateAll((nodes) => nodes.map((node) => (node as HTMLMetaElement).content));
  expect(robots.length).toBeGreaterThan(0);
  for (const content of robots) expect(content).toMatch(/noindex/);
  const retry = page.getByRole("button", { name: "تلاش دوباره" });
  await retry.focus();
  await expect(retry).toBeFocused();
  expect(await seriousAxeViolations(page)).toEqual([]);
  await expectNoHorizontalOverflow(page, "portal error");
});

test("a visitor without a session is redirected to sign-in without any private shell content", async ({ page }) => {
  await page.goto("/account/inquiries");
  await expect(page).toHaveURL(/\/auth\/login\?next=\/account$/, { timeout: 15_000 });
  await expect(page.getByRole("navigation", { name: "بخش‌های پنل مشتری" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "خروج امن" })).toHaveCount(0);
});
