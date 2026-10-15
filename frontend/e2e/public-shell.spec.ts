import { expect, test } from "@playwright/test";
import { themeColors, themeStorageKey } from "../src/design-system/theme";

const publicPaths = ["/", "/products", "/injection-molding", "/materials", "/articles", "/about", "/contact", "/privacy", "/terms", "/inquiry", "/account"];

test("public shell is responsive without horizontal overflow", async ({ page }, testInfo) => {
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
  const viewport = page.viewportSize();
  const hasOverflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
  expect(hasOverflow).toBe(false);

  const desktopNavigation = page.getByRole("navigation", { name: "ناوبری اصلی" });
  const mobileTrigger = page.getByRole("button", { name: "بازکردن فهرست" });
  if ((viewport?.width ?? 0) > 1024) {
    await expect(desktopNavigation).toBeVisible();
    await expect(mobileTrigger).toBeHidden();
  } else {
    await expect(desktopNavigation).toBeHidden();
    await expect(mobileTrigger).toBeVisible();
  }

  await expect(page.getByRole("heading", { name: "محصولات و خدمات ترنج پلاستیک" })).toBeVisible();
  await expect(page.locator('a[href="/account"]').first()).toHaveAttribute("href", "/account");
  const bodyFont = await page.locator("body").evaluate((element) => getComputedStyle(element).fontFamily);
  expect(bodyFont).toContain("Estedad Variable");
  expect(await page.evaluate(() => document.fonts.check('16px "Estedad Variable"'))).toBe(true);
  await page.screenshot({ path: testInfo.outputPath("public-home.png"), fullPage: true });

  await page.goto("/products");
  await expect(page.getByRole("heading", { name: "محصولات", exact: true })).toBeVisible();
  const innerHasOverflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
  expect(innerHasOverflow).toBe(false);
  await page.screenshot({ path: testInfo.outputPath("public-inner.png"), fullPage: true });
});

test("mobile drawer supports keyboard, focus return and inert background", async ({ page }) => {
  test.skip((page.viewportSize()?.width ?? 0) > 1024, "mobile navigation flow");
  await page.goto("/");
  const trigger = page.getByRole("button", { name: "بازکردن فهرست" });
  await trigger.focus();
  await page.keyboard.press("Enter");
  await expect(trigger).toHaveAttribute("aria-expanded", "true");
  await expect(page.getByRole("button", { name: "بستن فهرست" })).toBeFocused();
  await expect(page.locator("[data-shell-inert]").first()).toHaveAttribute("inert", "");
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(trigger).toBeFocused();
  await expect(page.locator("[data-shell-inert]").first()).not.toHaveAttribute("inert", "");
});

test("theme follows the system, switches accessibly and persists", async ({ page }, testInfo) => {
  await page.emulateMedia({ colorScheme: "dark" });
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute("content", themeColors.dark);
  const darkCanvas = await page.locator("body").evaluate((element) => getComputedStyle(element).backgroundColor);
  await page.screenshot({ path: testInfo.outputPath("public-home-dark.png"), fullPage: true });

  await page.goto("/products");
  await expect(page.getByRole("heading", { name: "محصولات", exact: true })).toBeVisible();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.screenshot({ path: testInfo.outputPath("public-inner-dark.png"), fullPage: true });

  if ((page.viewportSize()?.width ?? 0) <= 1024) {
    await page.getByRole("button", { name: "بازکردن فهرست" }).click();
  }
  const toggle = page.getByRole("button", { name: "فعال‌کردن حالت روشن" });
  await expect(toggle).toBeVisible();
  const target = await toggle.boundingBox();
  expect(target?.width).toBeGreaterThanOrEqual(44);
  expect(target?.height).toBeGreaterThanOrEqual(44);
  await toggle.click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute("content", themeColors.light);
  expect(await page.evaluate((key) => localStorage.getItem(key), themeStorageKey)).toBe("light");
  const lightCanvas = await page.locator("body").evaluate((element) => getComputedStyle(element).backgroundColor);
  expect(lightCanvas).not.toBe(darkCanvas);

  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute("content", themeColors.light);
  const hasOverflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
  expect(hasOverflow).toBe(false);
});

test("registered destinations resolve and preserve indexing boundaries", async ({ page, request }) => {
  for (const path of publicPaths) {
    const response = await request.get(path);
    expect(response.status(), `${path} should resolve`).toBe(200);
  }
  await page.goto("/products");
  await expect(page.getByRole("heading", { name: "محصولات", exact: true })).toBeVisible();
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /index/);
  await page.goto("/inquiry");
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
  await expect(page.locator("body")).not.toContainText(/سبد خرید|پرداخت آنلاین|موجودی لحظه‌ای/);
});

test("approved public pages expose canonical discovery metadata", async ({ page, request }) => {
  await page.goto("/");
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /index/);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", "http://localhost:3000");

  await page.goto("/products/industrial-basket");
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", "http://localhost:3000/products/industrial-basket");
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute("content", /refrigerator-organizer\.webp/);
  const jsonLd = JSON.parse(await page.locator('script[type="application/ld+json"]').textContent() || "{}");
  expect(jsonLd).toMatchObject({ "@type": "Product", name: "سبد صنعتی نمونه" });
  expect(jsonLd).not.toHaveProperty("offers");

  const robots = await request.get("/robots.txt");
  expect(await robots.text()).toContain("Disallow: /auth/");
  const sitemap = await request.get("/sitemap.xml");
  const sitemapBody = await sitemap.text();
  expect(sitemapBody).toContain("http://localhost:3000/products/industrial-basket");
  expect(sitemapBody).not.toContain("/auth/");
});

test("content pages distinguish success, empty, error and not-found states", async ({ page }) => {
  await page.goto("/products");
  await expect(page.getByRole("heading", { name: "سبد صنعتی نمونه" })).toBeVisible();
  await page.getByRole("link", { name: "مشاهده جزئیات" }).click();
  await expect(page.getByRole("heading", { name: "سبد صنعتی نمونه", exact: true })).toBeVisible();
  await expect(page.getByText("TRJ-P-001")).toHaveCSS("direction", "ltr");

  await page.goto("/injection-molding");
  await expect(page.getByRole("heading", { name: "خدمت منتشرشده‌ای وجود ندارد" })).toBeVisible();

  await page.goto("/materials");
  await expect(page.getByText("محتوای این صفحه اکنون در دسترس نیست", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "تلاش دوباره" })).toBeVisible();

  await page.goto("/articles/material-selection");
  await expect(page.getByRole("heading", { name: "راهنمای انتخاب ماده", exact: true })).toBeVisible();

  await page.goto("/products/unknown-product");
  await expect(page.getByRole("heading", { name: "محتوای موردنظر پیدا نشد" })).toBeVisible();
});

test("connected content fits the viewport in both themes", async ({ page }) => {
  for (const colorScheme of ["light", "dark"] as const) {
    await page.emulateMedia({ colorScheme });
    for (const path of ["/products", "/products/industrial-basket", "/articles/material-selection", "/about"]) {
      await page.goto(path);
      await expect(page.locator("main")).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth), `${path} must not overflow in ${colorScheme}`).toBe(false);
    }
  }
});

test("campaign artwork stays responsive and exposes real actions", async ({ page, request }, testInfo) => {
  test.setTimeout(60_000);
  await page.goto("/");
  const homeCampaign = page.getByTestId("home-campaign");
  await expect(homeCampaign).toBeVisible();
  await expect(homeCampaign.getByRole("img", { name: "معرفی محصولات و خدمات ترنج پلاستیک" })).toBeVisible();
  const productsAction = homeCampaign.getByRole("link", { name: "مشاهده محصولات" });
  const inquiryAction = homeCampaign.getByRole("link", { name: "ثبت استعلام" });
  await expect(productsAction).toHaveAttribute("href", "/products");
  await expect(inquiryAction).toHaveAttribute("href", "/inquiry");
  await productsAction.focus();
  expect(await productsAction.evaluate((element) => getComputedStyle(element).outlineStyle)).not.toBe("none");
  expect(await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)).toBe(false);
  await page.screenshot({ path: testInfo.outputPath("campaign-home.png"), fullPage: true });

  await page.goto("/products");
  await expect(page.getByRole("heading", { name: "محصولات را دقیق‌تر ببینید." })).toBeVisible();
  await expect(page.getByRole("img", { name: "محصولات پلاستیکی ترنج در فضای آشپزخانه" })).toBeVisible();
  await expect(page.getByRole("link", { name: "ثبت استعلام محصول" })).toHaveAttribute("href", "/inquiry/product");
  const landingHero = page.locator('section[aria-labelledby="catalog-landing-title"]');
  const landingBox = await landingHero.boundingBox();
  const viewportWidth = page.viewportSize()?.width ?? 1280;
  expect(landingBox?.height).toBeLessThan(viewportWidth <= 390 ? 650 : viewportWidth <= 768 ? 850 : 620);
  await expect(page.locator('[data-layout="featured"]')).toBeVisible();
  const productCard = page.getByRole("article").first();
  await expect(productCard).toBeVisible();
  await productCard.scrollIntoViewIfNeeded();
  await expect.poll(() => productCard.locator("img").evaluate((element) => (element as HTMLImageElement).complete && (element as HTMLImageElement).naturalWidth > 0)).toBe(true);
  const cardBox = await productCard.boundingBox();
  expect(cardBox?.height).toBeLessThan(600);
  expect(cardBox?.width).toBeGreaterThan(viewportWidth * (viewportWidth <= 390 ? .85 : .72));
  expect(await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)).toBe(false);
  await page.screenshot({ path: testInfo.outputPath("catalog-products.png"), fullPage: true });

  await page.getByRole("link", { name: "مشاهده جزئیات" }).click();
  await expect(page.getByRole("heading", { name: "سبد صنعتی نمونه", exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: "ثبت استعلام محصول" })).toHaveAttribute("href", "/inquiry/product?slug=industrial-basket");
  await expect(page.getByText("ثبت استعلام به معنی تأیید قیمت یا موجودی نیست.")).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)).toBe(false);
  await page.screenshot({ path: testInfo.outputPath("catalog-product-detail.png"), fullPage: true });

  const routes = [
    ["/injection-molding", "injection-campaign", "ثبت درخواست خدمات تزریق پلاستیک", "/inquiry/injection"],
    ["/contact", "contact-campaign", "مشاهده راه‌های تماس با ترنج پلاستیک", "#managed-content"],
  ] as const;

  for (const [path, testId, label, href] of routes) {
    await page.goto(path);
    const banner = page.getByTestId(testId);
    await banner.scrollIntoViewIfNeeded();
    await expect(banner).toBeVisible();
    await expect(banner).toHaveAccessibleName(label);
    await expect(banner).toHaveAttribute("href", href);
    const image = banner.locator("img");
    await expect(image).toBeVisible();
    await expect(image).toHaveAttribute("width", "1122");
    await expect(image).toHaveAttribute("height", "1402");
    await expect.poll(() => image.evaluate((element) => {
      const campaignImage = element as HTMLImageElement;
      return campaignImage.complete && campaignImage.naturalWidth > 0;
    })).toBe(true);
    expect(await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth), `${path} campaign must not overflow`).toBe(false);
  }
  const materialsArtwork = await request.get("/branding/banners/materials.png");
  expect(materialsArtwork.ok()).toBe(true);
  await page.screenshot({ path: testInfo.outputPath("campaign-contact.png"), fullPage: true });
});
