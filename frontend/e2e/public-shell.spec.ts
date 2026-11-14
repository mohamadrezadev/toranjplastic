import { expect, test, type Page } from "@playwright/test";
import { themeColors, themeStorageKey } from "../src/design-system/theme";

const publicPaths = ["/", "/products", "/injection-molding", "/materials", "/articles", "/about", "/contact", "/privacy", "/terms", "/inquiry", "/account"];

/*
 * html and body both declare `overflow-x: hidden`, which makes <body> the
 * page's horizontal scroll container: documentElement.scrollWidth alone never
 * reports content wider than the viewport, so both boxes are checked.
 * e2e/public-content.spec.ts adds an element-level check for content clipped
 * inside <main>.
 */
const hasHorizontalOverflow = (page: Page) => page.evaluate(() => {
  const root = document.documentElement;
  return root.scrollWidth > root.clientWidth || document.body.scrollWidth > document.body.clientWidth;
});

test("public shell is responsive without horizontal overflow", async ({ page }, testInfo) => {
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
  const viewport = page.viewportSize();
  const hasOverflow = await hasHorizontalOverflow(page);
  expect(hasOverflow).toBe(false);

  const desktopNavigation = page.getByRole("navigation", { name: "ناوبری اصلی" });
  const mobileTrigger = page.getByRole("button", { name: "بازکردن فهرست" });
  const primaryDestination = desktopNavigation.getByRole("link", { name: "محصولات", exact: true });
  await expect(desktopNavigation).toBeVisible();
  await expect(desktopNavigation.getByRole("link", { name: "ترنج پلاستیک — صفحه اصلی" })).toBeVisible();
  if ((viewport?.width ?? 0) > 1152) {
    await expect(primaryDestination).toBeVisible();
    await expect(mobileTrigger).toBeHidden();
    await expect(page.getByRole("navigation", { name: "محصولات و خدمات فوتر", exact: true })).toBeVisible();
  } else {
    await expect(primaryDestination).toBeHidden();
    await expect(mobileTrigger).toBeVisible();
  }

  await expect(page.getByRole("heading", { name: "محصولات و خدمات ترنج پلاستیک" })).toBeVisible();
  await expect(page.locator('a[href="/account"]').first()).toHaveAttribute("href", "/account");
  const bodyFont = await page.locator("body").evaluate((element) => getComputedStyle(element).fontFamily);
  expect(bodyFont).toContain("Vazirmatn Variable");
  expect(await page.evaluate(() => document.fonts.check('16px "Vazirmatn Variable"'))).toBe(true);
  await page.screenshot({ path: testInfo.outputPath("public-home.png"), fullPage: true });

  await page.goto("/products");
  await expect(page.getByRole("heading", { name: "محصولات", exact: true })).toBeVisible();
  const innerHasOverflow = await hasHorizontalOverflow(page);
  expect(innerHasOverflow).toBe(false);
  await page.screenshot({ path: testInfo.outputPath("public-inner.png"), fullPage: true });
});

test("mobile drawer supports keyboard, focus return and an inert background", async ({ page }) => {
  test.skip((page.viewportSize()?.width ?? 0) > 1152, "mobile navigation flow");
  await page.goto("/products");
  const trigger = page.getByRole("button", { name: "بازکردن فهرست" });
  await expect(trigger).toHaveAttribute("aria-expanded", "false");
  await trigger.focus();
  await page.keyboard.press("Enter");
  await expect(trigger).toHaveAttribute("aria-expanded", "true");

  const dialog = page.getByRole("dialog", { name: "فهرست اصلی" });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole("button", { name: "بستن فهرست" })).toBeVisible();
  await expect(dialog.getByRole("link", { name: "محصولات", exact: true })).toHaveAttribute("aria-current", "page");
  const focusIsInsideDialog = () => dialog.evaluate((element) => element.contains(document.activeElement));
  await expect.poll(focusIsInsideDialog).toBe(true);

  // The native modal keeps keyboard focus away from the page behind it.
  for (let step = 0; step < 14; step += 1) {
    await page.keyboard.press("Tab");
    expect(await page.evaluate(() => Boolean(document.activeElement?.closest("main, footer")))).toBe(false);
  }
  expect(await hasHorizontalOverflow(page)).toBe(false);

  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(trigger).toBeFocused();
  await expect(trigger).toHaveAttribute("aria-expanded", "false");
});

test("header switches between inline links and the drawer at the 72rem breakpoint", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop-1280", "single deterministic breakpoint sweep");
  for (const theme of ["light", "dark"] as const) {
    await page.emulateMedia({ colorScheme: theme });
    for (const width of [1151, 1152, 1153]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/products");
      const navigation = page.getByRole("navigation", { name: "ناوبری اصلی" });
      const inlineLink = navigation.getByRole("link", { name: "محصولات", exact: true });
      const drawerTrigger = page.getByRole("button", { name: "بازکردن فهرست" });
      if (width > 1152) {
        await expect(inlineLink).toBeVisible();
        await expect(drawerTrigger).toBeHidden();
        await expect(navigation.getByRole("link", { name: "ثبت استعلام" })).toBeVisible();
      } else {
        await expect(inlineLink).toBeHidden();
        await expect(drawerTrigger).toBeVisible();
      }
      const header = await page.getByRole("banner").boundingBox();
      expect(header?.height, `header must stay on one row at ${width}px`).toBeLessThan(100);
      expect(await hasHorizontalOverflow(page), `${width}px must not overflow`).toBe(false);
    }
  }
});

test("primary navigation marks the current section and breadcrumbs stay semantic", async ({ page }) => {
  const runtimeErrors: string[] = [];
  page.on("pageerror", (error) => runtimeErrors.push(error.message));
  await page.goto("/products/industrial-basket");
  const breadcrumb = page.getByRole("navigation", { name: "مسیر صفحه" });
  await expect(breadcrumb).toBeVisible();
  await expect(breadcrumb.getByRole("link", { name: "خانه" })).toHaveAttribute("href", "/");
  await expect(breadcrumb.locator('[aria-current="page"]')).toHaveCount(1);
  if ((page.viewportSize()?.width ?? 0) > 1152) {
    const navigation = page.getByRole("navigation", { name: "ناوبری اصلی" });
    await expect(navigation.getByRole("link", { name: "محصولات", exact: true })).toHaveAttribute("aria-current", "page");
    await expect(navigation.getByRole("link", { name: "مقالات", exact: true })).not.toHaveAttribute("aria-current", "page");
  }
  // The shared shell must not force dynamic content routes into client-side recovery.
  expect(runtimeErrors).toEqual([]);
});

test("theme follows the system, switches accessibly and persists", async ({ page }, testInfo) => {
  await page.emulateMedia({ colorScheme: "dark" });
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect(page.locator('meta[name="theme-color"]').first()).toHaveAttribute("content", themeColors.dark);
  const darkCanvas = await page.locator("body").evaluate((element) => getComputedStyle(element).backgroundColor);
  await page.screenshot({ path: testInfo.outputPath("public-home-dark.png"), fullPage: true });

  await page.goto("/products");
  await expect(page.getByRole("heading", { name: "محصولات", exact: true })).toBeVisible();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.screenshot({ path: testInfo.outputPath("public-inner-dark.png"), fullPage: true });

  if ((page.viewportSize()?.width ?? 0) <= 1152) {
    await page.getByRole("button", { name: "بازکردن فهرست" }).click();
  }
  const toggle = page.getByRole("button", { name: "فعال‌کردن حالت روشن" });
  await expect(toggle).toBeVisible();
  const target = await toggle.boundingBox();
  expect(target?.width).toBeGreaterThanOrEqual(44);
  expect(target?.height).toBeGreaterThanOrEqual(44);
  await toggle.click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await expect(page.locator('meta[name="theme-color"]').first()).toHaveAttribute("content", themeColors.light);
  expect(await page.evaluate((key) => localStorage.getItem(key), themeStorageKey)).toBe("light");
  const lightCanvas = await page.locator("body").evaluate((element) => getComputedStyle(element).backgroundColor);
  expect(lightCanvas).not.toBe(darkCanvas);

  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await expect(page.locator('meta[name="theme-color"]').first()).toHaveAttribute("content", themeColors.light);
  const hasOverflow = await hasHorizontalOverflow(page);
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
      expect(await hasHorizontalOverflow(page), `${path} must not overflow in ${colorScheme}`).toBe(false);
    }
  }
});

test("campaign artwork stays responsive and exposes real actions", async ({ page, request }, testInfo) => {
  test.setTimeout(60_000);
  await page.goto("/");
  const homeCampaign = page.getByTestId("home-campaign");
  await expect(homeCampaign).toBeVisible();
  await expect(homeCampaign.getByRole("img", { name: "نمونه محصولات پلاستیکی ترنج" })).toBeVisible();
  const productsAction = homeCampaign.getByRole("link", { name: "مشاهده محصولات" });
  const inquiryAction = homeCampaign.getByRole("link", { name: "ثبت استعلام" });
  await expect(productsAction).toHaveAttribute("href", "/products");
  await expect(inquiryAction).toHaveAttribute("href", "/inquiry");
  await productsAction.focus();
  expect(await productsAction.evaluate((element) => getComputedStyle(element).outlineStyle)).not.toBe("none");
  expect(await hasHorizontalOverflow(page)).toBe(false);
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
  expect(await hasHorizontalOverflow(page)).toBe(false);
  await page.screenshot({ path: testInfo.outputPath("catalog-products.png"), fullPage: true });

  await page.getByRole("link", { name: "مشاهده جزئیات" }).click();
  await expect(page.getByRole("heading", { name: "سبد صنعتی نمونه", exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: "ثبت استعلام محصول" })).toHaveAttribute("href", "/inquiry/product?slug=industrial-basket");
  await expect(page.getByText("ثبت استعلام به معنی تأیید قیمت یا موجودی نیست.")).toBeVisible();
  expect(await hasHorizontalOverflow(page)).toBe(false);
  await page.screenshot({ path: testInfo.outputPath("catalog-product-detail.png"), fullPage: true });

  const routes = [
    ["/injection-molding", "injection-campaign", "ثبت درخواست خدمات تزریق پلاستیک", "/inquiry/injection"],
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
    expect(await hasHorizontalOverflow(page), `${path} campaign must not overflow`).toBe(false);
  }
  const materialsArtwork = await request.get("/branding/banners/materials.png");
  expect(materialsArtwork.ok()).toBe(true);
  await page.goto("/contact");
  await expect(page.getByRole("heading", { name: "تماس با ما", exact: true })).toBeVisible();
  expect(await hasHorizontalOverflow(page)).toBe(false);
  await page.screenshot({ path: testInfo.outputPath("campaign-contact.png"), fullPage: true });
});

test("adjacent tablet breakpoints keep capability cards proportionate", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop-1280", "single deterministic breakpoint sweep");

  for (const width of [767, 768, 769]) {
    await page.setViewportSize({ width, height: 1024 });
    await page.goto("/");
    const cards = page.locator('section[aria-label="حوزه‌های ترنج پلاستیک"] > a');
    await expect(cards).toHaveCount(3);
    const boxes = await cards.evaluateAll((elements) => elements.map((element) => {
      const box = element.getBoundingClientRect();
      return { width: box.width, top: box.top };
    }));
    expect(Math.abs(boxes[0].top - boxes[1].top)).toBeLessThan(2);
    expect(boxes[0].width).toBeGreaterThan(width * .35);
    expect(boxes[2].top).toBeGreaterThan(boxes[0].top);
    expect(await hasHorizontalOverflow(page)).toBe(false);
  }
});

test("retry leaves the bounded error state and reloads a successful public read", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop-1280", "stateful retry fixture runs once");
  await page.goto("/products?page=97");
  const alert = page.locator("[data-error-state] [role='alert']");
  await expect(alert).toContainText("محتوای این صفحه اکنون در دسترس نیست");
  await expect(alert).not.toContainText(/temporary fixture failure|127\.0\.0\.1|postgres|stack/i);
  await page.getByRole("button", { name: "تلاش دوباره" }).click();
  await expect(page.getByRole("heading", { name: "سبد صنعتی نمونه" })).toBeVisible();
});

test("mobile footer disclosures keep contact visible and reveal reachable links", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "mobile-390", "mobile disclosure behavior");
  await page.goto("/");
  await expect(page.getByRole("link", { name: "info@toranjplastic.com" })).toBeVisible();
  const trigger = page.getByRole("button", { name: "محصولات و خدمات" });
  const links = page.getByRole("navigation", { name: "محصولات و خدمات فوتر موبایل" });
  await expect(trigger).toHaveAttribute("aria-expanded", "false");
  expect((await trigger.boundingBox())?.height).toBeGreaterThanOrEqual(44);
  await expect(links).toBeHidden();
  await trigger.focus();
  await page.keyboard.press("Enter");
  await expect(trigger).toHaveAttribute("aria-expanded", "true");
  await expect(links.getByRole("link", { name: "محصولات کاتالوگ" })).toBeVisible();
  expect(await hasHorizontalOverflow(page)).toBe(false);
});

test("footer keeps keyboard focus visible on the dark brand surface", async ({ page }) => {
  // The footer is an always-dark brand surface in both themes; light is where the default ring matched it.
  for (const colorScheme of ["light", "dark"] as const) {
    await page.emulateMedia({ colorScheme });
    await page.goto("/");
    await expect(page.locator("html")).toHaveAttribute("data-theme", colorScheme);
    const link = page.getByRole("contentinfo").getByRole("link", { name: "info@toranjplastic.com" });
    await link.focus();
    await expect(link).toBeFocused();
    const focus = await link.evaluate((element) => {
      const style = getComputedStyle(element);
      const footer = element.closest("footer");
      return { outline: style.outlineColor, outlineStyle: style.outlineStyle, outlineWidth: parseFloat(style.outlineWidth), background: footer ? getComputedStyle(footer).backgroundColor : "" };
    });
    expect(focus.outlineStyle, colorScheme).not.toBe("none");
    expect(focus.outlineWidth, colorScheme).toBeGreaterThanOrEqual(2);
    expect(focus.outline, colorScheme).not.toBe(focus.background);
  }
});

test("home campaign artwork never shows its rasterized headline or buttons beside the semantic copy", async ({ page }, testInfo) => {
  // The artwork's rasterized Persian headline, text and button pills start at about 61% of its width
  // (x = 1170 of 1916, measured on public/branding/banners/home-hero.webp); every crop is anchored left.
  const rasterizedCopyStart = 1170 / 1916;
  const visibleShare = () => page.getByTestId("home-campaign").locator("img").evaluate((element) => {
    const image = element as HTMLImageElement;
    const style = getComputedStyle(image);
    const box = image.getBoundingClientRect();
    const scale = style.objectFit === "cover" ? Math.max(box.width / image.naturalWidth, box.height / image.naturalHeight) : box.width / image.naturalWidth;
    const renderedWidth = image.naturalWidth * scale;
    const offset = (box.width - renderedWidth) * (parseFloat(style.objectPosition) / 100);
    return { objectFit: style.objectFit, start: -offset / renderedWidth, end: (box.width - offset) / renderedWidth };
  });
  const widths = testInfo.project.name === "desktop-1280" ? [360, 390, 608, 640, 641, 768, 896, 1024, 1025, 1152, 1153, 1280] : [page.viewportSize()?.width ?? 0];
  await page.goto("/");
  const image = page.getByTestId("home-campaign").locator("img");
  await expect.poll(() => image.evaluate((element) => (element as HTMLImageElement).complete && (element as HTMLImageElement).naturalWidth > 0)).toBe(true);
  for (const width of widths) {
    if (testInfo.project.name === "desktop-1280") await page.setViewportSize({ width, height: 900 });
    const share = await visibleShare();
    expect(share.objectFit, `${width}px`).toBe("cover");
    expect(share.start, `${width}px crop is anchored to the artwork's left edge`).toBeLessThanOrEqual(0.001);
    expect(share.end, `${width}px crop must stop before the rasterized copy`).toBeLessThan(rasterizedCopyStart);
  }
});

test("home capability links are named by their titles and described by their summaries", async ({ page }) => {
  await page.goto("/");
  const region = page.locator('section[aria-label="حوزه‌های ترنج پلاستیک"]');
  const expected = [
    ["خدمات تزریق پلاستیک", "/injection-molding"],
    ["محصولات کاتالوگ", "/products"],
    ["مواد اولیه و پلیمرها", "/materials"],
  ] as const;
  for (const [title, href] of expected) {
    const link = region.getByRole("link", { name: title, exact: true });
    await expect(link).toHaveAttribute("href", href);
    await expect(link).toHaveAccessibleDescription(/\S/);
  }
  await expect(region.getByRole("link")).toHaveCount(3);
});
