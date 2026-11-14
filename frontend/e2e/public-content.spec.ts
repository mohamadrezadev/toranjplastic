import { expect, test, type Page } from "@playwright/test";
import {
  atWidth,
  boxOf,
  boxesOf,
  columnsOf,
  documentHeight,
  emptyCardBands,
  expectBoundedStep,
  expectNoHorizontalOverflow,
  expectThemeRoles,
  gridStep,
  inquirySteps,
  inquiryStrip,
  mediaReport,
  openSettled,
  openThemed,
  overlapping,
  projectWidth,
  rowMajorRtlViolations,
  tabSequence,
  themeReport,
  themes,
  tolerance,
  walkKeyboard,
  type Box,
} from "./support/public-content-helpers";

/*
 * Public content verification for the Astryx migration (OpenSpec change
 * rebuild-ui-with-astryx, task 5.4): keyboard order, Persian RTL reading
 * order, media bounds, theme roles, feedback states and continuous responsive
 * transitions at and around the CSS Module breakpoints. The browser helpers
 * live in e2e/support/public-content-helpers.ts and are shared with
 * e2e/public-content-variants.spec.ts, which covers the multi-page, image and
 * long-content fixtures of the mock server.
 *
 * Breakpoints under test (one pixel below, at and one pixel above):
 * - app/(public)/page.module.css: 40rem (640px), 48rem (768px), 64rem (1024px);
 * - components/content/Content.module.css: 38rem (608px), 56rem (896px), the
 *   CatalogLandingHero <source media="(max-width: 608px)">, and the
 *   BalancedGrid steps at 40rem (640px) and 64rem (1024px);
 * - (content)/institutional-pages.module.css: 38rem (608px);
 * - the Astryx Grid auto-fit step of one or two cards (two 264px tracks, a
 *   20px gap and the 24px page gutters: 596px), found by measurement.
 * Astryx Grid collections (one or two cards) reflow by container width
 * instead of media queries, and every grid collection is swept continuously.
 *
 * Every keyboard walk, breakpoint test and sweep runs in both themes: the
 * light tests keep their original titles and the dark ones add a suffix.
 *
 * Page-level overflow: see the note in the helper module (html and body both
 * hide horizontal overflow, so the helpers read body and every element).
 */

/* ------------------------------------------------------------------------ */
/* Keyboard: Tab order, visual RTL order, focus treatment and targets       */
/* ------------------------------------------------------------------------ */

/*
 * Every route is walked in both themes. The stops are exact: link targets and
 * button labels in Tab order. Routes with more variants (pagination, images,
 * long content) are walked in e2e/public-content-variants.spec.ts.
 */
const keyboardRoutes: ReadonlyArray<{ path: string; stops: ReadonlyArray<string> }> = [
  {
    path: "/",
    // Campaign actions, the three capability cards, the inquiry action, the article band and the closing action.
    stops: ["/products", "/inquiry", "/injection-molding", "/products", "/materials", "/inquiry", "/articles", "/articles/material-selection", "/articles/material-selection", "/articles/plastic-injection-material-selection-guide", "/articles/plastic-injection-material-selection-guide", "/contact"],
  },
  {
    path: "/products",
    // Breadcrumb, the landing hero's primary and inquiry actions, then the card title and detail links; the media shortcut is skipped.
    stops: ["/", "#product-catalog", "/inquiry/product", "/products/industrial-basket", "/products/industrial-basket"],
  },
  { path: "/products/industrial-basket", stops: ["/", "/products", "/inquiry/product?slug=industrial-basket", "/inquiry/product?slug=industrial-basket"] },
  {
    path: "/articles",
    // The category strip is one Tab stop; each card offers its category, title and detail links.
    stops: ["/", "/articles", "/articles/category/materials-selection-category", "/articles/material-selection", "/articles/material-selection", "/articles/category/tech-production", "/articles/plastic-injection-material-selection-guide", "/articles/plastic-injection-material-selection-guide"],
  },
  {
    path: "/articles/category/tech-production",
    // The category strip persists as one Tab stop on the current category, then the way back and the card links.
    stops: ["/", "/articles", "/articles/category/tech-production", "/articles", "/articles/plastic-injection-material-selection-guide", "/articles/plastic-injection-material-selection-guide"],
  },
  { path: "/articles/material-selection", stops: ["/", "/articles", "/articles/category/materials-selection-category", "/articles/category/materials-selection-category"] },
  { path: "/about", stops: ["/", "/inquiry", "/inquiry", "/contact"] },
  { path: "/contact", stops: ["/", "/inquiry", "tel:+989132075925", "tel:+989122009515", "tel:+989104500086", "mailto:info@toranjplastic.com", "/inquiry"] },
  { path: "/injection-molding", stops: ["/", "/inquiry/injection"] },
  { path: "/materials", stops: ["button:تلاش دوباره"] },
  { path: "/products/unknown-product", stops: ["/", "/"] },
  // Privacy and terms render through ManagedPage: the breadcrumb is their only control.
  { path: "/privacy", stops: ["/"] },
  { path: "/terms", stops: ["/"] },
];

for (const route of keyboardRoutes) {
  for (const theme of themes) {
    test(`keyboard reaches ${route.path} actions, cards and links in visual RTL order with visible ${theme} focus`, async ({ page }) => {
      await walkKeyboard(page, route.path, theme, route.stops);
    });
  }
}

test("keyboard activation follows the card detail link and the not-found way home", async ({ page }) => {
  await openSettled(page, "/products");
  const detail = page.getByRole("article").first().getByRole("link", { name: "مشاهده جزئیات" });
  await detail.focus();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/products\/industrial-basket$/);
  await expect(page.getByRole("heading", { level: 1, name: "سبد صنعتی نمونه" })).toBeVisible();

  await openSettled(page, "/products/unknown-product");
  const home = page.getByRole("link", { name: "بازگشت به خانه" });
  await home.focus();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByTestId("home-campaign")).toBeVisible();
});

test("the in-page catalog action moves keyboard focus into the catalog it scrolls to", async ({ page }) => {
  await openSettled(page, "/products");
  const action = page.getByRole("link", { name: "مشاهده محصولات" });
  await expect(action).toHaveAttribute("href", "#product-catalog");
  await action.focus();
  await page.keyboard.press("Enter");
  // The browser's own fragment navigation: the catalog target takes focus instead of the hero action keeping it.
  const catalog = page.locator("#product-catalog");
  await expect(catalog).toBeFocused();
  await expect(page).toHaveURL(/\/products#product-catalog$/);
  await expect(page.getByRole("heading", { level: 2, name: "محصولات", exact: true })).toBeInViewport();
  // The next Tab continues inside the catalog at the first card's title link, without jumping back to the hero.
  await page.keyboard.press("Tab");
  const firstCardTitle = page.getByRole("article").first().getByRole("link", { name: "سبد صنعتی نمونه" });
  await expect(firstCardTitle).toBeFocused();
  await expect(firstCardTitle).toBeInViewport();
  // The focused region is a target, not a control: it draws no ring of its own.
  expect(await catalog.evaluate((element) => getComputedStyle(element).outlineStyle)).toBe("none");
});

/* ------------------------------------------------------------------------ */
/* Content presentation                                                     */
/* ------------------------------------------------------------------------ */

test("specifications render as a framed spec sheet with monospaced LTR values", async ({ page }) => {
  const width = projectWidth(page);
  await openSettled(page, "/products/industrial-basket");
  const sheet = page.locator("section").filter({ has: page.getByRole("heading", { level: 2, name: "مشخصات تأییدشده" }) });
  await sheet.scrollIntoViewIfNeeded();
  const report = await sheet.evaluate((section) => {
    const style = getComputedStyle(section);
    const heading = section.querySelector("h2") as HTMLElement;
    const term = section.querySelector("dt") as HTMLElement;
    const definition = section.querySelector("dd") as HTMLElement;
    const value = definition.querySelector('[dir="ltr"]') as HTMLElement;
    const box = (element: Element) => {
      const rect = element.getBoundingClientRect();
      return { left: rect.left, right: rect.right, top: rect.top, bottom: rect.bottom, width: rect.width, height: rect.height };
    };
    return {
      frame: parseFloat(style.borderTopWidth),
      radius: parseFloat(style.borderTopLeftRadius),
      sheetBackground: style.backgroundColor,
      bandBackground: getComputedStyle(heading).backgroundColor,
      bandRule: parseFloat(getComputedStyle(heading).borderBottomWidth),
      termBackground: getComputedStyle(term).backgroundColor,
      definitionBackground: getComputedStyle(definition).backgroundColor,
      valueText: value.textContent,
      valueDirection: getComputedStyle(value).direction,
      valueFont: getComputedStyle(value).fontFamily,
      bodyFont: getComputedStyle(document.body).fontFamily,
      sheet: box(section),
      term: box(term),
      definition: box(definition),
    };
  });
  // A framed panel with a header band and a shaded label cell, not loose text on the canvas.
  expect(report.frame).toBeGreaterThanOrEqual(1);
  expect(report.radius).toBeGreaterThan(0);
  expect(report.bandRule).toBeGreaterThanOrEqual(1);
  expect(report.bandBackground).not.toBe(report.sheetBackground);
  expect(report.termBackground).not.toBe(report.definitionBackground);
  // The LTR code keeps its isolated run in the monospaced code face.
  expect(report.valueText).toBe("TRJ-P-001");
  expect(report.valueDirection).toBe("ltr");
  expect(report.valueFont).not.toBe(report.bodyFont);
  expect(report.valueFont).toMatch(/mono|consolas/i);
  // Cells fill the sheet: a label and value row above 38rem, a label band above its value at or below it.
  expect(report.term.right).toBeLessThanOrEqual(report.sheet.right + tolerance);
  expect(report.definition.left).toBeGreaterThanOrEqual(report.sheet.left - tolerance);
  if (width > 608) {
    expect(Math.abs(report.term.top - report.definition.top)).toBeLessThanOrEqual(tolerance);
    expect(Math.abs(report.term.bottom - report.definition.bottom)).toBeLessThanOrEqual(tolerance);
    expect(report.definition.right).toBeLessThanOrEqual(report.term.left + tolerance);
  } else {
    expect(report.definition.top).toBeGreaterThanOrEqual(report.term.bottom - tolerance);
  }
  await expectNoHorizontalOverflow(page, "/products/industrial-basket specifications");
});

test("a long CMS tag value wraps inside its card instead of being cut", async ({ page }) => {
  await openSettled(page, "/products");
  const tag = page.getByRole("article").first().locator(".astryx-badge").first();
  await tag.scrollIntoViewIfNeeded();
  const oneLine = (await tag.boundingBox())?.height ?? 0;
  const result = await tag.evaluate((badge) => {
    const label = badge.lastElementChild as HTMLElement;
    label.textContent = Array.from({ length: 4 }, () => "تأمین‌کننده ثبت‌شده با نام بسیار طولانی برای بررسی شکستن سطر").join(" ");
    const card = (badge.closest('[role="article"]') as HTMLElement).getBoundingClientRect();
    const box = badge.getBoundingClientRect();
    return { cut: label.scrollWidth > label.clientWidth + 1, height: box.height, inside: box.left >= card.left - 1 && box.right <= card.right + 1 };
  });
  expect(result.cut, "the whole value stays visible").toBe(false);
  expect(result.inside, "the tag stays inside its card").toBe(true);
  expect(result.height, "the tag grows onto more lines").toBeGreaterThan(oneLine * 1.5);
  await expectNoHorizontalOverflow(page, "/products with a long tag");
});

test("a third content card spans the two-column row as a horizontal card", async ({ page }) => {
  const width = projectWidth(page);
  // The fixtures publish two articles, so no route renders three content cards: borrow
  // a real card from /articles and make it the third item of the about page's balanced set.
  await openSettled(page, "/articles");
  const cardHtml = await page.getByRole("article").first().evaluate((card) => card.outerHTML);
  await openSettled(page, "/about");
  const gridSelector = 'section[aria-labelledby="fleet-capabilities-title"] [data-layout="balanced"]';
  await page.locator(gridSelector).evaluate((grid, html) => {
    (grid.lastElementChild as HTMLElement).outerHTML = html;
  }, cardHtml);
  const card = page.locator(`${gridSelector} > [role="article"]`);
  await card.scrollIntoViewIfNeeded();
  const items = await boxesOf(page, `${gridSelector} > *`);
  const grid = await boxOf(page, gridSelector);
  const media = await boxOf(page, `${gridSelector} > [role="article"] a[aria-hidden="true"]`);
  const title = await boxOf(page, `${gridSelector} > [role="article"] h2`);
  expect(overlapping(items)).toBe(false);
  if (width > 1024) {
    // Three columns: the card shares the first row and keeps its media above the title.
    expect(columnsOf(items)).toBe(3);
    expect(title.top).toBeGreaterThanOrEqual(media.bottom - tolerance);
  } else if (width > 640) {
    // Two columns: the third card spans the row, media at the inline start beside the copy.
    expect(columnsOf(items)).toBe(2);
    expect(Math.abs(items[2].left - grid.left)).toBeLessThanOrEqual(tolerance);
    expect(Math.abs(items[2].right - grid.right)).toBeLessThanOrEqual(tolerance);
    expect(title.right).toBeLessThanOrEqual(media.left + tolerance);
    expect(Math.abs(media.right - items[2].right)).toBeLessThanOrEqual(tolerance);
    // Natural height: the copy sets the row and the media fills it, instead of a row-wide 4:3 image above the copy.
    expect(media.height).toBeLessThanOrEqual(items[2].height + tolerance);
    expect(items[2].height).toBeLessThan(grid.width * 0.6);
  } else {
    expect(columnsOf(items)).toBe(1);
    expect(title.top).toBeGreaterThanOrEqual(media.bottom - tolerance);
  }
  await expectNoHorizontalOverflow(page, `/about with a third content card at ${width}px`);
});

/* ------------------------------------------------------------------------ */
/* RTL order in multi-column compositions                                   */
/* ------------------------------------------------------------------------ */

test("multi-column compositions start at the inline start and read in DOM order", async ({ page }) => {
  const width = projectWidth(page);
  // Content cards keep their natural height (no blank band inside a shorter card), so their rows are not
  // required to share one height; every other grid here (the inquiry steps) does stretch its items.
  const expectGrid = async (selector: string, containerSelector: string, columns: number, context: string, { equalHeights = true } = {}) => {
    const boxes = await boxesOf(page, selector);
    const container = await boxOf(page, containerSelector);
    expect(columnsOf(boxes), `${context} columns at ${width}px`).toBe(columns);
    expect(rowMajorRtlViolations(boxes, container, { equalHeights }), `${context} at ${width}px`).toEqual([]);
    expect(overlapping(boxes), `${context} must not overlap`).toBe(false);
  };

  await openSettled(page, "/");
  const capabilities = 'section[aria-label="حوزه‌های ترنج پلاستیک"] > a';
  const capabilityColumns = width > 1024 ? 3 : width > 640 ? 2 : 1;
  const capabilityBoxes = await boxesOf(page, capabilities);
  const capabilityRegion = await boxOf(page, 'section[aria-label="حوزه‌های ترنج پلاستیک"]');
  expect(columnsOf(capabilityBoxes)).toBe(capabilityColumns);
  expect(Math.abs(capabilityBoxes[0].right - capabilityRegion.right)).toBeLessThanOrEqual(tolerance);
  if (capabilityColumns === 2) {
    // The odd last card spans the row instead of leaving an empty track.
    expect(capabilityBoxes[1].right).toBeLessThanOrEqual(capabilityBoxes[0].left + tolerance);
    expect(Math.abs(capabilityBoxes[2].left - capabilityBoxes[1].left)).toBeLessThanOrEqual(tolerance);
    expect(Math.abs(capabilityBoxes[2].right - capabilityBoxes[0].right)).toBeLessThanOrEqual(tolerance);
  } else {
    expect(rowMajorRtlViolations(capabilityBoxes, capabilityRegion)).toEqual([]);
  }
  await expectGrid(inquirySteps, `${inquiryStrip} ol`, width > 768 ? 3 : 1, "inquiry steps");
  await expectGrid('section[aria-labelledby="articles-title"] [role="article"]', 'section[aria-labelledby="articles-title"] [data-layout]', width >= 600 ? 2 : 1, "latest articles", { equalHeights: false });
  expect(await emptyCardBands(page, 'section[aria-labelledby="articles-title"]'), "latest articles: no blank band inside a card").toEqual([]);

  await openSettled(page, "/articles");
  await expectGrid('[role="article"]', "[data-layout]", width >= 600 ? 2 : 1, "article collection", { equalHeights: false });
  expect(await emptyCardBands(page), "article collection: no blank band inside a card").toEqual([]);

  // Three-card sets use the balanced steps: in the two-column state the third card spans the row, so no row ends beside an empty track.
  const expectBalanced = async (items: string, containerSelector: string, context: string) => {
    const boxes = await boxesOf(page, items);
    const container = await boxOf(page, containerSelector);
    expect(boxes, context).toHaveLength(3);
    expect(columnsOf(boxes), `${context} columns at ${width}px`).toBe(width > 1024 ? 3 : width > 640 ? 2 : 1);
    expect(rowMajorRtlViolations(boxes, container), `${context} at ${width}px`).toEqual([]);
    expect(overlapping(boxes), `${context} must not overlap`).toBe(false);
    expect(Math.abs(boxes[2].left - container.left), `${context}: the last card reaches the inline end at ${width}px`).toBeLessThanOrEqual(tolerance);
  };
  await openSettled(page, "/about");
  await expectBalanced('section[aria-labelledby="fleet-capabilities-title"] [data-layout="balanced"] > .astryx-card', 'section[aria-labelledby="fleet-capabilities-title"] [data-layout="balanced"]', "activity lines");

  await openSettled(page, "/contact");
  await expectBalanced('section[aria-labelledby="contact-channels-title"] [data-layout="balanced"] > .astryx-card', 'section[aria-labelledby="contact-channels-title"] [data-layout="balanced"]', "contact channels");

  // Paired actions keep the primary action at the inline start whenever they share a row.
  await openSettled(page, "/products");
  const [primary, inquiry] = await boxesOf(page, 'section[aria-labelledby="catalog-landing-title"] a');
  if (width > 608) expect(inquiry.right).toBeLessThanOrEqual(primary.left + tolerance);
  else expect(inquiry.top).toBeGreaterThanOrEqual(primary.bottom - tolerance);

  // Product detail: the media leads at the inline start beside the copy on wide screens.
  await openSettled(page, "/products/industrial-basket");
  const hero = page.locator("[data-media]");
  await expect(hero).toHaveAttribute("data-media", "image");
  const media = await boxOf(page, '[data-media="image"] img');
  const title = await boxOf(page, '[data-media="image"] h1');
  if (width > 896) expect(title.right).toBeLessThanOrEqual(media.left + tolerance);
  else expect(title.top).toBeGreaterThanOrEqual(media.bottom - tolerance);
});

/* ------------------------------------------------------------------------ */
/* Media bounds                                                             */
/* ------------------------------------------------------------------------ */

for (const theme of themes) {
  test(`media loads inside bounded frames without distortion in the ${theme} theme`, async ({ page }) => {
    await page.emulateMedia({ colorScheme: theme });
    for (const path of ["/", "/products", "/products/industrial-basket", "/injection-molding"]) {
      await openSettled(page, path);
      const report = await mediaReport(page);
      expect(report.length, `${path} renders its approved media`).toBeGreaterThan(0);
      for (const image of report) {
        const label = `${path} ${image.source}`;
        expect(image.naturalWidth, `${label} must load`).toBeGreaterThan(0);
        expect(image.insideFrame, `${label} must stay inside its frame`).toBe(true);
        if (image.objectFit === "fill") {
          const distortion = Math.abs(image.width / image.height - image.naturalWidth / image.naturalHeight) / (image.naturalWidth / image.naturalHeight);
          expect(distortion, `${label} must keep its aspect ratio`).toBeLessThan(0.02);
        } else {
          expect(["cover", "contain"], `${label} object-fit`).toContain(image.objectFit);
        }
        // Verified product media is never recoloured by the theme.
        expect([image.filter, image.opacity, image.blend], `${label} keeps its verified colours`).toEqual(["none", "1", "normal"]);
      }
      await expectNoHorizontalOverflow(page, `${path} (${theme})`);
    }
  });
}

test("catalog landing artwork stays inside its bounded media frame", async ({ page }) => {
  const width = projectWidth(page);
  // At or below 56rem the artwork is a fixed 16rem (10rem at or below 38rem)
  // strip: the image fills it and object-fit crops it from the bottom, so the
  // overflow clip never cuts through the artwork's rasterized headline.
  await openSettled(page, "/products");
  const report = await mediaReport(page);
  const landing = report.find((image) => image.landing);
  expect(landing, "landing artwork").toBeDefined();
  expect(landing?.naturalWidth).toBeGreaterThan(0);
  expect(landing?.insideFrame, `landing artwork ${landing?.width}x${landing?.height} must stay inside its media frame`).toBe(true);
  const fit = await page.locator('section[aria-labelledby="catalog-landing-title"] img').evaluate((image) => {
    const style = getComputedStyle(image);
    const frame = (image.closest('[data-toranj-surface="inverse"]') as HTMLElement).getBoundingClientRect();
    return { objectFit: style.objectFit, objectPosition: style.objectPosition, height: image.getBoundingClientRect().height, frame: frame.height };
  });
  expect(fit.objectFit).toBe("cover");
  if (width <= 896) {
    // The image fills the strip (less its padding) and keeps the product half of the artwork.
    expect(fit.height).toBeLessThanOrEqual(fit.frame);
    expect(fit.height).toBeGreaterThan(fit.frame * 0.8);
    expect(fit.objectPosition).toBe("50% 100%");
  }
});

test("catalog cards keep a stable footprint while media is unavailable", async ({ page }) => {
  const media = "**/catalog/refrigerator-organizer.webp";
  const card = page.getByRole("article").first();
  const cardImage = card.locator("img");

  // First without the product media: the request fails, so nothing is cached for the second load.
  await page.route(media, (route) => route.abort());
  await openSettled(page, "/products");
  await card.scrollIntoViewIfNeeded();
  await expect.poll(() => cardImage.evaluate((image) => (image as HTMLImageElement).complete)).toBe(true);
  expect(await cardImage.evaluate((image) => (image as HTMLImageElement).naturalWidth)).toBe(0);
  const unavailable = await card.boundingBox();
  await expect(card.getByRole("heading", { name: "سبد صنعتی نمونه" })).toBeVisible();
  await expect(card.getByRole("link", { name: "مشاهده جزئیات" })).toBeVisible();

  await page.unroute(media);
  await openSettled(page, "/products");
  await card.scrollIntoViewIfNeeded();
  await expect.poll(() => cardImage.evaluate((image) => (image as HTMLImageElement).complete && (image as HTMLImageElement).naturalWidth > 0)).toBe(true);
  const loaded = await card.boundingBox();
  expect(Math.abs((unavailable?.height ?? 0) - (loaded?.height ?? 0)), "card height with and without media").toBeLessThanOrEqual(1);
  expect(Math.abs((unavailable?.width ?? 0) - (loaded?.width ?? 0)), "card width with and without media").toBeLessThanOrEqual(1);
});

/* ------------------------------------------------------------------------ */
/* Theme roles                                                              */
/* ------------------------------------------------------------------------ */

for (const theme of themes) {
  test(`${theme} theme keeps the Toranj canvas, text roles and readable cards`, async ({ page }) => {
    await page.emulateMedia({ colorScheme: theme });
    // Element-level overflow is asserted on every route in both themes, not only on the media routes.
    for (const path of ["/", "/products", "/products/industrial-basket", "/articles", "/articles/category/tech-production", "/articles/material-selection", "/about", "/contact", "/injection-molding", "/materials", "/privacy", "/terms", "/products/unknown-product"]) {
      await openSettled(page, path);
      await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
      await expectThemeRoles(page, path, theme);
      await expectNoHorizontalOverflow(page, `${path} (${theme})`);
    }
  });
}

test("feedback banners use the mapped Toranj status role in both themes", async ({ page }) => {
  // astryx-theme.css maps --color-on-error-muted (and the success, warning and
  // info roles) to the Toranj status tokens. Without the mapping the ErrorState
  // banner text and icon fall back to the Astryx Neutral tones (#76000c light,
  // #ffaea7 dark) instead of --color-status-danger.
  for (const theme of ["light", "dark"] as const) {
    await page.emulateMedia({ colorScheme: theme });
    await openSettled(page, "/materials");
    const report = await themeReport(page);
    expect(report.unmapped, `/materials error banner text in ${theme}`).toEqual([]);
  }
});

/* ------------------------------------------------------------------------ */
/* Feedback and collection states                                           */
/* ------------------------------------------------------------------------ */

test("an empty collection keeps its landing hierarchy and an honest empty state", async ({ page }) => {
  await openSettled(page, "/injection-molding");
  await expect(page.getByRole("heading", { level: 1, name: "خدمات تزریق پلاستیک" })).toBeVisible();
  await expect(page.getByRole("heading", { level: 2, name: "خدمت منتشرشده‌ای وجود ندارد" })).toBeVisible();
  await expect(page.getByText("اطلاعات خدمات پس از بررسی فنی و انتشار رسمی در این بخش قرار می‌گیرد.", { exact: true })).toBeVisible();
  await expect(page.getByRole("article")).toHaveCount(0);
  await expect(page.getByRole("navigation", { name: "صفحه‌بندی" })).toHaveCount(0);
  await expect(page.getByTestId("injection-campaign")).toHaveAttribute("href", "/inquiry/injection");
  await expect(page.locator("main")).toHaveCount(1);
  await expectNoHorizontalOverflow(page, "/injection-molding");
});

test("an unavailable collection shows a bounded error with keyboard retry", async ({ page }) => {
  await openSettled(page, "/materials");
  const alert = page.locator("[data-error-state] [role='alert']");
  await expect(alert).toContainText("محتوای این صفحه اکنون در دسترس نیست");
  await expect(alert).toContainText("ارتباط با سرویس محتوا برقرار نشد. کمی بعد دوباره تلاش کنید.");
  await expect(alert).not.toContainText(/fixture|503|127\.0\.0\.1|stack/i);
  // The error screen names the page like the not-found screen: the message is its one level-one heading, with the same Persian copy.
  const heading = page.getByRole("heading", { level: 1, name: "محتوای این صفحه اکنون در دسترس نیست", exact: true });
  await expect(heading).toHaveCount(1);
  await expect(alert.getByRole("heading", { level: 1 })).toHaveCount(1);
  await expect(page.locator("main").getByRole("heading")).toHaveCount(1);
  // It is drawn in the Banner title's own type, not in the heading-level scale: no visual change from the plain title.
  const title = await heading.evaluate((element) => {
    const box = (node: Element) => {
      const style = getComputedStyle(node);
      return { fontFamily: style.fontFamily, fontSize: style.fontSize, fontWeight: style.fontWeight, lineHeight: style.lineHeight, letterSpacing: style.letterSpacing, color: style.color };
    };
    const banner = element.parentElement as HTMLElement;
    return { heading: box(element), banner: box(banner), margins: [getComputedStyle(element).marginTop, getComputedStyle(element).marginBottom] };
  });
  expect(title.heading, "the heading takes the Banner title's type and colour").toEqual(title.banner);
  expect(title.margins, "the heading adds no margin").toEqual(["0px", "0px"]);
  // An outage is never presented as an empty catalog.
  await expect(page.getByRole("article")).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "ماده منتشرشده‌ای وجود ندارد" })).toHaveCount(0);
  await expect(page.locator("main")).toHaveCount(1);

  const retry = page.getByRole("button", { name: "تلاش دوباره" });
  const target = await retry.boundingBox();
  expect(target?.height).toBeGreaterThanOrEqual(44);
  const stops = await tabSequence(page);
  expect(stops.filter((stop) => stop.region === "main").map((stop) => stop.target)).toEqual(["button:تلاش دوباره"]);
  await retry.focus();
  await page.keyboard.press("Enter");
  // The fixture stays unavailable: the retry returns to the same bounded state without a crash.
  await expect(alert).toContainText("محتوای این صفحه اکنون در دسترس نیست");
  await expect(page.locator("main")).toHaveCount(1);
  await expectNoHorizontalOverflow(page, "/materials");
});

test("missing records share one neutral, non-indexable not-found experience", async ({ page }) => {
  for (const path of ["/products/unknown-product", "/materials/unknown-material", "/injection-molding/unknown-service", "/articles/non-existent-article-slug"]) {
    await openSettled(page, path);
    // The message is the page's level-one heading and the only heading in <main>.
    await expect(page.getByRole("heading", { level: 1, name: "محتوای موردنظر پیدا نشد" }), path).toBeVisible();
    await expect(page.locator("main").getByRole("heading"), path).toHaveCount(1);
    await expect(page.getByText("این محتوا وجود ندارد یا هنوز برای نمایش عمومی منتشر نشده است.", { exact: true })).toBeVisible();
    const breadcrumb = page.getByRole("navigation", { name: "مسیر صفحه" });
    await expect(breadcrumb.locator('[aria-current="page"]')).toHaveText("صفحه پیدا نشد");
    await expect(page.getByRole("link", { name: "بازگشت به خانه" })).toHaveAttribute("href", "/");
    const robots = await page.locator('meta[name="robots"]').evaluateAll((metas) => metas.map((meta) => meta.getAttribute("content") ?? ""));
    expect(robots.some((content) => /noindex/.test(content)), `${path} must not be indexable`).toBe(true);
    await expect(page.locator("main")).toHaveCount(1);
  }
});

test("single-page collections render no pagination", async ({ page }) => {
  // The legacy fixtures publish one page per collection. Multi-page links are rendered in a real
  // browser by e2e/public-content-variants.spec.ts (the ?page=2 and ?page=3 fixtures).
  for (const path of ["/products", "/articles", "/articles/category/tech-production"]) {
    await openSettled(page, path);
    await expect(page.getByRole("article").first(), path).toBeVisible();
    await expect(page.getByRole("navigation", { name: "صفحه‌بندی" }), path).toHaveCount(0);
  }
});

test("text-only detail heroes drop the media panel instead of an empty frame", async ({ page }) => {
  for (const path of ["/about", "/contact", "/articles/material-selection"]) {
    await openSettled(page, path);
    const hero = page.locator("[data-media]");
    await expect(hero, path).toHaveAttribute("data-media", "none");
    await expect(hero.locator("img")).toHaveCount(0);
    await expect(page.getByText("تصویر محصول ثبت نشده است")).toHaveCount(0);
    const heading = await boxOf(page, "[data-media] h1");
    const card = await boxOf(page, "[data-media]");
    // One column: the copy starts at the card's inline start.
    expect(card.right - heading.right).toBeLessThan(card.width / 4);
  }
});

/* ------------------------------------------------------------------------ */
/* Continuous responsive transitions (one deterministic project)            */
/* ------------------------------------------------------------------------ */

test.describe("responsive transitions around breakpoints", () => {
  // setViewportSize drives every width, so one project runs the sweep.
  const sweepProject = (projectName: string) => test.skip(projectName !== "desktop-1280", "single deterministic breakpoint sweep");

  async function homeLayout(page: Page) {
    const cards = await boxesOf(page, 'section[aria-label="حوزه‌های ترنج پلاستیک"] > a');
    return {
      copy: await boxOf(page, '[data-testid="home-campaign"] h1'),
      media: await boxOf(page, '[data-testid="home-campaign"] img'),
      cards,
      cardColumns: columnsOf(cards),
      steps: await boxesOf(page, inquirySteps),
      inquiryAction: await boxOf(page, `${inquiryStrip} a`),
      inquiryBand: await boxOf(page, `${inquiryStrip} ol`),
      height: await documentHeight(page),
    };
  }

  const expectProportionate = (below: { height: number; cards?: Box[] }, above: { height: number; cards?: Box[] }, context: string) => {
    const change = Math.abs(above.height - below.height) / below.height;
    expect(change, `${context}: document length jump`).toBeLessThan(0.3);
    if (below.cards && above.cards) {
      const tallest = (boxes: Box[]) => Math.max(...boxes.map((box) => box.height));
      const ratio = tallest(below.cards) / tallest(above.cards);
      expect(Math.max(ratio, 1 / ratio), `${context}: card height jump`).toBeLessThan(1.5);
      expect(Math.abs(columnsOf(above.cards) - columnsOf(below.cards)), `${context}: column step`).toBeLessThanOrEqual(1);
    }
  };

  async function catalogLayout(page: Page) {
    return {
      hero: await boxOf(page, 'section[aria-labelledby="catalog-landing-title"]'),
      media: await boxOf(page, 'section[aria-labelledby="catalog-landing-title"] [data-toranj-surface="inverse"]'),
      copy: await boxOf(page, "#catalog-landing-title"),
      actions: await boxesOf(page, 'section[aria-labelledby="catalog-landing-title"] a'),
      source: await page.locator('section[aria-labelledby="catalog-landing-title"] img').evaluate((image) => (image as HTMLImageElement).currentSrc),
      heading: await boxOf(page, "#product-catalog header h2"),
      description: await boxOf(page, "#product-catalog header p"),
      card: await boxOf(page, '[data-layout="featured"] [role="article"]'),
      cardMedia: await boxOf(page, '[data-layout="featured"] [role="article"] a[aria-hidden="true"]'),
      // Catalog card titles are level three under the catalog's own level-two heading.
      cardTitle: await boxOf(page, '[data-layout="featured"] [role="article"] h3'),
      height: await documentHeight(page),
    };
  }

  /** The first width in [low, high] with more columns than at low: columns only grow while the viewport widens. */
  async function firstWiderStep(page: Page, items: string, low: number, high: number) {
    await atWidth(page, low);
    const base = columnsOf(await boxesOf(page, items));
    await atWidth(page, high);
    expect(columnsOf(await boxesOf(page, items)), "the step lies inside the searched widths").toBeGreaterThan(base);
    let below = low;
    let above = high;
    while (above - below > 1) {
      const middle = Math.floor((below + above) / 2);
      await atWidth(page, middle);
      if (columnsOf(await boxesOf(page, items)) > base) above = middle;
      else below = middle;
    }
    return above;
  }

  for (const theme of themes) {
    const suffix = theme === "dark" ? " in the dark theme" : "";

    test(`home campaign, capability cards and inquiry action around 40rem${suffix}`, async ({ page }, testInfo) => {
      sweepProject(testInfo.project.name);
      await openThemed(page, "/", theme);
      const layouts = [];
      for (const width of [639, 640, 641]) {
        await atWidth(page, width);
        const layout = await homeLayout(page);
        layouts.push(layout);
        await expectNoHorizontalOverflow(page, `home at ${width}px`);
        expect(overlapping(layout.cards)).toBe(false);
        if (width <= 640) {
          // Artwork above the copy, one capability column, a full-width inquiry action.
          expect(layout.copy.top).toBeGreaterThanOrEqual(layout.media.bottom - tolerance);
          expect(layout.cardColumns).toBe(1);
          expect(layout.inquiryAction.width).toBeGreaterThanOrEqual(layout.inquiryBand.width - tolerance);
        } else {
          // Copy at the inline start beside the artwork; two capability columns with the odd card spanning.
          expect(layout.copy.left).toBeGreaterThanOrEqual(layout.media.right - tolerance);
          expect(layout.cardColumns).toBe(2);
          expect(Math.abs(layout.cards[2].right - layout.cards[0].right)).toBeLessThanOrEqual(tolerance);
          expect(Math.abs(layout.cards[2].left - layout.cards[1].left)).toBeLessThanOrEqual(tolerance);
          expect(layout.inquiryAction.width).toBeLessThan(layout.inquiryBand.width - tolerance);
        }
      }
      expectProportionate(layouts[0], layouts[2], "home 639 -> 641px");
    });

    test(`home inquiry steps around 48rem${suffix}`, async ({ page }, testInfo) => {
      sweepProject(testInfo.project.name);
      await openThemed(page, "/", theme);
      const layouts = [];
      for (const width of [767, 768, 769]) {
        await atWidth(page, width);
        const layout = await homeLayout(page);
        layouts.push(layout);
        await expectNoHorizontalOverflow(page, `home at ${width}px`);
        const band = await boxOf(page, `${inquiryStrip} ol`);
        expect(columnsOf(layout.steps)).toBe(width <= 768 ? 1 : 3);
        expect(rowMajorRtlViolations(layout.steps, band)).toEqual([]);
        expect(layout.cardColumns).toBe(2);
      }
      expectProportionate(layouts[0], layouts[2], "home 767 -> 769px");
    });

    test(`home capability cards around 64rem${suffix}`, async ({ page }, testInfo) => {
      sweepProject(testInfo.project.name);
      await openThemed(page, "/", theme);
      const layouts = [];
      for (const width of [1023, 1024, 1025]) {
        await atWidth(page, width);
        const layout = await homeLayout(page);
        layouts.push(layout);
        await expectNoHorizontalOverflow(page, `home at ${width}px`);
        expect(overlapping(layout.cards)).toBe(false);
        expect(layout.cardColumns).toBe(width <= 1024 ? 2 : 3);
        if (width > 1024) {
          const region = await boxOf(page, 'section[aria-label="حوزه‌های ترنج پلاستیک"]');
          expect(rowMajorRtlViolations(layout.cards, region)).toEqual([]);
        }
      }
      expectProportionate(layouts[0], layouts[2], "home 1023 -> 1025px");
    });

    test(`product catalog landing, actions, artwork source and featured card around 38rem${suffix}`, async ({ page }, testInfo) => {
      sweepProject(testInfo.project.name);
      await openThemed(page, "/products", theme);
      const layouts = [];
      for (const width of [607, 608, 609]) {
        await atWidth(page, width);
        await expect.poll(() => page.locator('section[aria-labelledby="catalog-landing-title"] img').evaluate((image) => (image as HTMLImageElement).currentSrc)).toContain(width <= 608 ? "/catalog/refrigerator-organizer.webp" : "/branding/banners/products.png");
        const layout = await catalogLayout(page);
        layouts.push(layout);
        await expectNoHorizontalOverflow(page, `/products at ${width}px`);
        expect(layout.copy.top).toBeGreaterThanOrEqual(layout.media.bottom - tolerance);
        const [primary, inquiry] = layout.actions;
        if (width <= 608) {
          // A 10rem artwork strip, full-width stacked actions and a vertical featured card.
          expect(Math.round(layout.media.height)).toBe(160);
          expect(inquiry.top).toBeGreaterThanOrEqual(primary.bottom - tolerance);
          expect(Math.abs(inquiry.width - primary.width)).toBeLessThanOrEqual(tolerance);
          expect(layout.cardTitle.top).toBeGreaterThanOrEqual(layout.cardMedia.bottom - tolerance);
        } else {
          // A 16rem artwork strip, actions sharing a row from the inline start and a horizontal featured card.
          expect(Math.round(layout.media.height)).toBe(256);
          expect(inquiry.right).toBeLessThanOrEqual(primary.left + tolerance);
          expect(layout.cardTitle.right).toBeLessThanOrEqual(layout.cardMedia.left + tolerance);
          expect(Math.round(layout.card.height)).toBe(320);
        }
      }
      expectProportionate(layouts[0], layouts[2], "/products 607 -> 609px");
    });

    test(`product catalog landing, section heading and featured card around 56rem${suffix}`, async ({ page }, testInfo) => {
      sweepProject(testInfo.project.name);
      await openThemed(page, "/products", theme);
      const layouts = [];
      for (const width of [895, 896, 897]) {
        await atWidth(page, width);
        const layout = await catalogLayout(page);
        layouts.push(layout);
        await expectNoHorizontalOverflow(page, `/products at ${width}px`);
        if (width <= 896) {
          expect(layout.copy.top).toBeGreaterThanOrEqual(layout.media.bottom - tolerance);
          expect(layout.description.top).toBeGreaterThanOrEqual(layout.heading.bottom - tolerance);
          expect(Math.round(layout.card.height)).toBe(320);
        } else {
          // Copy at the inline start beside the artwork; the section description beside its heading.
          expect(layout.copy.left).toBeGreaterThanOrEqual(layout.media.right - tolerance);
          expect(layout.description.right).toBeLessThanOrEqual(layout.heading.left + tolerance);
          expect(Math.round(layout.card.height)).toBe(352);
        }
      }
      expectProportionate(layouts[0], layouts[2], "/products 895 -> 897px");
    });

    test(`product detail hero and inquiry action around 56rem and 38rem${suffix}`, async ({ page }, testInfo) => {
      sweepProject(testInfo.project.name);
      await openThemed(page, "/products/industrial-basket", theme);
      const measure = async () => ({
        media: await boxOf(page, '[data-media="image"] img'),
        copy: await boxOf(page, '[data-media="image"] h1'),
        action: await boxOf(page, 'section[aria-labelledby="inquiry-fast-track-title"] a'),
        card: await boxOf(page, 'section[aria-labelledby="inquiry-fast-track-title"] .astryx-card'),
        height: await documentHeight(page),
      });
      const wide = [];
      for (const width of [895, 896, 897]) {
        await atWidth(page, width);
        const layout = await measure();
        wide.push(layout);
        await expectNoHorizontalOverflow(page, `product detail at ${width}px`);
        if (width <= 896) expect(layout.copy.top).toBeGreaterThanOrEqual(layout.media.bottom - tolerance);
        else expect(layout.copy.right).toBeLessThanOrEqual(layout.media.left + tolerance);
      }
      expectProportionate(wide[0], wide[2], "product detail 895 -> 897px");
      for (const width of [607, 608, 609]) {
        await atWidth(page, width);
        const layout = await measure();
        await expectNoHorizontalOverflow(page, `product detail at ${width}px`);
        expect(layout.action.height).toBeGreaterThanOrEqual(44);
        const fullWidth = layout.action.width >= layout.card.width * 0.8;
        expect(fullWidth, `inquiry action is a full-width row only at or below 38rem (${width}px)`).toBe(width <= 608);
      }
    });

    test(`institutional actions become full-width rows at 38rem and wrap long labels${suffix}`, async ({ page }, testInfo) => {
      sweepProject(testInfo.project.name);
      await openThemed(page, "/contact", theme);
      const action = page.getByRole("link", { name: "ورود به فرم استعلام و ثبت مشخصات قطعه" });
      // The long Persian label is never cut: neither the Button nor its label parts overflow their boxes.
      const labelIsWhole = () => action.evaluate((element) => [element, ...element.querySelectorAll("*")].every((node) => node.scrollWidth <= node.clientWidth + 1 || getComputedStyle(node).overflowX === "visible"));
      for (const width of [607, 608, 609]) {
        await atWidth(page, width);
        await expectNoHorizontalOverflow(page, `/contact at ${width}px`);
        const box = await action.boundingBox();
        const callout = await boxOf(page, 'section[aria-labelledby="fast-inquiry-box-title"] .astryx-card');
        expect(box?.height ?? 0).toBeGreaterThanOrEqual(44);
        expect((box?.width ?? 0) >= callout.width * 0.8, `call-to-action is a full-width row only at or below 38rem (${width}px)`).toBe(width <= 608);
        expect(await labelIsWhole(), `call-to-action label at ${width}px`).toBe(true);
      }
      await atWidth(page, 360);
      expect(await labelIsWhole(), "call-to-action label at 360px").toBe(true);
      await expectNoHorizontalOverflow(page, "/contact at 360px");
    });

    /*
     * Thresholds that had no one-pixel check. Tolerated ratios (expectBoundedStep):
     * one column step at most; the document length changes only by what the grid
     * itself changes (plus 48px of reflow outside it); the grid length follows the
     * row count within the 1.5x card height bound; no card changes height by 1.5x.
     */
    /*
     * The mock publishes exactly two articles, so both bands below are pairs and
     * this sweep measures the Astryx Grid auto-fit step (minimum track 264px,
     * from one to two columns) for two cards only. A single card (one column,
     * 42rem cap) and three or more cards (the BalancedGrid steps at 40rem and
     * 64rem) do not take this path: the three-card sets of /about and /contact
     * are swept below and the six-card collections in
     * e2e/public-content-variants.spec.ts. The home band cannot show one or
     * three articles or article images in a browser, because the mock answers
     * the home request with the same two image-less articles.
     */
    const articleBands = [
      { name: "/articles", path: "/articles", scope: "main", items: 'main [role="article"]', container: "main [data-layout]" },
      { name: "the home latest-articles band", path: "/", scope: 'section[aria-labelledby="articles-title"]', items: 'section[aria-labelledby="articles-title"] [role="article"]', container: 'section[aria-labelledby="articles-title"] [data-layout]' },
    ];
    for (const band of articleBands) {
      test(`${band.name} two cards switch from one to two columns at the Astryx grid step${suffix}`, async ({ page }, testInfo) => {
        sweepProject(testInfo.project.name);
        await openThemed(page, band.path, theme);
        // Two 264px tracks, the 20px gap and the 24px page gutters on both sides: 596px. Found by measurement, not assumed.
        const step = await firstWiderStep(page, band.items, 540, 660);
        expect(step, `${band.name}: the auto-fit step`).toBeGreaterThanOrEqual(594);
        expect(step, `${band.name}: the auto-fit step`).toBeLessThanOrEqual(598);
        const steps = [];
        for (const width of [step - 1, step, step + 1]) {
          await atWidth(page, width);
          const layout = await gridStep(page, band.items, band.container);
          steps.push(layout);
          const context = `${band.name} at ${width}px`;
          expect(layout.columns, `${context}: columns`).toBe(width < step ? 1 : 2);
          expect(overlapping(layout.boxes), `${context}: overlap`).toBe(false);
          // Content cards keep their natural height: a row need not share one height, and no card keeps a blank band.
          expect(rowMajorRtlViolations(layout.boxes, layout.container, { equalHeights: false }), context).toEqual([]);
          expect(await emptyCardBands(page, band.scope), `${context}: blank band inside a card`).toEqual([]);
          // The first row fills the container: no empty track beside the cards.
          expect(layout.boxes[layout.columns - 1].left - layout.container.left, `${context}: empty track`).toBeLessThanOrEqual(tolerance);
          await expectNoHorizontalOverflow(page, context);
        }
        expectBoundedStep(steps[0], steps[1], `${band.name} ${step - 1} -> ${step}px`);
        // One pixel above the step nothing moves any more.
        expect(steps[2].columns).toBe(steps[1].columns);
        expect(Math.abs(steps[2].height - steps[1].height), `${band.name} ${step} -> ${step + 1}px: document length`).toBeLessThanOrEqual(8);
      });
    }

    const balancedSections = [
      { name: "/about", path: "/about", items: 'section[aria-labelledby="fleet-capabilities-title"] [data-layout="balanced"] > .astryx-card', container: 'section[aria-labelledby="fleet-capabilities-title"] [data-layout="balanced"]' },
      { name: "/contact", path: "/contact", items: 'section[aria-labelledby="contact-channels-title"] [data-layout="balanced"] > .astryx-card', container: 'section[aria-labelledby="contact-channels-title"] [data-layout="balanced"]' },
    ];
    for (const section of balancedSections) {
      test(`${section.name} balanced cards step at 40rem and 64rem without orphans or a jump${suffix}`, async ({ page }, testInfo) => {
        sweepProject(testInfo.project.name);
        await openThemed(page, section.path, theme);
        for (const threshold of [640, 1024]) {
          const steps = [];
          for (const width of [threshold - 1, threshold, threshold + 1]) {
            await atWidth(page, width);
            const layout = await gridStep(page, section.items, section.container);
            steps.push(layout);
            const context = `${section.name} at ${width}px`;
            const expectedColumns = width <= 640 ? 1 : width <= 1024 ? 2 : 3;
            expect(layout.boxes, context).toHaveLength(3);
            expect(layout.columns, `${context}: columns`).toBe(expectedColumns);
            expect(overlapping(layout.boxes), `${context}: overlap`).toBe(false);
            expect(rowMajorRtlViolations(layout.boxes, layout.container), context).toEqual([]);
            // No orphan: with two columns the third card spans the row, with three it ends the first row.
            if (expectedColumns === 2) {
              expect(Math.abs(layout.boxes[2].left - layout.container.left), `${context}: spanning card start`).toBeLessThanOrEqual(tolerance);
              expect(Math.abs(layout.boxes[2].right - layout.container.right), `${context}: spanning card end`).toBeLessThanOrEqual(tolerance);
            } else {
              expect(Math.abs(layout.boxes[2].left - layout.container.left), `${context}: last card reaches the inline end`).toBeLessThanOrEqual(tolerance);
            }
            await expectNoHorizontalOverflow(page, context);
          }
          expectBoundedStep(steps[0], steps[2], `${section.name} ${threshold - 1} -> ${threshold + 1}px`);
        }
      });
    }

    for (const route of ["/about", "/contact"]) {
      test(`${route} text-only hero stays one column at 56rem and steps its padding at 38rem${suffix}`, async ({ page }, testInfo) => {
        sweepProject(testInfo.project.name);
        await openThemed(page, route, theme);
        const hero = async () => {
          const card = await boxOf(page, "[data-media]");
          const children = await boxesOf(page, "[data-media] > * > *");
          return { card, children, copy: await boxOf(page, "[data-media] h1"), height: await documentHeight(page) };
        };
        const expectStacked = (layout: Awaited<ReturnType<typeof hero>>, context: string) => {
          // One text column: the copy starts at the card's inline start and its parts never overlap.
          expect(layout.card.right - layout.copy.right, `${context}: copy starts at the inline start`).toBeLessThan(layout.card.width / 4);
          expect(overlapping(layout.children), `${context}: overlap`).toBe(false);
          for (let index = 1; index < layout.children.length; index += 1) expect(layout.children[index].top, `${context}: part ${index + 1} follows part ${index}`).toBeGreaterThanOrEqual(layout.children[index - 1].bottom - tolerance);
        };
        await expect(page.locator("[data-media]")).toHaveAttribute("data-media", "none");
        // 56rem: a text-only hero has nothing to stack, so nothing may move.
        const wide = [];
        for (const width of [895, 896, 897]) {
          await atWidth(page, width);
          const layout = await hero();
          wide.push(layout);
          expectStacked(layout, `${route} at ${width}px`);
          await expectNoHorizontalOverflow(page, `${route} at ${width}px`);
        }
        expect(Math.abs(wide[2].card.height - wide[0].card.height), `${route} hero height 895 -> 897px`).toBeLessThanOrEqual(2);
        expect(Math.abs(wide[2].height - wide[0].height), `${route} document length 895 -> 897px`).toBeLessThanOrEqual(8);
        // 38rem: the hero padding steps from 24px to 32px. Tolerated: the hero grows by less than 1.2x (the
        // 16px of padding plus a line or two of reflow) and the document length moves by less than 3%.
        const narrow = [];
        for (const width of [607, 608, 609]) {
          await atWidth(page, width);
          const layout = await hero();
          narrow.push(layout);
          expectStacked(layout, `${route} at ${width}px`);
          await expectNoHorizontalOverflow(page, `${route} at ${width}px`);
        }
        const growth = narrow[2].card.height / narrow[0].card.height;
        expect(Math.max(growth, 1 / growth), `${route} hero height 607 -> 609px`).toBeLessThan(1.2);
        expect(Math.abs(narrow[2].height - narrow[0].height) / narrow[0].height, `${route} document length 607 -> 609px`).toBeLessThan(0.03);
      });
    }

    test(`Astryx grid collections reflow continuously without empty tracks or reordering${suffix}`, async ({ page }, testInfo) => {
      sweepProject(testInfo.project.name);
      test.setTimeout(120_000);
      // Content cards keep their natural height (equalHeights false); the institutional cards stretch to their row.
      const collections = [
        { path: "/articles", items: '[role="article"]', container: "[data-layout]", max: 2, equalHeights: false },
        { path: "/", items: 'section[aria-labelledby="articles-title"] [role="article"]', container: 'section[aria-labelledby="articles-title"] [data-layout]', max: 2, equalHeights: false },
        { path: "/about", items: 'section[aria-labelledby="fleet-capabilities-title"] [data-layout="balanced"] > .astryx-card', container: 'section[aria-labelledby="fleet-capabilities-title"] [data-layout="balanced"]', max: 3, equalHeights: true },
        { path: "/contact", items: 'section[aria-labelledby="contact-channels-title"] [data-layout="balanced"] > .astryx-card', container: 'section[aria-labelledby="contact-channels-title"] [data-layout="balanced"]', max: 3, equalHeights: true },
      ];
      for (const collection of collections) {
        await atWidth(page, 1280);
        await openThemed(page, collection.path, theme);
        let previousColumns = 0;
        for (let width = 360; width <= 1280; width += 8) {
          await atWidth(page, width);
          const boxes = await boxesOf(page, collection.items);
          const container = await boxOf(page, collection.container);
          const columns = columnsOf(boxes);
          const context = `${collection.path} at ${width}px`;
          expect(columns, `${context}: columns never decrease while widening`).toBeGreaterThanOrEqual(previousColumns);
          expect(columns - previousColumns, `${context}: one column step at a time`).toBeLessThanOrEqual(previousColumns === 0 ? collection.max : 1);
          expect(columns).toBeLessThanOrEqual(collection.max);
          expect(rowMajorRtlViolations(boxes, container, { equalHeights: collection.equalHeights }), context).toEqual([]);
          expect(overlapping(boxes), `${context}: overlap`).toBe(false);
          // The first row fills the container: no empty track beside the cards.
          expect(boxes[columns - 1].left - container.left, `${context}: empty track`).toBeLessThanOrEqual(tolerance);
          previousColumns = columns;
          await expectNoHorizontalOverflow(page, context);
        }
      }
    });

    test(`public routes never overflow horizontally between 360 and 1280 pixels${suffix}`, async ({ page }, testInfo) => {
      sweepProject(testInfo.project.name);
      test.setTimeout(180_000);
      for (const path of ["/", "/products", "/products/industrial-basket", "/injection-molding", "/materials", "/articles", "/articles/category/tech-production", "/articles/material-selection", "/about", "/contact", "/privacy", "/terms", "/products/unknown-product"]) {
        await atWidth(page, 1280);
        await openThemed(page, path, theme);
        for (let width = 360; width <= 1280; width += 16) {
          await atWidth(page, width);
          await expectNoHorizontalOverflow(page, `${path} at ${width}px`);
        }
      }
    });
  }
});
