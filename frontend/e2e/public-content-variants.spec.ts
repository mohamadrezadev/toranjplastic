import { expect, test, type Locator, type Page, type Route } from "@playwright/test";
import {
  atWidth,
  bodyLineLengths,
  boxOf,
  boxesOf,
  emptyCardBands,
  expectBoundedStep,
  expectMediaBounded,
  expectNoClippedText,
  expectNoHorizontalOverflow,
  expectNoTextOverflow,
  expectTextInside,
  expectThemeRoles,
  fa,
  gridStep,
  insideBox,
  mediaReport,
  openSettled,
  openThemed,
  overlapping,
  projectWidth,
  rowMajorRtlViolations,
  sameRow,
  seriousAxeViolations,
  tabSequence,
  tabTo,
  textInsideBox,
  themes,
  tolerance,
  walkKeyboard,
  watchRuntime,
  type Box,
} from "./support/public-content-helpers";

/*
 * Public content variants (OpenSpec change rebuild-ui-with-astryx, task 5.4).
 *
 * The legacy mock answers one page of one product, one article and an empty
 * or failing list for everything else. e2e/mock-content-server.mjs also serves
 * the "Public content variant fixtures" documented in its header comment; this
 * spec renders every one of them in a real browser at the four required
 * widths (the four Playwright projects drive the width, so one test covers
 * 360, 390, 768 and 1280 pixels) and checks what jsdom cannot:
 *
 * - multi-page pagination: previous and next links, stable ?page=N URLs,
 *   keyboard operation, 44px targets, visible focus, RTL order, wrapping at
 *   360px and the empty page beyond the last one;
 * - detail variants: open and closed materials, long LTR grades and
 *   specification values, image galleries, long call-to-action labels, an
 *   unsafe call-to-action address, missing images and unbreakable titles;
 * - article variants: featured image, tags, related articles, long words, URL,
 *   email and identifiers, a very long category name;
 * - for every fixture page: a Tab walk in visual RTL order with visible focus,
 *   element-level and text-level overflow, images loaded inside their frames,
 *   Toranj colour roles in both themes and no runtime errors;
 * - an in-browser axe-core audit with real colour contrast at 360 and 1280px;
 * - one-pixel transition sweeps for six-card collections.
 *
 * The assertions of the four defects this spec once left red on purpose (an
 * unbreakable hero title, tags wider than the viewport, a category tab wider
 * than its strip, a hero image that fails to load) are green now and stay as
 * regression guards: see the tests that name those fixtures below.
 *
 * Content cards keep their natural height (public-visual-experience: no
 * artificial empty card regions), so a row of cards is not asserted to share
 * one height; emptyCardBands asserts that no card keeps a blank band instead.
 *
 * The first page of a multi-page products, materials, services or articles
 * collection cannot be served: page 1 of those routes keeps the legacy
 * single-page answer that the older specs rely on. The paginated article
 * category is the one collection whose first, middle and last pages all exist.
 * The managed pages (about, contact, privacy, terms) cannot be varied either:
 * their routes carry no query parameter.
 */

// The pages are heavy (up to 40 Tab stops, two themes, lazy images); a loaded machine needs more than the 30s default.
test.describe.configure({ timeout: 90_000 });

const cards = 'main [role="article"]';
const cardMedia = `${cards} a[aria-hidden="true"]`;
const heroSelector = "[data-media]";
const pager = 'nav[aria-label="صفحه‌بندی"]';
const galleryRegion = 'section[aria-label="تصاویر محتوا"]';
const inquiryCardSelector = 'section[aria-labelledby="inquiry-fast-track-title"]';
const columnsAt = (width: number) => (width > 1024 ? 3 : width > 640 ? 2 : 1);
const specificationSheet = (page: Page) => page.locator("section").filter({ has: page.getByRole("heading", { level: 2, name: "مشخصات تأییدشده", exact: true }) });
const longIdentifier = "TRJ-FIXTURE-IDENTIFIER-WITH-NO-BREAK-OPPORTUNITY-0123456789-ABCDEFGHIJKLMNOPQRSTUVWXYZ-REV-A/B";

/** Waits until every image in <main> has finished loading or failing (lazy images are scrolled into view first). */
async function settleImages(page: Page) {
  const images = page.locator("main img");
  for (const image of await images.all()) await image.scrollIntoViewIfNeeded();
  await expect.poll(() => images.evaluateAll((elements) => elements.every((element) => (element as HTMLImageElement).complete))).toBe(true);
}

/**
 * Runs one of the hard-asserting browser checks as a soft one: a failure is
 * recorded with its full message and the test goes on, so a page that breaks
 * several rules (overflow, clipped text, media, colour roles) reports them all
 * in one run instead of the first one hiding the rest.
 */
async function softly(check: () => Promise<unknown>) {
  try {
    await check();
  } catch (error) {
    expect.soft(false, (error as Error).message.slice(0, 900)).toBe(true);
  }
}

/**
 * Soft assertions, so one report names every element that leaves its frame:
 * the element's box stays between the frame's edges and its whole text is
 * visible inside the box.
 */
async function softContained(label: string, locator: Locator, frame: { left: number; right: number }) {
  const box = (await locator.boundingBox())!;
  expect.soft(box.x >= frame.left - 1 && box.x + box.width <= frame.right + 1, `${label} stays inside its frame [${Math.round(frame.left)}, ${Math.round(frame.right)}] but spans [${Math.round(box.x)}, ${Math.round(box.x + box.width)}]`).toBe(true);
  const fit = await textInsideBox(locator);
  expect.soft(fit.inside, `${label}: the whole text is visible inside its box (margins: start ${Math.round(fit.start)}px, end ${Math.round(fit.end)}px)`).toBe(true);
}

/* ------------------------------------------------------------------------ */
/* Pagination                                                               */
/* ------------------------------------------------------------------------ */

type PagedCollection = {
  name: string;
  base: string;
  /** The pages the mock serves with a pagination bar, and the cards each shows. */
  pages: ReadonlyArray<{ page: number; cards: number }>;
  emptyTitle: string;
  emptyText: string;
};

const totalPages = 3;
const pagedCollections: ReadonlyArray<PagedCollection> = [
  {
    name: "products",
    base: "/products",
    pages: [{ page: 2, cards: 6 }, { page: 3, cards: 5 }],
    emptyTitle: "محصول منتشرشده‌ای وجود ندارد",
    emptyText: "پس از تأیید و انتشار اطلاعات محصول، فهرست این بخش نمایش داده می‌شود.",
  },
  {
    name: "materials",
    base: "/materials",
    pages: [{ page: 2, cards: 6 }, { page: 3, cards: 5 }],
    emptyTitle: "ماده منتشرشده‌ای وجود ندارد",
    emptyText: "فهرست مواد پس از تأیید اطلاعات و انتشار رسمی در این بخش نمایش داده می‌شود.",
  },
  {
    name: "injection services",
    base: "/injection-molding",
    pages: [{ page: 2, cards: 6 }, { page: 3, cards: 5 }],
    emptyTitle: "خدمت منتشرشده‌ای وجود ندارد",
    emptyText: "اطلاعات خدمات پس از بررسی فنی و انتشار رسمی در این بخش قرار می‌گیرد.",
  },
  {
    name: "Strapi articles",
    base: "/articles",
    pages: [{ page: 2, cards: 6 }, { page: 3, cards: 6 }],
    emptyTitle: "مقاله منتشرشده‌ای وجود ندارد",
    emptyText: "مقاله‌ها پس از بازبینی و انتشار رسمی در سامانه مدیریت محتوا در این بخش قرار می‌گیرند.",
  },
  {
    name: "the paginated article category",
    base: "/articles/category/fixture-paginated",
    pages: [{ page: 1, cards: 6 }, { page: 2, cards: 6 }, { page: 3, cards: 1 }],
    emptyTitle: "مقاله‌ای در دسته‌بندی «دسته آزمایشی صفحه‌بندی» منتشر نشده است",
    emptyText: "مقاله‌های جدید پس از انتشار رسمی در این بخش قرار می‌گیرند.",
  },
];
/** Page 1 is the bare path; every other page is a stable ?page=N URL. */
const pageUrl = (collection: PagedCollection, page: number) => (page === 1 ? collection.base : `${collection.base}?page=${page}`);

for (const collection of pagedCollections) {
  for (const { page: pageNumber, cards: cardCount } of collection.pages) {
    test(`${collection.name} page ${pageNumber} of ${totalPages} shows its cards and links its neighbours in RTL order`, async ({ page }) => {
      const problems = watchRuntime(page);
      const path = pageUrl(collection, pageNumber);
      await openSettled(page, path);
      await expect(page.locator(cards)).toHaveCount(cardCount);

      const nav = page.locator(pager);
      await expect(nav, `${path} has one pagination bar`).toHaveCount(1);
      const previous = nav.getByRole("link", { name: "صفحه قبل", exact: true });
      const next = nav.getByRole("link", { name: "صفحه بعد", exact: true });
      await expect(previous).toHaveCount(pageNumber > 1 ? 1 : 0);
      await expect(next).toHaveCount(pageNumber < totalPages ? 1 : 0);
      // Links, not script-driven buttons: the URLs stay crawlable and stable.
      await expect(nav.getByRole("button")).toHaveCount(0);
      if (pageNumber > 1) {
        await expect(previous).toHaveAttribute("href", `${collection.base}?page=${pageNumber - 1}`);
        await expect(previous).toHaveAttribute("rel", "prev");
      }
      if (pageNumber < totalPages) {
        await expect(next).toHaveAttribute("href", `${collection.base}?page=${pageNumber + 1}`);
        await expect(next).toHaveAttribute("rel", "next");
      }
      await expect(nav.getByText(`صفحه ${fa(pageNumber)} از ${fa(totalPages)}`, { exact: true })).toBeVisible();

      // DOM order is previous, readout, next: on one row it runs from the inline start (right) to the inline end (left).
      const items = await boxesOf(page, `${pager} > *`);
      const navBox = await boxOf(page, pager);
      expect(items).toHaveLength(1 + (pageNumber > 1 ? 1 : 0) + (pageNumber < totalPages ? 1 : 0));
      for (let index = 1; index < items.length; index += 1) {
        expect(sameRow(items[index - 1], items[index]), `item ${index + 1} shares the row of item ${index}`).toBe(true);
        expect(items[index].right, `item ${index + 1} lies left of item ${index}`).toBeLessThanOrEqual(items[index - 1].left + tolerance);
      }
      // No broken wrapping, also at 360px: one row, every item inside the bar, the bar centred.
      expect(navBox.height, "the pagination bar stays one row").toBeLessThan(2 * 44);
      for (const item of items) expect(insideBox(item, navBox), "an item stays inside the pagination bar").toBe(true);
      const startGap = navBox.right - Math.max(...items.map((item) => item.right));
      const endGap = Math.min(...items.map((item) => item.left)) - navBox.left;
      expect(Math.abs(startGap - endGap), "the pagination items are centred").toBeLessThanOrEqual(tolerance);
      for (const link of [previous, next]) {
        if ((await link.count()) === 0) continue;
        const box = await link.boundingBox();
        expect(box?.height, "target height").toBeGreaterThanOrEqual(44);
        expect(box?.width, "target width").toBeGreaterThanOrEqual(44);
        const label = await textInsideBox(link);
        expect(label.lines, "the label stays on one line").toBe(1);
        expect(label.inside, "the label stays inside its button").toBe(true);
      }
      await expectNoHorizontalOverflow(page, path);
      await expectNoTextOverflow(page, path);
      expect(problems()).toEqual([]);
    });
  }

  test(`${collection.name}: Tab reaches previous and next with a visible ring and Enter follows each link`, async ({ page }) => {
    test.setTimeout(60_000);
    const problems = watchRuntime(page);
    const middle = pageUrl(collection, 2);
    await openThemed(page, middle, "light");
    const stops = (await tabSequence(page)).filter((stop) => stop.region === "main" && /[?]page=\d+$/.test(stop.target));
    expect(stops.map((stop) => [stop.name, stop.target])).toEqual([
      ["صفحه قبل", `${collection.base}?page=1`],
      ["صفحه بعد", `${collection.base}?page=3`],
    ]);
    for (const stop of stops) {
      const label = `${collection.name} "${stop.name}"`;
      expect(stop.focusVisible, `${label} must match :focus-visible`).toBe(true);
      expect(stop.outlineStyle, `${label} outline`).not.toBe("none");
      expect(stop.outlineWidth, `${label} outline width`).toBeGreaterThanOrEqual(2);
      expect(stop.clippedBy, `${label} focus ring must not be clipped`).toBeNull();
      if (stop.outlineContrast !== null) expect(stop.outlineContrast, `${label} focus ring contrast`).toBeGreaterThanOrEqual(3);
      expect(Math.round(stop.box.height), `${label} target height`).toBeGreaterThanOrEqual(44);
      expect(Math.round(stop.box.width), `${label} target width`).toBeGreaterThanOrEqual(44);
    }
    // Tab order follows the reading order: previous leads at the inline start (right), next follows to its left.
    expect(stops[0].box.left).toBeGreaterThanOrEqual(stops[1].box.right - tolerance);

    // Enter on "next" opens the last page, which offers only "previous".
    await openThemed(page, middle, "light");
    await tabTo(page, `${pager} a[rel="next"]`);
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL((url) => url.pathname + url.search === `${collection.base}?page=3`);
    await expect(page.locator(pager).getByText(`صفحه ${fa(3)} از ${fa(totalPages)}`, { exact: true })).toBeVisible();
    await expect(page.locator(pager).getByRole("link", { name: "صفحه بعد" })).toHaveCount(0);

    // Enter on "previous" from the last page returns to the middle page.
    await openThemed(page, pageUrl(collection, 3), "light");
    await tabTo(page, `${pager} a[rel="prev"]`);
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL((url) => url.pathname + url.search === middle);
    await expect(page.locator(pager).getByText(`صفحه ${fa(2)} از ${fa(totalPages)}`, { exact: true })).toBeVisible();
    expect(problems()).toEqual([]);
  });

  test(`${collection.name}: a page beyond the last shows the factual empty state without pagination`, async ({ page }) => {
    const problems = watchRuntime(page);
    const path = `${collection.base}?page=99`;
    await openSettled(page, path);
    await expect(page.getByRole("heading", { name: collection.emptyTitle, exact: true })).toBeVisible();
    await expect(page.getByText(collection.emptyText, { exact: true })).toBeVisible();
    await expect(page.locator(cards), "no card is invented").toHaveCount(0);
    await expect(page.locator(pager)).toHaveCount(0);
    await expect(page.getByRole("link", { name: /^صفحه (قبل|بعد)$/ })).toHaveCount(0);
    await expect(page.locator("main")).toHaveCount(1);
    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
    await expectNoHorizontalOverflow(page, path);
    expect(problems()).toEqual([]);
  });
}

test("the first page of a multi-page category offers only the next link", async ({ page }) => {
  await openSettled(page, "/articles/category/fixture-paginated");
  const nav = page.locator(pager);
  await expect(nav.getByRole("link", { name: "صفحه قبل" })).toHaveCount(0);
  await expect(nav.getByRole("link", { name: "صفحه بعد" })).toHaveAttribute("href", "/articles/category/fixture-paginated?page=2");
  await expect(nav.getByText(`صفحه ${fa(1)} از ${fa(totalPages)}`, { exact: true })).toBeVisible();
  // The category strip keeps marking the category on every page of it.
  await expect(page.getByRole("navigation", { name: "دسته‌بندی مقالات" }).getByRole("link", { name: "دسته آزمایشی صفحه‌بندی" })).toHaveAttribute("aria-current", /^(page|true)$/);
});

/* ------------------------------------------------------------------------ */
/* Every fixture page: keyboard, overflow, media, theme roles, no errors    */
/* ------------------------------------------------------------------------ */

type Fixture = { path: string; what: string; /** The page renders at least one image in <main>. */ media: boolean };

const listFixtures: ReadonlyArray<Fixture> = [
  { path: "/products?page=2", what: "middle products page: no image, long copy, bright, portrait and gallery cards", media: true },
  { path: "/products?page=3", what: "last products page", media: true },
  { path: "/products?page=99", what: "empty products page", media: true },
  { path: "/materials?page=2", what: "middle materials page: open, closed, long grade and no-image cards", media: true },
  { path: "/materials?page=3", what: "last materials page", media: true },
  { path: "/materials?page=99", what: "empty materials page", media: true },
  { path: "/injection-molding?page=2", what: "middle services page: call to action, unsafe address and no-image cards", media: true },
  { path: "/injection-molding?page=3", what: "last services page", media: true },
  { path: "/injection-molding?page=99", what: "empty services page", media: true },
  { path: "/articles?page=2", what: "middle articles page: images, a bright image and no-image cards", media: true },
  { path: "/articles?page=3", what: "last articles page: a missing image, a long title and related-article fixtures", media: true },
  { path: "/articles?page=99", what: "empty articles page", media: false },
  { path: "/articles/category/fixture-paginated", what: "first page of the paginated category", media: true },
  { path: "/articles/category/fixture-paginated?page=2", what: "middle page of the paginated category", media: true },
  { path: "/articles/category/fixture-paginated?page=3", what: "last page of the paginated category (one card)", media: true },
  { path: "/articles/category/fixture-paginated?page=99", what: "empty page of the paginated category", media: false },
  { path: "/articles/category/fixture-long-category", what: "category with a very long name", media: true },
  { path: "/articles/category/fixture-rich", what: "category of image articles", media: true },
  { path: "/articles/category/fixture-empty", what: "category without articles", media: false },
];

const detailFixtures: ReadonlyArray<Fixture> = [
  { path: "/products/fixture-product-no-image", what: "product without an image (placeholder hero)", media: false },
  { path: "/products/fixture-product-long", what: "product with a long title, summary, category, label and code", media: true },
  { path: "/products/fixture-product-bright", what: "product with a near-white image", media: true },
  { path: "/products/fixture-product-gallery", what: "product with four images", media: true },
  { path: "/products/fixture-product-portrait", what: "product with a portrait image", media: true },
  { path: "/products/fixture-product-longtoken", what: "product whose title, summary and code have no break opportunity", media: true },
  { path: "/materials/fixture-material-open", what: "material open to inquiry with three images and LTR values", media: true },
  { path: "/materials/fixture-material-closed", what: "material closed to inquiry", media: true },
  { path: "/materials/fixture-material-long-grade", what: "material with a long LTR grade tag", media: true },
  { path: "/materials/fixture-material-no-image", what: "material without an image", media: false },
  { path: "/injection-molding/fixture-service-cta", what: "service with a long call-to-action label and three images", media: true },
  { path: "/injection-molding/fixture-service-plain", what: "service without a call to action", media: true },
  { path: "/injection-molding/fixture-service-unsafe", what: "service whose call-to-action address is unsafe", media: true },
  { path: "/injection-molding/fixture-service-no-image", what: "service without an image", media: false },
  { path: "/articles/fixture-rich-article", what: "rich article: featured image, six tags, long body words and related articles", media: true },
  { path: "/articles/fixture-long-tags-article", what: "article with tags longer than a phone width", media: false },
  { path: "/articles/fixture-long-category-article", what: "article in a category with a very long name", media: true },
  { path: "/articles/fixture-related-1", what: "article with an image", media: true },
  { path: "/articles/fixture-related-2", what: "article without an image and a long title", media: true },
  { path: "/articles/fixture-related-3", what: "article whose featured image does not load", media: true },
];

for (const fixture of [...listFixtures, ...detailFixtures]) {
  // Two tests per page, so a keyboard defect does not hide a layout defect and the other way round.
  test(`${fixture.path} (${fixture.what}): Tab walk in visual RTL order with visible focus in both themes`, async ({ page }) => {
    test.setTimeout(90_000);
    for (const theme of themes) {
      // walkKeyboard opens the page in the theme and asserts the Tab order, the visual RTL order,
      // the focus ring and the 44px targets of every stop.
      await walkKeyboard(page, fixture.path, theme);
    }
  });

  test(`${fixture.path} (${fixture.what}): no overflow or clipped text, media inside its frames, Toranj colour roles and no runtime errors in both themes`, async ({ page }) => {
    test.setTimeout(90_000);
    const problems = watchRuntime(page);
    for (const theme of themes) {
      const context = `${fixture.path} (${theme})`;
      await openThemed(page, fixture.path, theme);
      await softly(() => expectNoHorizontalOverflow(page, context));
      await softly(() => expectNoTextOverflow(page, context));
      await softly(() => expectNoClippedText(page, context));
      await softly(() => expectThemeRoles(page, fixture.path, theme));
      if (fixture.media) await softly(() => expectMediaBounded(page, context));
      else expect.soft(await page.locator("main img").count(), `${context} renders no image`).toBe(0);
    }
    expect(problems(), `${fixture.path} runtime problems`).toEqual([]);
  });
}

/* ------------------------------------------------------------------------ */
/* Cards: one media footprint, whatever the image                           */
/* ------------------------------------------------------------------------ */

const footprintPages: ReadonlyArray<{ path: string; placeholders: number; missing: number }> = [
  { path: "/products?page=2", placeholders: 1, missing: 0 },
  { path: "/materials?page=2", placeholders: 1, missing: 0 },
  { path: "/injection-molding?page=2", placeholders: 1, missing: 0 },
  { path: "/articles?page=2", placeholders: 3, missing: 0 },
  { path: "/articles?page=3", placeholders: 1, missing: 1 },
  { path: "/articles/category/fixture-paginated", placeholders: 2, missing: 1 },
  { path: "/articles/category/fixture-paginated?page=2", placeholders: 3, missing: 0 },
];

for (const route of footprintPages) {
  test(`${route.path}: cards with a wide, tall, square, bright, missing or no image share one media footprint and row`, async ({ page }) => {
    const width = projectWidth(page);
    await openSettled(page, route.path);
    await settleImages(page);
    await expect(page.locator(cards)).toHaveCount(6);
    await expect(page.getByText("تصویر ثبت نشده", { exact: true }), "cards without an image show the placeholder").toHaveCount(route.placeholders);
    const broken = await page.locator(`${cardMedia} img`).evaluateAll((images) => images.filter((image) => (image as HTMLImageElement).naturalWidth === 0).length);
    expect(broken, "images that do not load").toBe(route.missing);

    const media = await boxesOf(page, cardMedia);
    const boxes = await boxesOf(page, cards);
    const container = await boxOf(page, 'main [data-layout="grid"]');
    expect(media).toHaveLength(6);
    for (const [index, box] of media.entries()) {
      expect(Math.abs(box.width - media[0].width), `card ${index + 1} media width`).toBeLessThanOrEqual(1);
      expect(Math.abs(box.height - media[0].height), `card ${index + 1} media height`).toBeLessThanOrEqual(1);
    }
    // Six cards fill complete rows at every width: RTL row-major order and no overlap. Cards keep their
    // natural heights, so a row is not required to share one; no card keeps a blank band instead.
    expect(new Set(boxes.map((box) => Math.round(box.top))).size, "rows").toBe(6 / columnsAt(width));
    expect(rowMajorRtlViolations(boxes, container, { equalHeights: false }), route.path).toEqual([]);
    expect(await emptyCardBands(page), `${route.path}: a blank band inside a card`).toEqual([]);
    expect(overlapping(boxes)).toBe(false);

    // Titles stay whole and summaries clamp to three lines instead of growing the card.
    for (const card of await page.locator(cards).all()) {
      await expect(card.getByRole("heading")).toBeVisible();
      await expect(card.getByRole("link", { name: "مشاهده جزئیات" })).toBeVisible();
      const summary = card.locator("p").first();
      const metrics = await summary.evaluate((element) => ({ height: element.getBoundingClientRect().height, lineHeight: parseFloat(getComputedStyle(element).lineHeight) }));
      expect(metrics.height, "summary height").toBeLessThanOrEqual(3 * metrics.lineHeight + 2);
    }
    await expectNoTextOverflow(page, route.path);
  });
}

/** Boxes grouped by row: the boxes whose tops agree within the tolerance share one row. */
const rowsOfBoxes = (boxes: Box[]) => boxes.reduce<Box[][]>((rows, box) => {
  const row = rows.find((candidate) => Math.abs(candidate[0].top - box.top) <= tolerance);
  if (row) row.push(box);
  else rows.push([box]);
  return rows;
}, []);

for (const path of ["/products?page=2", "/materials?page=2", "/articles?page=3", "/articles/category/fixture-paginated"]) {
  test(`${path}: cards keep their natural height, so a short card holds no blank band beside a taller neighbour`, async ({ page }) => {
    const width = projectWidth(page);
    await openSettled(page, path);
    await settleImages(page);
    await expect(page.locator(cards)).toHaveCount(6);
    // Every card ends within its body padding of its action, however tall the cards beside it are.
    expect(await emptyCardBands(page), `${path}: a blank band inside a card`).toEqual([]);
    // Not vacuous: the cards really differ in height (a long title, tag or summary beside short ones) ...
    const boxes = await boxesOf(page, cards);
    expect(new Set(boxes.map((box) => Math.round(box.height))).size, `${path}: the fixture cards differ in height`).toBeGreaterThan(1);
    // ... and, where cards share a row, some row holds cards of different heights: the row did not stretch them to one.
    if (columnsAt(width) > 1) {
      const unequal = rowsOfBoxes(boxes).filter((row) => row.length > 1 && Math.max(...row.map((box) => box.height)) - Math.min(...row.map((box) => box.height)) > tolerance);
      expect(unequal.length, `${path}: a row whose cards keep their own heights`).toBeGreaterThan(0);
    }
  });
}

test("cards keep one footprint while their images are pending and after they load", async ({ page }) => {
  const held: Route[] = [];
  // Hold every Strapi image: the card media is lazy and pending until the routes are released.
  await page.route("**/uploads/fixture-*.svg", (route) => {
    held.push(route);
  });
  const problems = watchRuntime(page);
  // Pending images can hold the window load event, so the page is opened at DOMContentLoaded.
  await page.goto("/articles/category/fixture-paginated", { waitUntil: "domcontentloaded" });
  await expect(page.locator("main").first()).toBeVisible();
  await expect.poll(() => held.length, "image requests are held").toBeGreaterThan(0);
  await expect(page.locator(cards)).toHaveCount(6);
  const pending = await boxesOf(page, cards);
  const pendingMedia = await boxesOf(page, cardMedia);
  // Title, summary and links are readable and operable before any image arrives.
  const first = page.locator(cards).first();
  await expect(first.getByRole("heading")).toBeVisible();
  const title = first.getByRole("link").first();
  await title.focus();
  await expect(title).toBeFocused();
  expect(await title.evaluate((element) => element.matches(":focus-visible"))).toBe(true);

  for (const route of held.splice(0)) await route.continue();
  await expect.poll(() => page.locator(`${cardMedia} img`).evaluateAll((images) => images.every((image) => (image as HTMLImageElement).complete))).toBe(true);
  const loaded = await boxesOf(page, cards);
  const loadedMedia = await boxesOf(page, cardMedia);
  for (const [index, box] of loaded.entries()) {
    expect(Math.abs(box.width - pending[index].width), `card ${index + 1} width`).toBeLessThanOrEqual(1);
    expect(Math.abs(box.height - pending[index].height), `card ${index + 1} height while pending and loaded`).toBeLessThanOrEqual(1);
    expect(Math.abs(loadedMedia[index].height - pendingMedia[index].height), `card ${index + 1} media height`).toBeLessThanOrEqual(1);
  }
  expect(problems()).toEqual([]);
});

test("the no-image placeholders keep 4.5:1 against both surfaces of their gradient in both themes", async ({ page }) => {
  // axe cannot judge text over a gradient, so the two gradient surfaces that sit behind the text
  // (Content.module.css .cardPlaceholder and .detailMedia) are checked directly.
  for (const theme of themes) {
    for (const [path, text] of [["/products?page=2", "تصویر ثبت نشده"], ["/products/fixture-product-no-image", "تصویر محصول ثبت نشده است"]] as const) {
      await openThemed(page, path, theme);
      const ratios = await page.getByText(text, { exact: true }).first().evaluate((element) => {
        const resolve = (value: string) => {
          const probe = document.createElement("span");
          probe.style.color = value;
          document.body.append(probe);
          const color = getComputedStyle(probe).color;
          probe.remove();
          return color;
        };
        const luminance = (value: string) => {
          const [r, g, b] = (value.match(/\d+(\.\d+)?/g) ?? ["0", "0", "0"]).slice(0, 3).map(Number).map((channel) => {
            const scaled = channel / 255;
            return scaled <= 0.04045 ? scaled / 12.92 : ((scaled + 0.055) / 1.055) ** 2.4;
          });
          return 0.2126 * r + 0.7152 * g + 0.0722 * b;
        };
        const contrast = (a: string, b: string) => {
          const [high, low] = [luminance(a), luminance(b)].sort((x, y) => y - x);
          return (high + 0.05) / (low + 0.05);
        };
        const color = getComputedStyle(element).color;
        return ["--color-surface-subtle", "--color-surface-raised"].map((token) => ({ token, ratio: contrast(color, resolve(`var(${token})`)) }));
      });
      for (const { token, ratio } of ratios) expect(ratio, `${path} (${theme}) placeholder text on ${token}`).toBeGreaterThanOrEqual(4.5);
    }
  }
});

test("a bright image sits in an intentional bounded media surface in the dark theme without changing its colours", async ({ page }) => {
  await openThemed(page, "/products?page=2", "dark");
  const card = page.locator(cards).filter({ hasText: "محصول آزمایشی با تصویر روشن" });
  await expect(card).toHaveCount(1);
  await card.scrollIntoViewIfNeeded();
  await settleImages(page);
  const frame = card.locator('a[aria-hidden="true"]');
  const surface = await frame.evaluate((element) => {
    const image = element.querySelector("img") as HTMLImageElement;
    const imageStyle = getComputedStyle(image);
    const [r, g, b] = getComputedStyle(element).backgroundColor.match(/\d+(\.\d+)?/g)!.slice(0, 3).map(Number);
    const channel = (value: number) => ((value / 255) <= 0.04045 ? value / 255 / 12.92 : (((value / 255) + 0.055) / 1.055) ** 2.4);
    const frameBox = element.getBoundingClientRect();
    const imageBox = image.getBoundingClientRect();
    return {
      frameLuminance: 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b),
      border: parseFloat(imageStyle.borderTopWidth),
      radius: parseFloat(imageStyle.borderTopLeftRadius),
      filter: imageStyle.filter,
      opacity: imageStyle.opacity,
      blend: imageStyle.mixBlendMode,
      inset: Math.min(imageBox.left - frameBox.left, frameBox.right - imageBox.right, imageBox.top - frameBox.top, frameBox.bottom - imageBox.bottom),
      natural: image.naturalWidth,
    };
  });
  expect(surface.natural).toBeGreaterThan(0);
  // A dark frame, an inset and a bordered, rounded image: the near-white picture never meets the dark card edge to edge.
  expect(surface.frameLuminance, "the media frame is a dark surface").toBeLessThan(0.1);
  expect(surface.inset, "the image is inset from its frame").toBeGreaterThanOrEqual(4);
  expect(surface.border).toBeGreaterThanOrEqual(1);
  expect(surface.radius).toBeGreaterThan(0);
  expect([surface.filter, surface.opacity, surface.blend]).toEqual(["none", "1", "normal"]);

  await openThemed(page, "/products/fixture-product-bright", "dark");
  await settleImages(page);
  const panel = await page.locator(`${heroSelector} > div`).first().evaluate((element) => {
    const image = element.querySelector("img") as HTMLImageElement;
    const frameBox = element.getBoundingClientRect();
    const imageBox = image.getBoundingClientRect();
    return {
      background: getComputedStyle(element).backgroundImage,
      radius: parseFloat(getComputedStyle(image).borderTopLeftRadius),
      inset: Math.min(imageBox.left - frameBox.left, frameBox.right - imageBox.right, imageBox.top - frameBox.top, frameBox.bottom - imageBox.bottom),
    };
  });
  expect(panel.background, "the detail media panel is a themed gradient surface").toContain("gradient");
  expect(panel.radius).toBeGreaterThan(0);
  expect(panel.inset, "the detail image is inset from its panel").toBeGreaterThanOrEqual(8);
  await expectMediaBounded(page, "/products/fixture-product-bright (dark)");
});

/* ------------------------------------------------------------------------ */
/* Details: materials                                                       */
/* ------------------------------------------------------------------------ */

test("a material's inquiry actions follow inquiryAvailable", async ({ page }) => {
  await openSettled(page, "/materials/fixture-material-open");
  const inquiryHref = "/inquiry/material?slug=fixture-material-open";
  const action = page.locator(heroSelector).getByRole("link", { name: "ثبت استعلام ماده", exact: true });
  await expect(action).toHaveAttribute("href", inquiryHref);
  expect((await action.boundingBox())?.height).toBeGreaterThanOrEqual(44);
  const card = page.locator(inquiryCardSelector);
  await expect(card.getByRole("heading", { level: 2 })).toHaveText("نیاز به تأمین تناژ یا فرمولاسیون این گرید دارید؟");
  await expect(card.getByRole("link", { name: "ثبت استعلام مستقیم این ماده", exact: true })).toHaveAttribute("href", inquiryHref);

  await openSettled(page, "/materials/fixture-material-closed");
  await expect(page.getByRole("heading", { level: 1, name: "ماده آزمایشی بدون استعلام" })).toBeVisible();
  // Closed to inquiry: neither the hero action nor the material inquiry card is offered anywhere in the page content.
  await expect(page.locator('main a[href^="/inquiry"]')).toHaveCount(0);
  await expect(page.locator(inquiryCardSelector)).toHaveCount(0);
  await expect(page.getByRole("heading", { level: 2, name: "مشخصات تأییدشده" })).toBeVisible();
  await expect(page.getByText("TRJ-GR-1008", { exact: true }).first()).toBeVisible();
  await expect(page.locator(heroSelector).getByRole("link")).toHaveCount(0);
});

test("a long LTR grade tag keeps its LTR run and stays inside the hero card", async ({ page }) => {
  await openSettled(page, "/materials/fixture-material-long-grade");
  const hero = page.locator(heroSelector);
  const heroBox = await boxOf(page, heroSelector);
  const grade = hero.locator(".astryx-badge").filter({ has: page.locator('[dir="ltr"]') });
  await expect(grade).toHaveCount(1);
  await expect(grade.locator('[dir="ltr"]')).toHaveText(longIdentifier);
  const run = await grade.locator('[dir="ltr"]').evaluate((element) => ({ direction: getComputedStyle(element).direction, bidi: getComputedStyle(element).unicodeBidi }));
  expect(run).toEqual({ direction: "ltr", bidi: "isolate" });
  // The page itself stays RTL.
  await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
  for (const tag of await hero.locator(".astryx-badge").all()) {
    const box = (await tag.boundingBox())!;
    expect(box.x + box.width, "a tag stays inside the hero card").toBeLessThanOrEqual(heroBox.right + 1);
    expect(box.x, "a tag stays inside the hero card").toBeGreaterThanOrEqual(heroBox.left - 1);
    await expectTextInside(tag, "the whole tag value stays visible");
  }
  // The long unbreakable grade wraps inside its tag at every width up to the card width.
  const gradeText = await textInsideBox(grade);
  if (projectWidth(page) <= 390) expect(gradeText.lines, "the grade wraps at phone widths").toBeGreaterThan(1);
  await expectNoHorizontalOverflow(page, "/materials/fixture-material-long-grade");
});

/* ------------------------------------------------------------------------ */
/* Details: specification values, galleries and no-image heroes             */
/* ------------------------------------------------------------------------ */

for (const path of ["/materials/fixture-material-open", "/products/fixture-product-long", "/products/fixture-product-longtoken", "/products/fixture-product-gallery"]) {
  test(`${path}: LTR specification values keep a local LTR run and long values wrap inside the sheet`, async ({ page }) => {
    await openSettled(page, path);
    const sheet = specificationSheet(page);
    await sheet.scrollIntoViewIfNeeded();
    const rows = await sheet.evaluate((section) => {
      const sheetBox = section.getBoundingClientRect();
      return [...section.querySelectorAll("dd")].map((definition) => {
        const run = definition.querySelector<HTMLElement>('[dir="ltr"]');
        const term = definition.previousElementSibling as HTMLElement;
        const box = definition.getBoundingClientRect();
        return {
          text: (definition.textContent ?? "").trim(),
          expectsLtr: /^[\x00-\x7F]/.test((definition.textContent ?? "").trim()),
          hasRun: Boolean(run),
          runDirection: run ? getComputedStyle(run).direction : null,
          runFont: run ? getComputedStyle(run).fontFamily : null,
          directDirection: getComputedStyle(definition).direction,
          definitionFits: definition.scrollWidth <= definition.clientWidth + 1,
          termFits: term.scrollWidth <= term.clientWidth + 1,
          inside: box.left >= sheetBox.left - 1 && box.right <= sheetBox.right + 1,
        };
      });
    });
    expect(rows.length).toBeGreaterThan(0);
    for (const row of rows) {
      const label = `${path} value "${row.text.slice(0, 24)}"`;
      expect(row.hasRun, `${label}: an ASCII value is an isolated LTR run, a Persian one is not`).toBe(row.expectsLtr);
      if (row.expectsLtr) {
        expect(row.runDirection, label).toBe("ltr");
        expect(row.runFont, `${label} uses the code face`).toMatch(/mono|consolas/i);
      } else {
        expect(row.directDirection, label).toBe("rtl");
      }
      expect(row.definitionFits, `${label} wraps inside its cell`).toBe(true);
      expect(row.termFits, `${label}: its label wraps inside its cell`).toBe(true);
      expect(row.inside, `${label} stays inside the sheet`).toBe(true);
    }
    await expectNoHorizontalOverflow(page, path);
  });
}

for (const gallery of [
  { path: "/materials/fixture-material-open", images: 3 },
  { path: "/products/fixture-product-gallery", images: 4 },
  { path: "/injection-molding/fixture-service-cta", images: 3 },
]) {
  test(`${gallery.path}: the ${gallery.images}-image gallery is bounded, loaded, keeps its aspect ratio and does not repeat the hero`, async ({ page }) => {
    const width = projectWidth(page);
    await openSettled(page, gallery.path);
    const heroImage = page.locator(`${heroSelector} img`);
    await expect(heroImage).toHaveCount(1);
    const heroSource = await heroImage.evaluate((image) => (image as HTMLImageElement).currentSrc);
    const region = page.locator(galleryRegion);
    await region.scrollIntoViewIfNeeded();
    await settleImages(page);
    const images = region.locator("img");
    await expect(images, "the gallery shows every image except the hero").toHaveCount(gallery.images - 1);
    const report = await images.evaluateAll((elements) => elements.map((element) => {
      const image = element as HTMLImageElement;
      const rect = image.getBoundingClientRect();
      return { source: image.currentSrc, natural: [image.naturalWidth, image.naturalHeight], box: { left: rect.left + scrollX, right: rect.right + scrollX, top: rect.top + scrollY, bottom: rect.bottom + scrollY, width: rect.width, height: rect.height }, fit: getComputedStyle(image).objectFit, filter: getComputedStyle(image).filter, opacity: getComputedStyle(image).opacity };
    }));
    const regionBox = await boxOf(page, galleryRegion);
    expect(report.map((image) => image.source), "the hero image is not repeated").not.toContain(heroSource);
    for (const image of report) {
      expect(image.natural[0], `${image.source} loads`).toBeGreaterThan(0);
      expect(insideBox(image.box, regionBox), `${image.source} stays inside the gallery`).toBe(true);
      expect(image.box.width).toBeLessThanOrEqual(regionBox.width + 1);
      // Natural proportions: the rendered box matches the file's aspect ratio.
      const distortion = Math.abs(image.box.width / image.box.height - image.natural[0] / image.natural[1]) / (image.natural[0] / image.natural[1]);
      expect(image.fit === "fill" ? distortion : 0, `${image.source} keeps its aspect ratio`).toBeLessThan(0.02);
      expect([image.filter, image.opacity]).toEqual(["none", "1"]);
    }
    // One column on phones, two (at most) from the Astryx grid's 240px track minimum, the first image at the inline start.
    const tops = report.reduce<number[]>((rows, image) => (rows.some((top) => Math.abs(top - image.box.top) <= tolerance) ? rows : [...rows, image.box.top]), []);
    const columns = report.filter((image) => Math.abs(image.box.top - report[0].box.top) <= tolerance).length;
    expect(columns, `gallery columns at ${width}px`).toBe(width >= 768 ? Math.min(2, gallery.images - 1) : 1);
    expect(tops.length, "gallery rows").toBe(Math.ceil(report.length / columns));
    expect(Math.abs(report[0].box.right - regionBox.right), "the first image starts at the inline start").toBeLessThanOrEqual(tolerance);
    if (columns === 2) expect(report[1].box.right, "the second image sits to its left").toBeLessThanOrEqual(report[0].box.left + tolerance);
    expect(overlapping(report.map((image) => image.box))).toBe(false);
    // Uniform tiles: every picture sits whole (contain, never cropped) in one 4:3 tile size, so the rows line up and no
    // hole opens beside a shorter picture (portrait, square and landscape files share the fixture).
    for (const [index, image] of report.entries()) {
      expect(image.fit, `${image.source} is shown whole, not cropped`).toBe("contain");
      expect(Math.abs(image.box.width - report[0].box.width), `tile ${index + 1} width`).toBeLessThanOrEqual(1);
      expect(Math.abs(image.box.height - report[0].box.height), `tile ${index + 1} height`).toBeLessThanOrEqual(1);
      expect(Math.abs(image.box.width / image.box.height - 4 / 3), `tile ${index + 1} is a 4:3 tile`).toBeLessThan(0.02);
    }
    // The region is exactly its rows of tiles and the gaps between them: no empty row, band or stretched cell.
    const gap = tops.length > 1 ? tops[1] - tops[0] - report[0].box.height : 0;
    expect(Math.abs(regionBox.height - (tops.length * report[0].box.height + (tops.length - 1) * gap)), "the gallery holds nothing but its tiles").toBeLessThanOrEqual(2);
    // No track is left empty: an odd last tile is centred at the width of its neighbours instead of sitting beside an empty one.
    if (columns === 2 && report.length % 2 === 1) {
      const last = report[report.length - 1].box;
      expect(Math.abs((last.left + last.right) / 2 - (regionBox.left + regionBox.right) / 2), "the odd last tile is centred in the row").toBeLessThanOrEqual(tolerance);
    }
    // The hero image itself stays bounded: at most 38rem tall and inside its panel.
    const heroReport = await mediaReport(page);
    const hero = heroReport.find((image) => image.source === heroSource);
    expect(hero?.insideFrame, "hero image inside its panel").toBe(true);
    expect(hero?.height).toBeLessThanOrEqual(38 * 16 + 1);
    await expectNoHorizontalOverflow(page, gallery.path);
  });
}

test("text-only detail heroes drop the media panel for materials, services and articles without an image", async ({ page }) => {
  // Each page's own hero is checked: related-article cards below it may show their own placeholders.
  for (const path of ["/materials/fixture-material-no-image", "/injection-molding/fixture-service-no-image", "/articles/fixture-related-2"]) {
    await openSettled(page, path);
    const hero = page.locator(heroSelector);
    await expect(hero, path).toHaveAttribute("data-media", "none");
    await expect(hero.locator("img"), path).toHaveCount(0);
    await expect(hero.getByText("تصویر ثبت نشده"), path).toHaveCount(0);
    await expect(hero.getByText("تصویر محصول ثبت نشده است"), path).toHaveCount(0);
    const heading = await boxOf(page, `${heroSelector} h1`);
    const card = await boxOf(page, heroSelector);
    expect(card.right - heading.right, `${path}: the copy starts at the card's inline start`).toBeLessThan(card.width / 4);
    expect(insideBox(heading, card), `${path}: the heading stays in the card`).toBe(true);
    await expectNoHorizontalOverflow(page, path);
  }
});

test("a product without an image shows a bounded placeholder panel beside the same hero layout", async ({ page }) => {
  const width = projectWidth(page);
  await openSettled(page, "/products/industrial-basket");
  const withImage = await boxOf(page, `${heroSelector} > div`);
  await openSettled(page, "/products/fixture-product-no-image");
  const hero = page.locator(heroSelector);
  await expect(hero).toHaveAttribute("data-media", "placeholder");
  await expect(hero.locator("img")).toHaveCount(0);
  const placeholder = hero.getByText("تصویر محصول ثبت نشده است", { exact: true });
  await expect(placeholder).toBeVisible();
  const panel = await boxOf(page, `${heroSelector} > div`);
  const heroBox = await boxOf(page, heroSelector);
  expect(insideBox(panel, heroBox), "the placeholder panel stays in the hero card").toBe(true);
  // The same media column as the product with an image, and at least the media panel's minimum height (32, 25 or 19rem).
  expect(Math.abs(panel.width - withImage.width), "the placeholder panel has the media panel's width").toBeLessThanOrEqual(1);
  const minimum = (width > 896 ? 32 : width > 608 ? 25 : 19) * 16;
  expect(panel.height).toBeGreaterThanOrEqual(minimum - 1);
  expect(withImage.height).toBeGreaterThanOrEqual(minimum - 1);
  const text = await boxOf(page, `${heroSelector} > div > span`);
  expect(insideBox(text, panel), "the placeholder text stays inside its panel").toBe(true);
  await expectTextInside(placeholder, "the placeholder text is fully visible");
  await expectNoHorizontalOverflow(page, "/products/fixture-product-no-image");
});

/* ------------------------------------------------------------------------ */
/* Details: services                                                        */
/* ------------------------------------------------------------------------ */

test("a long call-to-action label wraps inside its button without clipping", async ({ page }) => {
  await openSettled(page, "/injection-molding/fixture-service-cta");
  const hero = page.locator(heroSelector);
  const heroBox = await boxOf(page, heroSelector);
  const action = hero.getByRole("link", { name: /^برای بررسی این خدمت با واحد مربوطه تماس بگیرید/ });
  await expect(action).toHaveCount(1);
  await expect(action).toHaveAttribute("href", "/contact");
  const box = (await action.boundingBox())!;
  expect(box.height).toBeGreaterThanOrEqual(44);
  expect(box.x, "the button stays inside the hero card").toBeGreaterThanOrEqual(heroBox.left - 1);
  expect(box.x + box.width, "the button stays inside the hero card").toBeLessThanOrEqual(heroBox.right + 1);
  const label = await expectTextInside(action, "no part of the label is clipped or cut by an ellipsis");
  expect(label.lines, "a label this long wraps onto several lines").toBeGreaterThanOrEqual(2);
  expect(box.height, "the button grows with its label").toBeGreaterThan(44 * 1.3);
  const whole = await action.evaluate((element) => [element, ...element.querySelectorAll("*")].every((node) => node.scrollWidth <= node.clientWidth + 1 || getComputedStyle(node).overflowX === "visible"));
  expect(whole, "neither the button nor its label parts overflow their boxes").toBe(true);
  await expectNoHorizontalOverflow(page, "/injection-molding/fixture-service-cta");
  await expectNoTextOverflow(page, "/injection-molding/fixture-service-cta");
});

test("an unsafe javascript: call-to-action address is ignored in favour of the review inquiry action", async ({ page }) => {
  const dialogs: string[] = [];
  page.on("dialog", async (dialog) => {
    dialogs.push(dialog.message());
    await dialog.dismiss();
  });
  await openSettled(page, "/injection-molding/fixture-service-unsafe");
  expect(await page.locator('a[href*="javascript:" i]').count(), "no javascript: link is rendered").toBe(0);
  await expect(page.getByText("دعوت به اقدام با نشانی نامعتبر"), "the unsafe label is not shown as an action").toHaveCount(0);
  const fallback = page.locator(heroSelector).getByRole("link", { name: "ثبت درخواست بررسی", exact: true });
  await expect(fallback).toHaveAttribute("href", "/inquiry/injection?slug=fixture-service-unsafe");
  // Focus and activate nothing unsafe: every hero link is a same-origin path.
  for (const link of await page.locator("main a[href]").all()) expect(await link.getAttribute("href")).toMatch(/^\/|^#/);
  expect(dialogs).toEqual([]);

  // A service without any call to action takes the same fallback; one with both a label and a safe address keeps its own.
  await openSettled(page, "/injection-molding/fixture-service-plain");
  await expect(page.locator(heroSelector).getByRole("link", { name: "ثبت درخواست بررسی", exact: true })).toHaveAttribute("href", "/inquiry/injection?slug=fixture-service-plain");
  await openSettled(page, "/injection-molding/fixture-service-cta");
  await expect(page.locator(heroSelector).getByRole("link", { name: "ثبت درخواست بررسی", exact: true })).toHaveCount(0);
});

/* ------------------------------------------------------------------------ */
/* Details: long, unbreakable content                                       */
/* ------------------------------------------------------------------------ */

for (const path of ["/products/fixture-product-longtoken", "/products/fixture-product-long"]) {
  test(`${path}: a long title, summary, category tag, specification and breadcrumb stay inside their frames`, async ({ page }) => {
    const width = projectWidth(page);
    await openSettled(page, path);
    const hero = await boxOf(page, heroSelector);
    const frame = { left: hero.left, right: hero.right };
    await softContained("the title", page.locator(`${heroSelector} h1`), frame);
    await softContained("the summary", page.locator(`${heroSelector} p`).first(), frame);
    for (const [index, tag] of (await page.locator(`${heroSelector} .astryx-badge`).all()).entries()) await softContained(`tag ${index + 1}`, tag, frame);
    // The specification values wrap inside their sheet.
    const sheet = await specificationSheet(page).evaluate((element) => {
      const rect = element.getBoundingClientRect();
      return { left: rect.left, right: rect.right };
    });
    for (const [index, value] of (await specificationSheet(page).locator("dd").all()).entries()) await softContained(`specification value ${index + 1}`, value, sheet);
    // The breadcrumb carries the long name as its current item and stays inside the viewport.
    const crumbs = page.getByRole("navigation", { name: "مسیر صفحه" });
    const current = crumbs.locator('[aria-current="page"]');
    await expect(current).toHaveCount(1);
    await softContained("the current breadcrumb item", current, { left: 0, right: width });
    await expectNoHorizontalOverflow(page, path);
    await expectNoTextOverflow(page, path);
    await expectNoClippedText(page, path);
  });
}

/* ------------------------------------------------------------------------ */
/* Articles                                                                 */
/* ------------------------------------------------------------------------ */

test("the rich article renders its featured image, tags, long body content and related articles", async ({ page }) => {
  const width = projectWidth(page);
  const problems = watchRuntime(page);
  await openSettled(page, "/articles/fixture-rich-article");
  await settleImages(page);

  // Featured image: a bounded hero panel, loaded, with its alternative text.
  const hero = page.locator(heroSelector);
  await expect(hero).toHaveAttribute("data-media", "image");
  const featured = hero.locator("img");
  await expect(featured).toHaveAttribute("alt", "تصویر شاخص آزمایشی");
  expect(await featured.evaluate((image) => (image as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
  const heroBox = await boxOf(page, heroSelector);
  expect(insideBox(await boxOf(page, `${heroSelector} img`), heroBox)).toBe(true);
  const jsonLd = await page.locator('script[type="application/ld+json"]').first().textContent();
  expect(jsonLd).toContain('"@type":"Article"');
  expect(jsonLd).toContain("/uploads/fixture-1600x900-a.svg");

  // Six tags in one labelled list; the long ones wrap or shrink inside the container instead of widening the page.
  const list = page.locator('ul[aria-labelledby="article-tags-label"]');
  const tags = list.locator(".astryx-badge");
  await expect(list.getByRole("listitem")).toHaveCount(6);
  await expect(tags).toHaveCount(6);
  await expect(page.locator("#article-tags-label")).toHaveText("برچسب‌ها:");
  await tags.first().scrollIntoViewIfNeeded();
  const bar = await list.evaluate((element) => {
    const parent = element.parentElement!.getBoundingClientRect();
    return { left: parent.left + scrollX, right: parent.right + scrollX, top: parent.top + scrollY, bottom: parent.bottom + scrollY, width: parent.width, height: parent.height };
  });
  // The hash stays on the side of the first letter of the tag: a Latin tag reads "#TRJ-..." in its own LTR run (hash left of
  // the letter), a Persian tag keeps its hash at the inline start (right of the first letter), never "TRJ-...#".
  for (const [index, tag] of (await tags.all()).entries()) {
    const placement = await tag.locator("bdi").evaluate((element) => {
      const rects: DOMRect[] = [];
      const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
      for (let node = walker.nextNode(); node && rects.length < 2; node = walker.nextNode()) {
        const value = node.textContent ?? "";
        for (let at = 0; at < value.length && rects.length < 2; at += 1) {
          const range = document.createRange();
          range.setStart(node, at);
          range.setEnd(node, at + 1);
          rects.push(range.getBoundingClientRect());
        }
      }
      return { text: (element.textContent ?? "").slice(0, 24), latin: /^#[\x00-\x7F]/.test(element.textContent ?? ""), hashLeft: rects[0].left, letterLeft: rects[1].left };
    });
    if (placement.latin) expect(placement.hashLeft, `tag ${index + 1} "${placement.text}": the hash precedes its Latin letters`).toBeLessThan(placement.letterLeft);
    else expect(placement.hashLeft, `tag ${index + 1} "${placement.text}": the hash sits at the inline start of its Persian word`).toBeGreaterThan(placement.letterLeft);
  }
  for (const [index, tag] of (await tags.all()).entries()) {
    const box = (await tag.boundingBox())!;
    expect(box.x, `tag ${index + 1} starts inside the viewport`).toBeGreaterThanOrEqual(-1);
    expect(box.x + box.width, `tag ${index + 1} ends inside the viewport`).toBeLessThanOrEqual(width + 1);
    expect(box.x + box.width, `tag ${index + 1} stays in the tag area`).toBeLessThanOrEqual(bar.right + 1);
    expect(box.x, `tag ${index + 1} stays in the tag area`).toBeGreaterThanOrEqual(bar.left - 1);
    await expectTextInside(tag, `tag ${index + 1}: the whole tag value is visible`);
  }

  // Body: long words, a URL, an email and an identifier break inside the text column and never widen it.
  const body = page.locator("section").filter({ has: page.getByRole("heading", { level: 2, name: "متن مقاله", exact: true }) });
  const paragraphs = body.locator("p");
  await expect(paragraphs).toHaveCount(7);
  const column = (await boxesOf(page, "main"))[0];
  const bodyBox = await body.evaluate((element) => {
    const rect = element.getBoundingClientRect();
    return { left: rect.left + scrollX, right: rect.right + scrollX, top: rect.top + scrollY, bottom: rect.bottom + scrollY, width: rect.width, height: rect.height };
  });
  expect(bodyBox.width, "the body column is bounded").toBeLessThanOrEqual(52 * 16 + 1);
  for (const [index, paragraph] of (await paragraphs.all()).entries()) {
    const fits = await paragraph.evaluate((element) => ({ whole: element.scrollWidth <= element.clientWidth + 1, text: (element.textContent ?? "").slice(0, 30) }));
    expect(fits.whole, `paragraph ${index + 1} "${fits.text}" fits its column`).toBe(true);
    const box = (await paragraph.boundingBox())!;
    expect(box.x + box.width).toBeLessThanOrEqual(Math.min(bodyBox.right, column.right) + 1);
    expect(box.x).toBeGreaterThanOrEqual(Math.max(bodyBox.left, 0) - 1);
  }
  await expect(body).toContainText("https://example.com/fixture/very/long/path");
  await expect(body).toContainText("very.long.fixture.email.address.for.overflow.testing@subdomain.example-domain-for-fixtures.example.com");
  await expect(body).toContainText(longIdentifier);
  await expect(body).toContainText("بسیارطولانیبدونفاصلهبرایآزمونشکستنخطدرمتنفارسیکهنبایدسرریزکندوبایدکامل‌دیده‌شود");

  // Readable line lengths. public-content-pages names no number, so this is a guard, not a typographic verdict: the body
  // column keeps its pre-migration 52rem cap (about 121 characters per line at 1280px, 100 at 768px) and neither
  // stretches across the screen nor collapses into slivers. Whether about 120 characters is readable is an owner
  // decision; WCAG 1.4.8 (AAA, not a project target) suggests 80.
  const prose = (await bodyLineLengths(page, "main p")).filter((paragraph) => paragraph.text.startsWith("این بند آزمایشی"));
  expect(prose.length, "a long prose paragraph is measured").toBeGreaterThan(0);
  for (const paragraph of prose) {
    expect(Math.max(...paragraph.lines), `"${paragraph.text}" longest line`).toBeLessThanOrEqual(125);
    expect(Math.min(...paragraph.lines), `"${paragraph.text}" shortest full line`).toBeGreaterThanOrEqual(20);
  }

  // Related articles: an image, no image and an image that does not load, in one footprint.
  const related = page.locator('section[aria-labelledby="related-articles-title"]');
  await related.scrollIntoViewIfNeeded();
  await expect(related.getByRole("heading", { level: 2, name: "مقاله‌های مرتبط", exact: true })).toBeVisible();
  const relatedCards = related.locator('[role="article"]');
  await expect(relatedCards).toHaveCount(3);
  await expect(relatedCards.getByRole("heading", { level: 3 })).toHaveCount(3);
  // Three related cards use the balanced steps: from 40rem to 64rem the odd last card spans the row as a horizontal card, so only the other two share a footprint there.
  const allRelatedMedia = await boxesOf(page, 'section[aria-labelledby="related-articles-title"] [role="article"] a[aria-hidden="true"]');
  const relatedMedia = columnsAt(width) === 2 ? allRelatedMedia.slice(0, 2) : allRelatedMedia;
  for (const box of relatedMedia) {
    expect(Math.abs(box.width - relatedMedia[0].width)).toBeLessThanOrEqual(1);
    expect(Math.abs(box.height - relatedMedia[0].height)).toBeLessThanOrEqual(1);
  }
  await expect(related.getByText("تصویر ثبت نشده", { exact: true }), "the article without an image shows the placeholder").toHaveCount(1);
  const broken = await related.locator("img").evaluateAll((images) => images.filter((image) => (image as HTMLImageElement).naturalWidth === 0).map((image) => (image as HTMLImageElement).src));
  expect(broken, "only the intended image fails").toEqual([expect.stringContaining("fixture-missing-53")]);
  for (const card of await relatedCards.all()) {
    await expect(card.getByRole("link", { name: "مشاهده جزئیات" })).toHaveAttribute("href", /^\/articles\/fixture-related-\d$/);
  }
  await expectNoHorizontalOverflow(page, "/articles/fixture-rich-article");
  await expectNoTextOverflow(page, "/articles/fixture-rich-article");
  expect(problems()).toEqual([]);
});

test("a very long category name wraps in its heading, tab, tag and breadcrumb without widening the page", async ({ page }) => {
  const width = projectWidth(page);
  const longName = "دسته‌بندی آزمایشی با نامی بسیار طولانی برای بررسی شکستن سطر در برچسب‌ها و نوار دسته‌ها";
  await openSettled(page, "/articles/category/fixture-long-category");
  const heading = page.getByRole("heading", { level: 1, name: longName, exact: true });
  await expect(heading).toBeVisible();
  await expectTextInside(heading, "the whole heading is visible");
  expect((await boxOf(page, "h1")).right).toBeLessThanOrEqual(width + 1);

  // The category strip stays inside the viewport and scrolls inside itself when it is wider than the page.
  const strip = page.getByRole("navigation", { name: "دسته‌بندی مقالات" });
  const stripBox = (await strip.boundingBox())!;
  expect(stripBox.x).toBeGreaterThanOrEqual(-1);
  expect(stripBox.x + stripBox.width).toBeLessThanOrEqual(width + 1);
  const current = strip.getByRole("link", { name: longName, exact: true });
  await expect(current).toHaveAttribute("aria-current", /^(page|true)$/);
  expect((await current.boundingBox())?.height).toBeGreaterThanOrEqual(44);
  await expect(strip.getByRole("link", { name: "همه مقالات" })).toHaveAttribute("href", "/articles");
  // The tab never outgrows the strip: its whole name wraps inside it (4rem stay clear for the edge fade and the scroll
  // arrow of the strip) instead of a one-line tab wider than the strip whose label and focus ring were cut at both ends.
  await expect.poll(async () => {
    const box = await current.boundingBox();
    return Boolean(box) && box!.x >= stripBox.x - 1 && box!.x + box!.width <= stripBox.x + stripBox.width + 1;
  }, "the current tab is scrolled fully into the strip").toBe(true);
  const tabBox = (await current.boundingBox())!;
  expect(tabBox.width, "the tab is narrower than the strip").toBeLessThanOrEqual(stripBox.width - 4 * 16 + 2);
  const tabText = await expectTextInside(current, "the whole category name is visible inside its tab");
  if (width <= 390) expect(tabText.lines, "a name this long wraps onto several lines in a phone-width strip").toBeGreaterThan(1);

  // The card's category tag wraps inside its card.
  const tag = page.locator(cards).first().locator(".astryx-badge").first();
  await expect(tag).toHaveText(longName);
  const cardBox = (await page.locator(cards).first().boundingBox())!;
  const tagBox = (await tag.boundingBox())!;
  expect(tagBox.x).toBeGreaterThanOrEqual(cardBox.x - 1);
  expect(tagBox.x + tagBox.width).toBeLessThanOrEqual(cardBox.x + cardBox.width + 1);
  await expectTextInside(tag, "the whole category tag is visible");

  const crumbs = page.getByRole("navigation", { name: "مسیر صفحه" });
  await expectTextInside(crumbs.locator('[aria-current="page"]'), "the whole current breadcrumb label is visible");
  await expectNoHorizontalOverflow(page, "/articles/category/fixture-long-category");

  // The same long name as the linked category of one article: a 44px target that wraps inside the hero card.
  await openSettled(page, "/articles/fixture-long-category-article");
  const link = page.locator(heroSelector).getByRole("link", { name: longName, exact: true });
  await expect(link).toHaveAttribute("href", "/articles/category/fixture-long-category");
  expect((await link.boundingBox())?.height).toBeGreaterThanOrEqual(44);
  const heroBox = await boxOf(page, heroSelector);
  expect(insideBox(await boxOf(page, `${heroSelector} a[href="/articles/category/fixture-long-category"]`), heroBox), "the category link stays in the hero card").toBe(true);
  await expectTextInside(link, "the whole category link label is visible");
  await expectNoHorizontalOverflow(page, "/articles/fixture-long-category-article");
});

test("tags longer than a phone width stay contained and readable", async ({ page }) => {
  await openSettled(page, "/articles/fixture-long-tags-article");
  await expect(page.locator(heroSelector)).toHaveAttribute("data-media", "none");
  const list = page.locator('ul[aria-labelledby="article-tags-label"]');
  await expect(list.getByRole("listitem")).toHaveCount(3);
  await list.scrollIntoViewIfNeeded();
  const area = await list.evaluate((element) => {
    const rect = element.parentElement!.getBoundingClientRect();
    return { left: rect.left, right: rect.right };
  });
  // The tag area never leaves the viewport either, and each tag shows its whole value (wrapped, not cut by an ellipsis).
  for (const [index, tag] of (await list.locator(".astryx-badge").all()).entries()) await softContained(`tag ${index + 1}`, tag, area);
  // A tag longer than the screen wraps onto more lines and keeps its whole text; an ellipsis does not cut it.
  const longest = list.locator(".astryx-badge").nth(1);
  await expect(longest).toContainText("TRJ-FIXTURE-TAG-WITH-NO-BREAK-OPPORTUNITY-0123456789-ABCDEFGHIJKLMNOPQRSTUVWXYZ");
  if (projectWidth(page) <= 390) expect((await textInsideBox(longest)).lines, "a tag wider than a phone wraps").toBeGreaterThan(1);
  await expectNoHorizontalOverflow(page, "/articles/fixture-long-tags-article");
  await expectNoTextOverflow(page, "/articles/fixture-long-tags-article");
});

/* ------------------------------------------------------------------------ */
/* In-browser accessibility audit (axe-core with real colour contrast)      */
/* ------------------------------------------------------------------------ */

/*
 * axe-core is resolved from the jest-axe dependency (see the helper module),
 * so no dependency is added. The audit needs real layout and computed colours,
 * which jsdom cannot give; it fails on serious and critical violations, the
 * color-contrast rule included. Narrow and wide widths are enough: the
 * 360px and 1280px projects run it.
 */
const auditedRoutes: ReadonlyArray<string> = [
  "/",
  "/products",
  "/products/industrial-basket",
  "/articles",
  "/articles/category/tech-production",
  "/articles/material-selection",
  "/about",
  "/contact",
  "/injection-molding",
  "/materials",
  "/privacy",
  "/terms",
  "/products/unknown-product",
  ...listFixtures.map((fixture) => fixture.path),
  ...detailFixtures.map((fixture) => fixture.path),
];

test("the in-browser audit is not vacuous: it reports an injected low-contrast text and an unnamed link", async ({ page }, testInfo) => {
  test.skip(!["mobile-360", "desktop-1280"].includes(testInfo.project.name), "the colour-contrast audit runs at 360 and 1280 pixels");
  await openThemed(page, "/products", "light");
  expect(await seriousAxeViolations(page), "the products page is clean before the probe").toEqual([]);
  await page.evaluate(() => {
    const probe = document.createElement("div");
    probe.style.cssText = "background: #ffffff; color: #cccccc; font-size: 16px; padding: 8px";
    probe.textContent = "Low contrast probe text";
    const link = document.createElement("a");
    link.href = "/products";
    document.querySelector("main")!.append(probe, link);
  });
  const found = (await seriousAxeViolations(page)).map((violation) => violation.id);
  expect(found).toEqual(expect.arrayContaining(["color-contrast", "link-name"]));
});

for (const path of auditedRoutes) {
  test(`axe finds no serious or critical violation on ${path} in both themes`, async ({ page }, testInfo) => {
    test.skip(!["mobile-360", "desktop-1280"].includes(testInfo.project.name), "the colour-contrast audit runs at 360 and 1280 pixels");
    test.setTimeout(60_000);
    for (const theme of themes) {
      await openThemed(page, path, theme);
      await settleImages(page);
      const violations = await seriousAxeViolations(page);
      expect(violations, `${path} (${theme}) axe violations: ${JSON.stringify(violations, null, 1)}`).toEqual([]);
    }
  });
}

/* ------------------------------------------------------------------------ */
/* Responsive transitions of six-card collections (one deterministic project) */
/* ------------------------------------------------------------------------ */

test.describe("responsive transitions of six-card collections", () => {
  // setViewportSize drives every width, so one project runs the sweep.
  const sweepProject = (projectName: string) => test.skip(projectName !== "desktop-1280", "single deterministic breakpoint sweep");

  for (const theme of themes) {
    const suffix = theme === "dark" ? " in the dark theme" : "";
    for (const path of ["/products?page=2", "/materials?page=2", "/articles?page=3"]) {
      test(`${path} six cards step from one to two columns at 40rem and from two to three at 64rem${suffix}`, async ({ page }, testInfo) => {
        sweepProject(testInfo.project.name);
        test.setTimeout(90_000);
        await openThemed(page, path, theme);
        for (const threshold of [640, 1024]) {
          const steps = [];
          for (const width of [threshold - 1, threshold, threshold + 1]) {
            await atWidth(page, width);
            const layout = await gridStep(page, cards, 'main [data-layout="grid"]');
            steps.push(layout);
            const context = `${path} at ${width}px`;
            expect(layout.boxes, context).toHaveLength(6);
            expect(layout.columns, `${context}: columns`).toBe(columnsAt(width));
            expect(overlapping(layout.boxes), `${context}: overlap`).toBe(false);
            // Six cards always fill complete rows: no empty track beside the last row. They keep natural heights.
            expect(rowMajorRtlViolations(layout.boxes, layout.container, { equalHeights: false }), context).toEqual([]);
            expect(await emptyCardBands(page), `${context}: a blank band inside a card`).toEqual([]);
            await expectNoHorizontalOverflow(page, context);
          }
          expectBoundedStep(steps[0], steps[2], `${path} ${threshold - 1} -> ${threshold + 1}px`);
        }
      });
    }
  }
});
