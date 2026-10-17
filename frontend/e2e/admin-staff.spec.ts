import { expect, test } from "@playwright/test";

const sessionCookies = (value: string) => [
  {
    name: "toranj_session",
    value,
    domain: "127.0.0.1",
    path: "/",
    httpOnly: true,
    sameSite: "Lax" as const,
  },
  {
    name: "toranj_csrf",
    value: "fixture-csrf",
    domain: "127.0.0.1",
    path: "/",
    sameSite: "Lax" as const,
  },
];

test("staff management is private, RTL, and responsive", async ({ page }) => {
  test.setTimeout(60_000);
  await page.context().addCookies([
    {
      name: "toranj_session",
      value: "fixture-session",
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
  await page.goto("/admin/staff");
  await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    "content",
    /noindex/,
  );
  await expect(
    page.getByRole("heading", { name: "کاربران سازمانی" }),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: "کارشناس فروش" })).toBeVisible();
  expect(
    await page.evaluate(
      () =>
        document.documentElement.scrollWidth >
        document.documentElement.clientWidth,
    ),
  ).toBe(false);

  await page.goto("/admin/staff/new");
  await expect(page.getByLabel("رمز عبور اولیه")).toHaveAttribute(
    "type",
    "password",
  );
  expect(
    await page.evaluate(
      () =>
        document.documentElement.scrollWidth >
        document.documentElement.clientWidth,
    ),
  ).toBe(false);

  await page.goto("/admin/staff/staff-1");
  await expect(
    page.getByRole("heading", { name: "کارشناس فروش" }),
  ).toBeVisible();
  await expect(
    page.locator('input[name="expectedVersion"]').first(),
  ).toHaveValue("0");
  expect(
    await page.evaluate(
      () =>
        document.documentElement.scrollWidth >
        document.documentElement.clientWidth,
    ),
  ).toBe(false);
  await page.evaluate(() => localStorage.setItem("toranj-theme", "dark"));
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect(
    page.getByRole("heading", { name: "کارشناس فروش" }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () =>
        document.documentElement.scrollWidth >
        document.documentElement.clientWidth,
    ),
  ).toBe(false);
});

test("Administrator creates staff and changes role and status", async ({
  page,
}, testInfo) => {
  test.skip(
    testInfo.project.name !== "desktop-1280",
    "mutation journey runs once; responsive coverage is separate",
  );
  await page
    .context()
    .addCookies(sessionCookies(`admin-journey-${testInfo.project.name}`));

  await page.goto("/admin/staff/new");
  await page.getByLabel("نام و نام خانوادگی").fill("کارشناس تازه");
  await page.getByLabel("شماره موبایل").fill("09120000001");
  await page.getByLabel("سطح دسترسی").selectOption("SALES");
  await page.getByLabel("رمز عبور اولیه").fill("SecurePass123!");
  await page.getByRole("button", { name: "ایجاد حساب" }).click();
  await expect(page).toHaveURL(/\/admin\/staff\?success=created/);
  await expect(page.getByRole("status")).toContainText("با موفقیت ایجاد شد");

  await page.goto("/admin/staff/staff-1");
  await page.getByLabel("سطح دسترسی").selectOption("OPERATOR");
  await page.getByRole("button", { name: "ذخیره نقش" }).click();
  await expect(page).toHaveURL(/success=role/);
  await expect(page.getByRole("status")).toContainText("نشست‌های قبلی");

  await page.getByLabel("وضعیت حساب").selectOption("DISABLED");
  await page.getByRole("button", { name: "ذخیره وضعیت" }).click();
  await expect(page).toHaveURL(/success=status/);
  await expect(page.getByRole("status")).toContainText("نشست‌های قبلی");
});

test("Sales and Operator see only their allowed workspaces", async ({
  page,
}, testInfo) => {
  test.skip(
    testInfo.project.name !== "desktop-1280",
    "authorization journey runs once",
  );
  await page
    .context()
    .addCookies(sessionCookies(`sales-${testInfo.project.name}`));
  await page.goto("/admin/inquiries");
  await expect(
    page.getByRole("heading", { name: "کارتابل استعلام‌ها" }),
  ).toBeVisible();
  await page.goto("/admin/products");
  await expect(
    page.getByRole("heading", { name: "امکان نمایش این بخش وجود ندارد" }),
  ).toBeVisible();
  await expect(page.getByRole("heading", { name: "محصولات" })).toHaveCount(0);

  await page.context().clearCookies();
  await page
    .context()
    .addCookies(sessionCookies(`operator-${testInfo.project.name}`));
  await page.goto("/admin/products");
  await expect(page.getByRole("heading", { name: "محصولات" })).toBeVisible();
  await page.goto("/admin/inquiries");
  await expect(
    page.getByRole("heading", { name: "کارتابل در دسترس نیست" }),
  ).toBeVisible();
  await page.goto("/admin/staff");
  await expect(
    page.getByText("شما اجازه مدیریت کاربران سازمانی را ندارید.", {
      exact: true,
    }),
  ).toBeVisible();
});

test("staff conflicts render safe recovery feedback", async ({
  page,
}, testInfo) => {
  test.skip(
    testInfo.project.name !== "desktop-1280",
    "conflict journey runs once",
  );
  await page
    .context()
    .addCookies(sessionCookies(`admin-conflict-${testInfo.project.name}`));

  await page.goto("/admin/staff/last-admin");
  await page.getByLabel("سطح دسترسی").selectOption("SALES");
  await page.getByRole("button", { name: "ذخیره نقش" }).click();
  await expect(page.locator('main [role="alert"]')).toContainText(
    "آخرین مدیر فعال",
  );

  await page.goto("/admin/staff/version-conflict");
  await page.getByLabel("سطح دسترسی").selectOption("OPERATOR");
  await page.getByRole("button", { name: "ذخیره نقش" }).click();
  await expect(page.locator('main [role="alert"]')).toContainText(
    "صفحه را تازه‌سازی کنید",
  );
  await expect(
    page.getByRole("link", { name: "تازه‌سازی اطلاعات" }),
  ).toBeVisible();
});

test("status change revokes the affected staff session", async ({
  browser,
}, testInfo) => {
  test.skip(
    testInfo.project.name !== "desktop-1280",
    "session-revocation journey runs once",
  );
  const suffix = testInfo.project.name;
  const adminContext = await browser.newContext();
  const targetContext = await browser.newContext();
  try {
    await adminContext.addCookies(sessionCookies(`admin-revoke-${suffix}`));
    await targetContext.addCookies(sessionCookies(`target-revoke-${suffix}`));
    const adminPage = await adminContext.newPage();
    const targetPage = await targetContext.newPage();

    await targetPage.goto("/admin/inquiries");
    await expect(
      targetPage.getByRole("heading", { name: "کارتابل استعلام‌ها" }),
    ).toBeVisible();

    await adminPage.goto("/admin/staff/staff-1");
    await adminPage.getByLabel("وضعیت حساب").selectOption("DISABLED");
    await adminPage.getByRole("button", { name: "ذخیره وضعیت" }).click();
    await expect(adminPage.getByRole("status")).toContainText("نشست‌های قبلی");

    await targetPage.goto("/admin/inquiries");
    await expect(targetPage).toHaveURL(/\/auth\/login/);
  } finally {
    await adminContext.close();
    await targetContext.close();
  }
});
