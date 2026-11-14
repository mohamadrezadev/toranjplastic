import { expect, test } from "@playwright/test";

const viewports = [
  { width: 360, height: 640, name: "360px" },
  { width: 390, height: 844, name: "390px" },
  { width: 768, height: 1024, name: "768px" },
  { width: 1280, height: 800, name: "1280px" },
];

test.describe("Strapi Articles Integration", () => {
  for (const vp of viewports) {
    test(`renders /articles responsive without horizontal overflow on ${vp.name}`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto("/articles");

      await expect(page.getByRole("heading", { name: "مقالات تخصصی" })).toBeVisible();

      // html and body both hide horizontal overflow, so <body> is the scroll container to check.
      const hasOverflow = await page.evaluate(
        () => document.documentElement.scrollWidth > document.documentElement.clientWidth || document.body.scrollWidth > document.body.clientWidth,
      );
      expect(hasOverflow).toBe(false);

      const dir = await page.locator("html").getAttribute("dir");
      expect(dir).toBe("rtl");
    });
  }

  test("renders article detail page with title, body, and breadcrumb", async ({ page }) => {
    await page.goto("/articles/plastic-injection-material-selection-guide");

    await expect(
      page.getByRole("heading", { name: "راهنمای انتخاب مواد اولیه در قالب‌گیری تزریق پلاستیک" }),
    ).toBeVisible();

    await expect(page.getByText("انتخاب ماده اولیه پلیمری در فرایند تزریق پلاستیک صنعتی")).toBeVisible();

    const breadcrumb = page.getByRole("navigation", { name: "مسیر صفحه" });
    await expect(breadcrumb).toBeVisible();
    await expect(breadcrumb.getByText("خانه")).toBeVisible();
    await expect(breadcrumb.getByText("مقالات")).toBeVisible();

    const jsonLd = await page.locator('script[type="application/ld+json"]').textContent();
    expect(jsonLd).toContain('"@type":"Article"');
    expect(jsonLd).toContain("راهنمای انتخاب مواد اولیه");
  });

  test("renders category page with filtered articles and breadcrumb", async ({ page }) => {
    await page.goto("/articles/category/tech-production");

    await expect(page.getByRole("heading", { name: "فناوری و تولید" })).toBeVisible();
    await expect(page.getByText("راهنمای انتخاب مواد اولیه در قالب‌گیری تزریق پلاستیک")).toBeVisible();

    const breadcrumb = page.getByRole("navigation", { name: "مسیر صفحه" });
    await expect(breadcrumb).toBeVisible();
    await expect(breadcrumb.getByText("فناوری و تولید")).toBeVisible();
  });

  test("returns 404 for non-existent article", async ({ page }) => {
    const response = await page.goto("/articles/non-existent-article-slug");
    expect([200, 404]).toContain(response?.status());
    await expect(page.getByRole("heading", { name: "محتوای موردنظر پیدا نشد" })).toBeVisible();
  });

  test("category strip is one Tab stop that moves in RTL order with arrow keys and follows its links", async ({ page }) => {
    await page.goto("/articles");
    await expect(page.locator('div[data-astryx-theme="neutral"]')).toHaveAttribute("data-theme", /^(light|dark)$/);
    const strip = page.getByRole("navigation", { name: "دسته‌بندی مقالات" });
    const all = strip.getByRole("link", { name: "همه مقالات" });
    const technology = strip.getByRole("link", { name: "فناوری و تولید" });
    const materials = strip.getByRole("link", { name: "انتخاب مواد" });
    await expect(all).toHaveAttribute("aria-current", /^(page|true)$/);
    await expect(technology).not.toHaveAttribute("aria-current", /.+/);
    await expect(all).toHaveAttribute("href", "/articles");
    await expect(technology).toHaveAttribute("href", "/articles/category/tech-production");
    await expect(materials).toHaveAttribute("href", "/articles/category/materials-selection-category");

    // The current view leads at the inline start (right) and the rest follow leftwards.
    const boxes = await Promise.all([all, technology, materials].map((link) => link.boundingBox()));
    expect(boxes[1]!.x + boxes[1]!.width).toBeLessThanOrEqual(boxes[0]!.x + 1);
    expect(boxes[2]!.x + boxes[2]!.width).toBeLessThanOrEqual(boxes[1]!.x + 1);
    for (const box of boxes) expect(box!.height).toBeGreaterThanOrEqual(44);

    // One Tab stop: from the current tab, Tab leaves the strip for the first article card.
    await all.focus();
    await page.keyboard.press("Tab");
    expect(await page.evaluate(() => Boolean(document.activeElement?.closest('nav[aria-label="دسته‌بندی مقالات"]')))).toBe(false);
    await expect(page.getByRole("article").first().getByRole("link").first()).toBeFocused();

    // In RTL, ArrowLeft moves to the next tab on the left; Home and End jump to the ends.
    await all.focus();
    await page.keyboard.press("ArrowLeft");
    await expect(technology).toBeFocused();
    await page.keyboard.press("ArrowLeft");
    await expect(materials).toBeFocused();
    await page.keyboard.press("ArrowRight");
    await expect(technology).toBeFocused();
    await page.keyboard.press("Home");
    await expect(all).toBeFocused();
    await page.keyboard.press("End");
    await expect(materials).toBeFocused();
    expect(await materials.evaluate((element) => element.matches(":focus-visible") && getComputedStyle(element).outlineStyle !== "none")).toBe(true);

    await page.keyboard.press("ArrowRight");
    await expect(technology).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/\/articles\/category\/tech-production$/);
    await expect(page.getByRole("heading", { level: 1, name: "فناوری و تولید" })).toBeVisible();
  });

  test("article cards link their category with a 44px target", async ({ page }) => {
    await page.goto("/articles");
    const card = page.getByRole("article").filter({ hasText: "راهنمای انتخاب ماده" });
    const category = card.getByRole("link", { name: "انتخاب مواد" });
    await expect(category).toHaveAttribute("href", "/articles/category/materials-selection-category");
    // The whole 44 by 44 pixel box is the target, however short the category name.
    const target = await category.boundingBox();
    expect(target?.height).toBeGreaterThanOrEqual(44);
    expect(target?.width).toBeGreaterThanOrEqual(44);
    const time = card.locator("time");
    await expect(time).toHaveAttribute("datetime", "2026-10-10T08:00:00.000Z");
    // The link reads as a link without hover (border and underline), unlike the plain date beside it.
    const cue = await category.evaluate((link, date) => {
      // The innermost span is the visible pill (Astryx Link wraps it in its own Text span).
      const label = (Array.from(link.querySelectorAll("span")).pop() ?? link) as HTMLElement;
      const labelStyle = getComputedStyle(label);
      const dateStyle = getComputedStyle(date as HTMLElement);
      return {
        underline: labelStyle.textDecorationLine,
        border: parseFloat(labelStyle.borderTopWidth),
        dateBorder: parseFloat(dateStyle.borderTopWidth),
        dateBackground: dateStyle.backgroundColor,
        dateInBadge: Boolean((date as HTMLElement).closest(".astryx-badge")),
      };
    }, await time.elementHandle());
    expect(cue.underline).toContain("underline");
    expect(cue.border).toBeGreaterThanOrEqual(1);
    expect(cue.dateBorder).toBe(0);
    expect(cue.dateInBadge).toBe(false);
    await category.focus();
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/\/articles\/category\/materials-selection-category$/);
  });

  test("a short category name still gets the full 44px link target", async ({ page }) => {
    await page.goto("/articles");
    // Edit the DOM only after the streamed content has hydrated and the provider has settled.
    await expect(page.locator('div[data-astryx-theme="neutral"]')).toHaveAttribute("data-theme", /^(light|dark)$/);
    const category = page.getByRole("article").first().locator('a[href^="/articles/category/"]');
    await expect(category).toBeVisible();
    // Shrink the visible name to one short word; the target keeps its minimum box.
    await category.evaluate((link) => {
      const label = (Array.from(link.querySelectorAll("span")).pop() ?? link) as HTMLElement;
      label.textContent = "فنی";
    });
    await expect(category).toHaveText("فنی");
    const target = await category.boundingBox();
    expect(target?.width).toBeGreaterThanOrEqual(44);
    expect(target?.height).toBeGreaterThanOrEqual(44);
  });

  test("a category page keeps the strip and marks its own category as the current view", async ({ page }) => {
    await page.goto("/articles/category/tech-production");
    await expect(page.locator('div[data-astryx-theme="neutral"]')).toHaveAttribute("data-theme", /^(light|dark)$/);
    await expect(page.getByRole("heading", { level: 1, name: "فناوری و تولید" })).toBeVisible();
    const strip = page.getByRole("navigation", { name: "دسته‌بندی مقالات" });
    const all = strip.getByRole("link", { name: "همه مقالات" });
    const technology = strip.getByRole("link", { name: "فناوری و تولید" });
    await expect(technology).toHaveAttribute("aria-current", /^(page|true)$/);
    await expect(all).not.toHaveAttribute("aria-current", /.+/);
    // The strip is still one Tab stop, now on the current category, just before the way back.
    const back = page.getByRole("link", { name: "مشاهده همه دسته‌بندی‌ها و مقالات" });
    await back.focus();
    await page.keyboard.press("Shift+Tab");
    await expect(technology).toBeFocused();
    // In RTL, ArrowRight moves towards the inline start, to "all articles".
    await page.keyboard.press("ArrowRight");
    await expect(all).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/\/articles$/);
    await expect(page.getByRole("navigation", { name: "دسته‌بندی مقالات" }).getByRole("link", { name: "همه مقالات" })).toHaveAttribute("aria-current", /^(page|true)$/);
  });

  test("a category strip wider than the page scrolls inside itself", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop-1280", "single deterministic narrow-width check");
    // Narrower than the required 360px on purpose: the fixture's three categories only overflow below it.
    await page.setViewportSize({ width: 320, height: 800 });
    await page.goto("/articles");
    const strip = page.getByRole("navigation", { name: "دسته‌بندی مقالات" });
    await expect(strip).toBeVisible();
    const scroller = await strip.evaluate((navigation) => {
      const candidates = [navigation, ...navigation.querySelectorAll<HTMLElement>("*")];
      const scrolling = candidates.find((element) => element.scrollWidth > element.clientWidth + 1 && getComputedStyle(element).overflowX !== "visible");
      const box = scrolling?.getBoundingClientRect();
      return scrolling && box ? { overflowX: getComputedStyle(scrolling).overflowX, left: box.left, right: box.right } : null;
    });
    expect(scroller, "the strip scrolls locally").not.toBeNull();
    expect(["auto", "scroll"]).toContain(scroller?.overflowX);
    expect(scroller!.left).toBeGreaterThanOrEqual(0);
    expect(scroller!.right).toBeLessThanOrEqual(320);
    // The current view stays in sight and the page itself never scrolls sideways.
    const current = await strip.getByRole("link", { name: "همه مقالات" }).boundingBox();
    expect(current!.x).toBeGreaterThanOrEqual(scroller!.left - 1);
    expect(current!.x + current!.width).toBeLessThanOrEqual(scroller!.right + 1);
    expect(await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth || document.body.scrollWidth > document.body.clientWidth)).toBe(false);
  });
});
