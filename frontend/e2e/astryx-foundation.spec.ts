import { expect, test } from "@playwright/test";

for (const theme of ["light", "dark"] as const) {
  test(`keeps the ${theme} Toranj preference across the Astryx provider`, async ({ page }) => {
    const hydrationErrors: string[] = [];
    page.on("console", (message) => {
      if (message.type() === "error" && /hydration|did not match/i.test(message.text())) {
        hydrationErrors.push(message.text());
      }
    });
    await page.addInitScript((selectedTheme) => localStorage.setItem("toranj-theme", selectedTheme), theme);
    await page.goto("/");

    await expect(page.locator("html")).toHaveAttribute("lang", "fa");
    await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
    await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
    await expect(page.locator('div[data-astryx-theme="neutral"]')).toHaveAttribute("data-theme", theme);
    await expect(page.locator('meta[name="theme-color"]').first()).toHaveAttribute(
      "content",
      theme === "light" ? "#f3f1ec" : "#0f1a1c",
    );

    const foundation = await page.evaluate(() => {
      const provider = document.querySelector<HTMLElement>('div[data-astryx-theme="neutral"]');
      const ltrData = document.querySelector<HTMLElement>(".ltr-data, [dir='ltr']");
      return {
        colorScheme: provider ? getComputedStyle(provider).colorScheme : null,
        fontFamily: getComputedStyle(document.body).fontFamily,
        unicodeBidi: ltrData ? getComputedStyle(ltrData).unicodeBidi : null,
        overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
      };
    });

    expect(foundation.colorScheme).toBe(theme);
    expect(foundation.fontFamily).toContain("Vazirmatn");
    expect(foundation.unicodeBidi).toBe("isolate");
    expect(foundation.overflow).toBe(false);
    expect(hydrationErrors).toEqual([]);
  });
}

for (const theme of ["light", "dark"] as const) {
  test(`keeps Toranj tokens and unmigrated element defaults under the ${theme} Astryx cascade`, async ({ page }) => {
    await page.addInitScript((selectedTheme) => localStorage.setItem("toranj-theme", selectedTheme), theme);
    await page.goto("/auth/login");
    await expect(page.locator('div[data-astryx-theme="neutral"]')).toHaveAttribute("data-theme", theme);

    const cascade = await page.evaluate(() => {
      const provider = document.querySelector<HTMLElement>('div[data-astryx-theme="neutral"]');
      if (!provider) return null;
      const token = (element: Element, name: string) => getComputedStyle(element).getPropertyValue(name).trim();

      // A bare legacy heading/paragraph must inherit from its container instead
      // of receiving the Astryx theme's element typography.
      const container = document.createElement("div");
      container.style.cssText = "color: rgb(1, 2, 3); font-size: 10px; line-height: 30px;";
      const heading = document.createElement("h2");
      const paragraph = document.createElement("p");
      const list = document.createElement("ul");
      container.append(heading, paragraph, list);
      provider.append(container);
      const result = {
        rootPrimary: token(document.documentElement, "--color-text-primary"),
        providerPrimary: token(provider, "--color-text-primary"),
        rootSecondary: token(document.documentElement, "--color-text-secondary"),
        providerSecondary: token(provider, "--color-text-secondary"),
        headingColor: getComputedStyle(heading).color,
        headingLineHeight: getComputedStyle(heading).lineHeight,
        headingFontSize: getComputedStyle(heading).fontSize,
        paragraphColor: getComputedStyle(paragraph).color,
        paragraphFontSize: getComputedStyle(paragraph).fontSize,
        listStyle: getComputedStyle(list).listStyleType,
      };
      container.remove();
      return result;
    });

    expect(cascade).not.toBeNull();
    expect(cascade?.rootPrimary).toBe(theme === "light" ? "#1f2c2d" : "#e9e6df");
    expect(cascade?.providerPrimary).toBe(cascade?.rootPrimary);
    expect(cascade?.providerSecondary).toBe(cascade?.rootSecondary);
    expect(cascade?.headingColor).toBe("rgb(1, 2, 3)");
    expect(cascade?.headingLineHeight).toBe("30px");
    expect(cascade?.headingFontSize).toBe("15px");
    expect(cascade?.paragraphColor).toBe("rgb(1, 2, 3)");
    expect(cascade?.paragraphFontSize).toBe("10px");
    expect(cascade?.listStyle).toBe("disc");
  });
}

test("hydrates streamed content in place and never hands the document theme to Astryx", async ({ page }) => {
  // A stored preference that differs from the system preference is the case in
  // which Astryx's own "system" resolution would disagree with Toranj's.
  await page.emulateMedia({ colorScheme: "light" });
  const runtimeErrors: string[] = [];
  page.on("pageerror", (error) => runtimeErrors.push(error.message));
  await page.addInitScript(() => {
    localStorage.setItem("toranj-theme", "dark");
    const record = { maxMainElements: 0, observedThemes: [] as string[] };
    (window as unknown as { __toranjHydration: typeof record }).__toranjHydration = record;
    new MutationObserver(() => {
      record.maxMainElements = Math.max(record.maxMainElements, document.querySelectorAll("main").length);
    }).observe(document, { childList: true, subtree: true });
    new MutationObserver(() => {
      const theme = document.documentElement?.getAttribute("data-theme") ?? "missing";
      if (!record.observedThemes.includes(theme)) record.observedThemes.push(theme);
    }).observe(document, { attributes: true, attributeFilter: ["data-theme"], subtree: true });
  });

  // The provider used to publish its mode during hydration. React then threw
  // away streamed content that was still waiting for its reveal and rendered
  // it again on the client, leaving a second copy in the document. Whether a
  // load hit that window was timing dependent, so several loads are sampled.
  for (let load = 0; load < 6; load += 1) {
    await page.goto("/products/industrial-basket");
    await expect(page.getByRole("heading", { name: "سبد صنعتی نمونه", exact: true })).toBeVisible();
    await expect(page.locator('div[data-astryx-theme="neutral"]')).toHaveAttribute("data-theme", "dark");
    const record = await page.evaluate(() => (window as unknown as { __toranjHydration: { maxMainElements: number; observedThemes: string[] } }).__toranjHydration);
    expect(record.maxMainElements, `load ${load + 1} rendered the streamed page content twice`).toBe(1);
    expect(record.observedThemes, `load ${load + 1} exposed a document theme other than the stored one`).toEqual(["dark"]);
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
    expect(await page.evaluate(() => document.documentElement.style.colorScheme)).toBe("dark");
  }
  expect(runtimeErrors).toEqual([]);
});

test("theme control reflects a stored preference that differs from the system", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "light" });
  await page.addInitScript(() => localStorage.setItem("toranj-theme", "dark"));
  await page.goto("/brand-preview");

  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  const toggle = page.getByRole("button", { name: "فعال‌کردن حالت روشن" });
  await expect(toggle).toBeVisible();
  await expect(toggle).toHaveAttribute("aria-pressed", "true");

  await toggle.click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await expect(page.locator('div[data-astryx-theme="neutral"]')).toHaveAttribute("data-theme", "light");
  await expect(page.getByRole("button", { name: "فعال‌کردن حالت تاریک" })).toHaveAttribute("aria-pressed", "false");
  expect(await page.evaluate(() => localStorage.getItem("toranj-theme"))).toBe("light");
});

test("keeps reduced motion and private noindex behavior", async ({ page, context }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await context.addCookies([
    {
      name: "toranj_session",
      value: "customer-astryx-foundation",
      domain: "127.0.0.1",
      path: "/",
      httpOnly: true,
      sameSite: "Lax",
    },
  ]);
  const response = await page.goto("/account");

  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/i);
  expect(response?.headers()["cache-control"]).toContain("no-store");
  expect(
    await page.locator('div[data-astryx-theme="neutral"]').evaluate((element) =>
      getComputedStyle(element).getPropertyValue("--duration-fast").trim(),
    ),
  ).toBe(".01ms");
});
