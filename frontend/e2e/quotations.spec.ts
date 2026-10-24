import { expect, test, type Page } from "@playwright/test";

async function signIn(page: Page, session: string) {
  await page.context().addCookies([
    {
      name: "toranj_session",
      value: session,
      domain: "127.0.0.1",
      path: "/",
      httpOnly: true,
      sameSite: "Lax",
    },
    {
      name: "toranj_csrf",
      value: "fixture-csrf",
      domain: "127.0.0.1",
      path: "/",
      sameSite: "Lax",
    },
  ]);
}

async function setTheme(page: Page, theme: "light" | "dark") {
  await page.addInitScript((value) => {
    localStorage.setItem("toranj-theme", value);
  }, theme);
}

async function expectNoHorizontalOverflow(page: Page) {
  expect(
    await page.evaluate(
      () =>
        document.documentElement.scrollWidth >
        document.documentElement.clientWidth,
    ),
  ).toBe(false);
}

test("admin quotation editor is RTL, manual, versioned and responsive", async ({
  page,
}) => {
  test.setTimeout(90_000);
  await signIn(page, "fixture-session");

  for (const theme of ["light", "dark"] as const) {
    await setTheme(page, theme);
    await page.goto("/admin/inquiries/inquiry-1");
    await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
    await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
    await expect(
      page.getByRole("heading", { name: "پیشنهاد قیمت" }),
    ).toBeVisible();
    await expect(page.getByText("قیمت‌گذاری دستی و نسخه‌دار")).toBeVisible();
    await expect(page.getByLabel("قیمت واحد (ریال)")).toHaveValue("250000");
    await expect(page.getByText("۲۶٬۹۰۰٬۰۰۰ ریال")).toBeVisible();
    await expect(
      page.getByText(/سبد خرید|پرداخت آنلاین|موجودی زنده/),
    ).toHaveCount(0);

    const confirmation = page.getByRole("checkbox", {
      name: /مقادیر، شرایط و نسخه را بازبینی کرده‌ام/,
    });
    await confirmation.focus();
    await expect(confirmation).toBeFocused();
    await confirmation.check();
    await expectNoHorizontalOverflow(page);
    await page.screenshot({
      path: test.info().outputPath(`admin-quotation-${theme}.png`),
      fullPage: true,
    });
    await page
      .getByRole("button", { name: "تأیید و ارسال برای مشتری" })
      .click();
    await expect(page).toHaveURL(/success=quotation-sent/);
    await expect(page.getByRole("status")).toContainText(
      "پیشنهاد قیمت برای مشتری ارسال و قفل شد",
    );
  }

  await page.context().addCookies([
    {
      name: "quotation_mode",
      value: "sent",
      domain: "127.0.0.1",
      path: "/",
      sameSite: "Lax",
    },
  ]);
  await page.goto("/admin/inquiries/inquiry-1");
  await expect(page.getByText("نسخه جاری ارسال شده")).toBeVisible();
  const pdf = page.getByRole("link", { name: "دریافت PDF خصوصی" });
  await expect(pdf).toHaveAttribute(
    "href",
    /\/admin\/inquiries\/inquiry-1\/quotations\/quotation-1\/pdf$/,
  );
  await page.getByRole("button", { name: "ایجاد نسخه اصلاحی" }).click();
  await expect(page).toHaveURL(/success=quotation-revision/);
  await expect(page.getByRole("status")).toContainText("نسخه اصلاحی ساخته شد");
});

test("customer sees only the private sent snapshot and PDF", async ({
  page,
}) => {
  test.setTimeout(60_000);
  await signIn(page, "customer-fixture-session");

  for (const theme of ["light", "dark"] as const) {
    await setTheme(page, theme);
    await page.goto("/account/inquiries/inquiry-1");
    await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
    await expect(
      page.getByRole("heading", { name: "پیشنهادهای قیمت" }),
    ).toBeVisible();
    await expect(page.getByText("TRJ-Q-0001")).toBeVisible();
    await expect(page.locator("summary").getByText("۲۶٬۹۰۰٬۰۰۰ ریال")).toBeVisible();
    await expect(page.getByText(/پنجاه درصد پیش‌پرداخت/)).toBeVisible();
    await expect(
      page.getByText(/سبد خرید|پرداخت آنلاین|موجودی زنده/),
    ).toHaveCount(0);
    const pdf = page.getByRole("link", {
      name: "دریافت PDF خصوصی این نسخه",
    });
    await expect(pdf).toHaveAttribute(
      "href",
      /\/inquiries\/inquiry-1\/quotations\/quotation-1\/pdf$/,
    );
    await expectNoHorizontalOverflow(page);
    await page.screenshot({
      path: test.info().outputPath(`customer-quotation-${theme}.png`),
      fullPage: true,
    });
  }

  const response = await page.request.get(
    "http://127.0.0.1:3199/api/v1/inquiries/inquiry-1/quotations/quotation-1/pdf",
  );
  expect(response.ok()).toBe(true);
  expect(response.headers()["content-type"]).toBe("application/pdf");
  expect(response.headers()["cache-control"]).toContain("no-store");
  expect((await response.body()).subarray(0, 4).toString()).toBe("%PDF");
});

test("customer can accept quotation and sees confirmation and status update", async ({
  page,
}) => {
  test.setTimeout(60_000);
  await signIn(page, "customer-fixture-session");
  await page.context().addCookies([
    {
      name: "quotation_mode",
      value: "quoted",
      domain: "127.0.0.1",
      path: "/",
      sameSite: "Lax",
    },
  ]);
  await page.goto("/account/inquiries/inquiry-1");
  const acceptButton = page.getByRole("button", { name: "تأیید و پذیرش پیشنهاد قیمت" });
  await expect(acceptButton).toBeVisible();
  await acceptButton.click();
  await expect(page).toHaveURL(/success=accepted/);
  await expect(page.getByRole("status")).toContainText("پیشنهاد قیمت با موفقیت پذیرفته شد");
});
