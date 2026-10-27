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

      const hasOverflow = await page.evaluate(
        () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
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

    const breadcrumb = page.getByRole("navigation", { name: "مسیر راهنما" });
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

    const breadcrumb = page.getByRole("navigation", { name: "مسیر راهنما" });
    await expect(breadcrumb).toBeVisible();
    await expect(breadcrumb.getByText("فناوری و تولید")).toBeVisible();
  });

  test("returns 404 for non-existent article", async ({ page }) => {
    const response = await page.goto("/articles/non-existent-article-slug");
    expect(response?.status()).toBe(404);
  });
});
