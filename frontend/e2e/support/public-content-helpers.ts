import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { expect, type Locator, type Page } from "@playwright/test";

/*
 * Shared browser helpers for the public content specs (OpenSpec change
 * rebuild-ui-with-astryx, task 5.4): e2e/public-content.spec.ts and
 * e2e/public-content-variants.spec.ts.
 *
 * Page-level overflow: html and body both set `overflow-x: hidden`, which
 * makes <body> its own scroll container and hides overflow from
 * `document.documentElement.scrollWidth`; the home <main> also clips. The
 * overflow helper therefore checks body.scrollWidth and every rendered
 * element against the viewport, allowing only content that sits inside an
 * in-viewport component clip or scroll container (for example the article
 * category strip). `textOverflow` adds the text-level check that an element
 * box cannot give: a heading or label whose glyphs run past its own box is
 * clipped by the card around it without widening the page.
 */

export type Theme = "light" | "dark";
export type Box = { left: number; right: number; top: number; bottom: number; width: number; height: number };
export type FocusStop = {
  region: "header" | "main" | "footer" | "other";
  target: string;
  name: string;
  box: Box;
  group: Box | null;
  groupKey: string | null;
  focusVisible: boolean;
  outlineStyle: string;
  outlineWidth: number;
  outlineColor: string;
  outlineContrast: number | null;
  clippedBy: string | null;
  inverse: boolean;
  controlTarget: boolean;
};

export const themes: ReadonlyArray<Theme> = ["light", "dark"];
export const projectWidth = (page: Page) => page.viewportSize()?.width ?? 1280;
export const tolerance = 2;
/** Persian digits, as the pagination readout prints them. */
export const fa = (value: number) => value.toLocaleString("fa-IR");

/** Opens a route and waits until the Astryx provider has published the resolved theme. */
export async function openSettled(page: Page, path: string) {
  await page.goto(path);
  await expect(page.locator("main").first()).toBeVisible();
  await expect(page.locator('div[data-astryx-theme="neutral"]')).toHaveAttribute("data-theme", /^(light|dark)$/);
}

/** Opens a route in the given theme and waits for the document to adopt it. */
export async function openThemed(page: Page, path: string, theme: Theme) {
  await page.emulateMedia({ colorScheme: theme });
  await openSettled(page, path);
  await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
}

/** Every rendered element that escapes the viewport horizontally, plus a scrolling <body>. */
export async function horizontalOverflow(page: Page) {
  return page.evaluate(() => {
    const viewport = document.documentElement.clientWidth;
    const offenders: string[] = [];
    if (document.documentElement.scrollWidth > viewport + 1) offenders.push(`document ${document.documentElement.scrollWidth}px`);
    if (document.body.scrollWidth > document.body.clientWidth + 1) offenders.push(`body ${document.body.scrollWidth}px`);
    const pageLevel = (element: Element) => element === document.body || element === document.documentElement || element.tagName === "MAIN";
    for (const element of document.body.querySelectorAll("*")) {
      const rect = element.getBoundingClientRect();
      if (rect.width < 2 || rect.height < 2 || (rect.right <= viewport + 1 && rect.left >= -1)) continue;
      const style = getComputedStyle(element);
      if (style.visibility === "hidden" || style.position === "fixed" || element.closest("dialog:not([open]), template")) continue;
      let contained = false;
      for (let ancestor = element.parentElement; ancestor && !pageLevel(ancestor); ancestor = ancestor.parentElement) {
        if (getComputedStyle(ancestor).overflowX === "visible") continue;
        const bounds = ancestor.getBoundingClientRect();
        contained = bounds.right <= viewport + 1 && bounds.left >= -1;
        break;
      }
      if (!contained) offenders.push(`${element.tagName.toLowerCase()} "${(element.textContent ?? "").trim().slice(0, 24)}" [${Math.round(rect.left)}, ${Math.round(rect.right)}]`);
    }
    return offenders.slice(0, 6);
  });
}

export async function expectNoHorizontalOverflow(page: Page, context: string) {
  expect(await horizontalOverflow(page), `${context} must not overflow horizontally`).toEqual([]);
}

/**
 * Text that runs past its own box: a leaf element in <main> whose content is
 * wider than the element. The card or frame around it hides the excess, so
 * the page does not widen and `horizontalOverflow` stays quiet while the
 * visitor loses the end of a heading, summary, tag or label. Intentional
 * scrollers (overflow auto or scroll) and inline boxes are skipped.
 */
export async function textOverflow(page: Page) {
  return page.evaluate(() => {
    const offenders: string[] = [];
    for (const element of document.querySelectorAll<HTMLElement>("main *")) {
      const style = getComputedStyle(element);
      if (style.display === "inline" || style.display === "none" || style.visibility === "hidden" || ["auto", "scroll"].includes(style.overflowX)) continue;
      if (element.closest('[aria-hidden="true"], script, template')) continue;
      const ownText = [...element.childNodes].filter((node) => node.nodeType === Node.TEXT_NODE).map((node) => node.textContent ?? "").join("").trim();
      if (!ownText) continue;
      if (element.scrollWidth > element.clientWidth + 1) {
        offenders.push(`${element.tagName.toLowerCase()} "${ownText.slice(0, 28)}" content ${element.scrollWidth}px in ${element.clientWidth}px`);
      }
    }
    return offenders.slice(0, 6);
  });
}

export async function expectNoTextOverflow(page: Page, context: string) {
  expect(await textOverflow(page), `${context} must not clip text past its box`).toEqual([]);
}

/**
 * Text whose own box is wider than the container that clips it. An unbreakable
 * title or tag keeps its min-content width inside a flex or grid column, so
 * its box grows past the card while the card's overflow clip hides the end of
 * it: the page does not widen (horizontalOverflow allows content that an
 * in-viewport clip contains) and the text fits its own box (textOverflow stays
 * quiet), yet the visitor loses the end of the text. Intentional scrollers
 * (overflow auto or scroll, such as the category strip) are not clips.
 */
export async function clippedText(page: Page) {
  return page.evaluate(() => {
    const offenders: string[] = [];
    for (const element of document.querySelectorAll<HTMLElement>("main *")) {
      if (element.closest('[aria-hidden="true"], script, template')) continue;
      const ownText = [...element.childNodes].filter((node) => node.nodeType === Node.TEXT_NODE).map((node) => node.textContent ?? "").join("").trim();
      if (!ownText) continue;
      const rect = element.getBoundingClientRect();
      if (rect.width < 2 || rect.height < 2 || getComputedStyle(element).visibility === "hidden") continue;
      for (let ancestor = element.parentElement; ancestor && ancestor.tagName !== "MAIN" && ancestor !== document.body; ancestor = ancestor.parentElement) {
        const overflow = getComputedStyle(ancestor).overflowX;
        if (overflow === "visible") continue;
        if (overflow === "auto" || overflow === "scroll") break;
        const bounds = ancestor.getBoundingClientRect();
        if (rect.left < bounds.left - 1 || rect.right > bounds.right + 1) {
          offenders.push(`${element.tagName.toLowerCase()} "${ownText.slice(0, 28)}" [${Math.round(rect.left)}, ${Math.round(rect.right)}] in ${ancestor.tagName.toLowerCase()} [${Math.round(bounds.left)}, ${Math.round(bounds.right)}]`);
        }
        break;
      }
    }
    return offenders.slice(0, 6);
  });
}

export async function expectNoClippedText(page: Page, context: string) {
  expect(await clippedText(page), `${context} must not hide text under a clipping container`).toEqual([]);
}

/** Describes the focused element: position, card group, focus treatment and clipping. */
export function readFocusStop() {
  const element = document.activeElement as HTMLElement | null;
  if (!element || element === document.body || element === document.documentElement) return null;
  const toBox = (rect: DOMRect) => ({ left: rect.left + scrollX, right: rect.right + scrollX, top: rect.top + scrollY, bottom: rect.bottom + scrollY, width: rect.width, height: rect.height });
  const parse = (value: string) => {
    const rgb = value.match(/^rgba?\(([^)]+)\)$/);
    if (rgb) {
      const [r, g, b, a = 1] = rgb[1].split(/[\s,/]+/).filter(Boolean).map(Number);
      return { r, g, b, a };
    }
    const srgb = value.match(/^color\(srgb ([^)]+)\)$/);
    if (srgb) {
      const [r, g, b, a = 1] = srgb[1].split(/[\s/]+/).filter(Boolean).map(Number);
      return { r: r * 255, g: g * 255, b: b * 255, a };
    }
    return null;
  };
  const luminance = ({ r, g, b }: { r: number; g: number; b: number }) => {
    const channel = (value: number) => {
      const scaled = value / 255;
      return scaled <= 0.04045 ? scaled / 12.92 : ((scaled + 0.055) / 1.055) ** 2.4;
    };
    return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
  };
  // The outline is drawn outside the element, over its ancestors' surface.
  const surface = () => {
    const layers: { r: number; g: number; b: number; a: number }[] = [];
    for (let ancestor = element.parentElement; ancestor; ancestor = ancestor.parentElement) {
      const style = getComputedStyle(ancestor);
      if (style.backgroundImage !== "none") return null;
      const color = parse(style.backgroundColor);
      if (color && color.a > 0) {
        layers.push(color);
        if (color.a >= 1) break;
      }
    }
    return layers.reverse().reduce((bottom, top) => ({ r: top.r * top.a + bottom.r * (1 - top.a), g: top.g * top.a + bottom.g * (1 - top.a), b: top.b * top.a + bottom.b * (1 - top.a), a: 1 }), { r: 255, g: 255, b: 255, a: 1 });
  };
  const style = getComputedStyle(element);
  const outline = parse(style.outlineColor);
  const background = surface();
  let outlineContrast: number | null = null;
  if (outline && background) {
    const [high, low] = [luminance(outline), luminance(background)].sort((a, b) => b - a);
    outlineContrast = (high + 0.05) / (low + 0.05);
  }
  const rect = element.getBoundingClientRect();
  const reach = (parseFloat(style.outlineOffset) || 0) + (parseFloat(style.outlineWidth) || 0);
  let clippedBy: string | null = null;
  for (let ancestor = element.parentElement; ancestor && ancestor !== document.body; ancestor = ancestor.parentElement) {
    const ancestorStyle = getComputedStyle(ancestor);
    const bounds = ancestor.getBoundingClientRect();
    const clipsX = ancestorStyle.overflowX !== "visible" && (rect.left - reach < bounds.left - 1 || rect.right + reach > bounds.right + 1);
    const clipsY = ancestorStyle.overflowY !== "visible" && (rect.top - reach < bounds.top - 1 || rect.bottom + reach > bounds.bottom + 1);
    if (clipsX || clipsY) {
      clippedBy = `${ancestor.tagName.toLowerCase()}.${String(ancestor.className).split(" ")[0]}`;
      break;
    }
  }
  // A card (or a link that wraps one) groups its stops; its document box identifies it.
  const groupElement = element.closest<HTMLElement>('[role="article"], .astryx-card') ?? (element.querySelector(".astryx-card") ? element : null);
  const group = groupElement ? toBox(groupElement.getBoundingClientRect()) : null;
  const labelledBy = element.getAttribute("aria-labelledby");
  const name = (element.getAttribute("aria-label") ?? (labelledBy ? labelledBy.split(/\s+/).map((id) => document.getElementById(id)?.textContent ?? "").join(" ") : element.innerText) ?? "").replace(/\s+/g, " ").trim();
  return {
    region: (element.closest("header") ? "header" : element.closest("main") ? "main" : element.closest("footer") ? "footer" : "other") as "header" | "main" | "footer" | "other",
    target: element.tagName === "A" ? element.getAttribute("href") ?? "" : `${element.tagName.toLowerCase()}:${name}`,
    name,
    box: toBox(rect),
    group,
    groupKey: group ? [group.left, group.top, group.width, group.height].map(Math.round).join(",") : null,
    focusVisible: element.matches(":focus-visible"),
    outlineStyle: style.outlineStyle,
    outlineWidth: parseFloat(style.outlineWidth) || 0,
    outlineColor: style.outlineColor,
    outlineContrast,
    clippedBy,
    inverse: Boolean(element.closest('[data-toranj-surface="inverse"]')),
    // Standalone controls keep the 44px target; breadcrumb, heading and in-text links are exempt.
    controlTarget: !element.closest('h1, h2, h3, h4, h5, h6, p, nav[aria-label="مسیر صفحه"]'),
  };
}

/**
 * Every control in <main> that the Tab key reaches, in document order: the
 * same `target` strings that readFocusStop reports. Elements with a negative
 * tabindex (the media shortcut, a catalog target, the inactive category tabs)
 * and hidden elements are not tab stops.
 */
export function readTabbableTargets() {
  const main = document.querySelector("main");
  if (!main) return [];
  const nameOf = (element: HTMLElement) => {
    const labelledBy = element.getAttribute("aria-labelledby");
    return (element.getAttribute("aria-label") ?? (labelledBy ? labelledBy.split(/\s+/).map((id) => document.getElementById(id)?.textContent ?? "").join(" ") : element.innerText) ?? "").replace(/\s+/g, " ").trim();
  };
  return [...main.querySelectorAll<HTMLElement>("a[href], button, input, select, textarea, summary, [tabindex]")]
    .filter((element) => element.tabIndex >= 0 && !element.hasAttribute("disabled") && element.getClientRects().length > 0 && getComputedStyle(element).visibility !== "hidden" && !element.closest("[inert], [aria-hidden='true']"))
    .map((element) => (element.tagName === "A" ? element.getAttribute("href") ?? "" : `${element.tagName.toLowerCase()}:${nameOf(element)}`));
}

/** Tabs from the document start until focus reaches the footer, as a keyboard visitor would. */
export async function tabSequence(page: Page, maxPresses = 90) {
  const stops: FocusStop[] = [];
  for (let press = 0; press < maxPresses; press += 1) {
    await page.keyboard.press("Tab");
    const stop = await page.evaluate(readFocusStop);
    if (!stop) break;
    stops.push(stop);
    if (stop.region === "footer") break;
  }
  return stops;
}

export const sameRow = (a: Box, b: Box) => Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top) >= 0.5 * Math.min(a.height, b.height);

/**
 * Persian RTL reading order: on one visual row each next stop lies further
 * towards the inline end (left); otherwise it starts on a later row. Stops
 * in different cards compare their cards, so a grid is read card by card,
 * row by row, starting at the inline start (right).
 */
export function rtlOrderViolations(stops: FocusStop[]) {
  const problems: string[] = [];
  for (let index = 1; index < stops.length; index += 1) {
    const previous = stops[index - 1];
    const current = stops[index];
    const sameGroup = previous.groupKey !== null && previous.groupKey === current.groupKey;
    const a = sameGroup ? previous.box : previous.group ?? previous.box;
    const b = sameGroup ? current.box : current.group ?? current.box;
    const label = `"${previous.name}" -> "${current.name}"`;
    if (sameRow(a, b)) {
      if (!(b.right <= a.left + tolerance)) problems.push(`${label}: next stop on the same row is not further left`);
    } else if (b.top < a.top - tolerance) {
      problems.push(`${label}: next stop starts on an earlier row`);
    }
  }
  return problems;
}

/**
 * Boxes in DOM order must read row by row from the inline start (right edge) of their container.
 * `equalHeights` (the default) also requires the items of one row to share one height, as the
 * stretched institutional cards, the home capability cards and the inquiry steps do. Content cards
 * (ContentCard) keep their natural height instead (public-visual-experience: no artificial empty
 * card regions), so the grids of content cards pass `equalHeights: false` and are checked with
 * `emptyCardBands`.
 */
export function rowMajorRtlViolations(boxes: Box[], container: Box, { equalHeights = true }: { equalHeights?: boolean } = {}) {
  const problems: string[] = [];
  if (!boxes.length) return ["no items"];
  if (Math.abs(boxes[0].right - container.right) > tolerance) problems.push(`first item ends at ${Math.round(boxes[0].right)}, not at the inline start ${Math.round(container.right)}`);
  for (let index = 1; index < boxes.length; index += 1) {
    const previous = boxes[index - 1];
    const current = boxes[index];
    if (Math.abs(current.top - previous.top) <= tolerance) {
      if (current.right > previous.left + tolerance) problems.push(`item ${index + 1} is not left of item ${index} on its row`);
      if (equalHeights && Math.abs(current.height - previous.height) > tolerance) problems.push(`item ${index + 1} height ${Math.round(current.height)} differs from its row (${Math.round(previous.height)})`);
    } else {
      if (current.top < previous.bottom - tolerance) problems.push(`item ${index + 1} overlaps or precedes the previous row`);
      if (Math.abs(current.right - container.right) > tolerance) problems.push(`item ${index + 1} starts a row away from the inline start`);
    }
  }
  return problems;
}

/**
 * Natural card height (public-visual-experience: "predictable natural sizing ... without creating
 * artificial empty card regions"). In every content card the "مشاهده جزئیات" action closes the
 * content, so the card's bottom edge lies no further below it than the card body's padding
 * (24px at most) and the card border, whatever the height of the card's neighbours. A card
 * stretched to the tallest card of its row used to keep a blank band of up to 200px between its
 * summary and its action. Returns the cards that break the rule ("title: band px"); the cards
 * that lay out as a grid of their own (the featured card and the horizontal card that spans a
 * two-column row) set their height by their media and are not measured.
 */
export async function emptyCardBands(page: Page, scope = "main", allowance = 28) {
  return page.locator(`${scope} [role="article"]`).evaluateAll((cards, limit) => {
    const offenders: string[] = [];
    for (const card of cards) {
      if (getComputedStyle(card).display === "grid") continue;
      const links = [...card.querySelectorAll("a")].filter((link) => (link.textContent ?? "").includes("مشاهده جزئیات"));
      const action = links[links.length - 1];
      if (!action) {
        offenders.push(`"${(card.querySelector("h2, h3")?.textContent ?? "").slice(0, 28)}": no action link`);
        continue;
      }
      const band = card.getBoundingClientRect().bottom - action.getBoundingClientRect().bottom;
      if (band > limit) offenders.push(`"${(card.querySelector("h2, h3")?.textContent ?? "").slice(0, 28)}": ${Math.round(band)}px below its action`);
    }
    return offenders;
  }, allowance);
}

export async function boxesOf(page: Page, selector: string): Promise<Box[]> {
  return page.locator(selector).evaluateAll((elements) => elements.map((element) => {
    const rect = element.getBoundingClientRect();
    return { left: rect.left + scrollX, right: rect.right + scrollX, top: rect.top + scrollY, bottom: rect.bottom + scrollY, width: rect.width, height: rect.height };
  }));
}

export async function boxOf(page: Page, selector: string): Promise<Box> {
  const [box] = await boxesOf(page, selector);
  expect(box, `${selector} must render`).toBeDefined();
  return box;
}

export const inquiryStrip = 'section[aria-labelledby="inquiry-strip-title"]';
export const inquirySteps = `${inquiryStrip} ol > li`;
export const columnsOf = (boxes: Box[]) => boxes.filter((box) => Math.abs(box.top - boxes[0].top) <= tolerance).length;
/** Rows of a grid: distinct tops, merged within the tolerance. */
export const rowsOf = (boxes: Box[]) => boxes.reduce<number[]>((tops, box) => (tops.some((top) => Math.abs(top - box.top) <= tolerance) ? tops : [...tops, box.top]), []).length;
export const overlapping = (boxes: Box[]) => boxes.some((a, i) => boxes.some((b, j) => j > i && Math.min(a.right, b.right) - Math.max(a.left, b.left) > 1 && Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top) > 1));
export const documentHeight = (page: Page) => page.evaluate(() => document.documentElement.scrollHeight);

/** Drives the viewport width and waits until the layout reports it. */
export async function atWidth(page: Page, width: number) {
  await page.setViewportSize({ width, height: 900 });
  await expect.poll(() => page.evaluate(() => document.documentElement.clientWidth)).toBe(width);
}

/* ------------------------------------------------------------------------ */
/* Keyboard walk                                                            */
/* ------------------------------------------------------------------------ */

/**
 * Tab walk of one route in one theme, with the assertions every public route
 * shares: the shell never interleaves with the content; the content stops are
 * the expected ones (an exact list, or every tab stop in document order);
 * they read in visual RTL order; every stop is named, matches :focus-visible,
 * draws a solid outline of at least 2px at 3:1 and is not clipped; standalone
 * controls keep a 44px target; the footer ring switches to the hero ink.
 */
export async function walkKeyboard(page: Page, path: string, theme: Theme, expectedStops?: ReadonlyArray<string>, maxPresses = 90) {
  await openThemed(page, path, theme);
  const stops = await tabSequence(page, maxPresses);

  // header stops, then the page content, then the footer: the shell never interleaves.
  expect(stops.map((stop) => stop.region).join(" ").replace(/(main )+/, "main ")).toMatch(/^(header )*main footer$/);
  const main = stops.filter((stop) => stop.region === "main");
  const expected = expectedStops ?? (await page.evaluate(readTabbableTargets));
  expect(main.map((stop) => stop.target), `${path} tab stops in ${theme}`).toEqual([...expected]);
  expect(rtlOrderViolations(main)).toEqual([]);

  const footer = stops[stops.length - 1];
  for (const stop of [...main, footer]) {
    const label = `${path} "${stop.name}"`;
    expect(stop.name, `${label} needs an accessible name`).not.toBe("");
    expect(stop.focusVisible, `${label} must match :focus-visible`).toBe(true);
    expect(stop.outlineStyle, `${label} outline`).not.toBe("none");
    expect(stop.outlineWidth, `${label} outline width`).toBeGreaterThanOrEqual(2);
    expect(stop.clippedBy, `${label} focus ring must not be clipped`).toBeNull();
    if (stop.outlineContrast !== null) expect(stop.outlineContrast, `${label} focus ring contrast`).toBeGreaterThanOrEqual(3);
  }
  for (const stop of main.filter((candidate) => candidate.controlTarget)) {
    expect(Math.round(stop.box.height), `${path} "${stop.name}" target height`).toBeGreaterThanOrEqual(44);
    expect(Math.round(stop.box.width), `${path} "${stop.name}" target width`).toBeGreaterThanOrEqual(44);
  }
  // The footer is an always-dark brand surface: its focus ring switches to the hero ink.
  expect(footer.inverse).toBe(true);
  const heroInk = await page.evaluate(() => {
    const probe = document.createElement("span");
    probe.style.color = "var(--color-hero-ink)";
    document.body.append(probe);
    const color = getComputedStyle(probe).color;
    probe.remove();
    return color;
  });
  expect(footer.outlineColor).toBe(heroInk);
  return { stops, main, footer };
}

/* ------------------------------------------------------------------------ */
/* Media                                                                    */
/* ------------------------------------------------------------------------ */

/** Images in <main>: load state, frame containment and aspect handling. */
export async function mediaReport(page: Page) {
  const images = page.locator("main img");
  for (const image of await images.all()) await image.scrollIntoViewIfNeeded();
  await expect.poll(() => images.evaluateAll((elements) => elements.every((element) => (element as HTMLImageElement).complete))).toBe(true);
  return images.evaluateAll((elements) => elements.map((element) => {
    const image = element as HTMLImageElement;
    const style = getComputedStyle(image);
    const rect = image.getBoundingClientRect();
    const frameElement = image.parentElement?.tagName === "PICTURE" ? image.parentElement.parentElement : image.parentElement;
    const frame = frameElement?.getBoundingClientRect();
    let clip: DOMRect | null = null;
    for (let ancestor = image.parentElement; ancestor && ancestor.tagName !== "MAIN"; ancestor = ancestor.parentElement) {
      if (getComputedStyle(ancestor).overflowX !== "visible") {
        clip = ancestor.getBoundingClientRect();
        break;
      }
    }
    const inside = (outer: DOMRect | null | undefined) => !outer || (rect.left >= outer.left - 1 && rect.right <= outer.right + 1 && rect.top >= outer.top - 1 && rect.bottom <= outer.bottom + 1);
    return {
      source: (image.currentSrc || image.src).replace(location.origin, ""),
      landing: Boolean(image.closest('section[aria-labelledby="catalog-landing-title"]')),
      naturalWidth: image.naturalWidth,
      naturalHeight: image.naturalHeight,
      width: rect.width,
      height: rect.height,
      objectFit: style.objectFit,
      insideFrame: inside(frame) && inside(clip),
      filter: style.filter,
      opacity: style.opacity,
      blend: style.mixBlendMode,
    };
  }));
}

/**
 * Loaded images sit inside bounded frames, keep their ratio (or crop with
 * cover/contain) and are never recoloured. `allowBroken` names the fixture
 * images that are meant not to load: they only have to stay inside their frame.
 */
export async function expectMediaBounded(page: Page, path: string, { allowBroken = /fixture-missing/ }: { allowBroken?: RegExp } = {}) {
  const report = await mediaReport(page);
  expect(report.length, `${path} renders its media`).toBeGreaterThan(0);
  for (const image of report) {
    const label = `${path} ${image.source}`;
    expect(image.insideFrame, `${label} must stay inside its frame`).toBe(true);
    expect([image.filter, image.opacity, image.blend], `${label} keeps its verified colours`).toEqual(["none", "1", "normal"]);
    if (image.naturalWidth === 0) {
      expect(allowBroken.test(image.source), `${label} must load`).toBe(true);
      continue;
    }
    if (image.objectFit === "fill") {
      const distortion = Math.abs(image.width / image.height - image.naturalWidth / image.naturalHeight) / (image.naturalWidth / image.naturalHeight);
      expect(distortion, `${label} must keep its aspect ratio`).toBeLessThan(0.02);
    } else {
      expect(["cover", "contain"], `${label} object-fit`).toContain(image.objectFit);
    }
  }
  return report;
}

/* ------------------------------------------------------------------------ */
/* Theme roles                                                              */
/* ------------------------------------------------------------------------ */

/** Toranj token values, the body canvas, card colours and every visible text colour in <main>. */
export async function themeReport(page: Page) {
  return page.evaluate(() => {
    const resolve = (value: string) => {
      const probe = document.createElement("span");
      probe.style.color = value;
      document.body.append(probe);
      const color = getComputedStyle(probe).color;
      probe.remove();
      return color;
    };
    const token = (name: string) => resolve(`var(${name})`);
    const tokens = {
      canvas: token("--color-surface-canvas"),
      card: token("--color-surface-card"),
      text: token("--color-text-primary"),
      textSecondary: token("--color-text-secondary"),
      brand: token("--color-brand-primary"),
      action: token("--color-brand-action"),
    };
    // --color-brand-industrial is the text role of the "no image registered" card placeholder (Content.module.css .cardPlaceholder).
    const roles = ["--color-text-primary", "--color-text-secondary", "--color-brand-primary", "--color-brand-action", "--color-brand-industrial", "--color-on-action", "--color-hero-ink", "--color-hero-muted", "--color-status-success", "--color-status-warning", "--color-status-danger", "--color-status-info"].map(token);
    const parse = (value: string) => value.match(/\d+(\.\d+)?/g)?.slice(0, 3).map(Number) ?? [0, 0, 0];
    const luminance = (value: string) => {
      const [r, g, b] = parse(value).map((channel) => {
        const scaled = channel / 255;
        return scaled <= 0.04045 ? scaled / 12.92 : ((scaled + 0.055) / 1.055) ** 2.4;
      });
      return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    };
    const contrast = (a: string, b: string) => {
      const [high, low] = [luminance(a), luminance(b)].sort((x, y) => y - x);
      return (high + 0.05) / (low + 0.05);
    };
    const cards = [...document.querySelectorAll<HTMLElement>('main [role="article"]')].map((card) => {
      const background = getComputedStyle(card).backgroundColor;
      const title = card.querySelector("h2, h3");
      const summary = card.querySelector("p");
      const titleColor = title ? getComputedStyle(title).color : "";
      const summaryColor = summary ? getComputedStyle(summary).color : "";
      return { background, titleColor, summaryColor, titleContrast: contrast(titleColor, background), summaryContrast: summary ? contrast(summaryColor, background) : 21 };
    });
    const unmapped = new Set<string>();
    const walker = document.createTreeWalker(document.querySelector("main") ?? document.body, NodeFilter.SHOW_TEXT);
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      const element = node.parentElement;
      if (!node.textContent?.trim() || !element || element.closest('[aria-hidden="true"], script')) continue;
      const rect = element.getBoundingClientRect();
      if (rect.width < 2 || rect.height < 2) continue;
      const color = getComputedStyle(element).color;
      if (!roles.includes(color)) unmapped.add(`${color} "${node.textContent.trim().slice(0, 24)}"`);
    }
    return {
      tokens,
      body: { background: getComputedStyle(document.body).backgroundColor, color: getComputedStyle(document.body).color },
      canvasLuminance: luminance(tokens.canvas),
      cards,
      unmapped: [...unmapped],
    };
  });
}

/** The canvas and ink roles, readable cards and Toranj-only text colours of the current page. */
export async function expectThemeRoles(page: Page, path: string, theme: Theme) {
  const report = await themeReport(page);
  expect(report.body, `${path} canvas and ink`).toEqual({ background: report.tokens.canvas, color: report.tokens.text });
  if (theme === "dark") expect(report.canvasLuminance).toBeLessThan(0.05);
  else expect(report.canvasLuminance).toBeGreaterThan(0.8);
  for (const card of report.cards) {
    expect(card.background, `${path} card surface`).toBe(report.tokens.card);
    expect(card.titleColor, `${path} card title`).toBe(report.tokens.brand);
    expect(card.summaryColor === "" || card.summaryColor === report.tokens.textSecondary, `${path} card summary uses the secondary text role`).toBe(true);
    expect(card.titleContrast, `${path} card title contrast`).toBeGreaterThanOrEqual(4.5);
    expect(card.summaryContrast, `${path} card summary contrast`).toBeGreaterThanOrEqual(4.5);
  }
  expect(report.unmapped, `${path} text must use Toranj colour roles`).toEqual([]);
}

/* ------------------------------------------------------------------------ */
/* Responsive steps                                                         */
/* ------------------------------------------------------------------------ */

/** Layout facts of one grid of cards at the current width. */
export async function gridStep(page: Page, items: string, container: string) {
  const boxes = await boxesOf(page, items);
  const gap = await page.locator(container).first().evaluate((element) => parseFloat(getComputedStyle(element).rowGap) || 0);
  const containerBox = await boxOf(page, container);
  return {
    boxes,
    container: containerBox,
    columns: columnsOf(boxes),
    rows: rowsOf(boxes),
    tallest: Math.max(...boxes.map((box) => box.height)),
    gap,
    /** The grid's own length (its box height), apart from the rest of the page. */
    grid: containerBox.height,
    /**
     * The site header and footer heights. The footer swaps its link columns for
     * collapsed disclosures at 40rem (task 5.1, covered by public-shell.spec.ts),
     * so a step measured there must not charge that shell change to the page.
     */
    shell: await page.evaluate(() => ["header", "footer"].reduce((sum, tag) => sum + (document.querySelector(tag)?.getBoundingClientRect().height ?? 0), 0)),
    height: await documentHeight(page),
  };
}
export type GridStep = Awaited<ReturnType<typeof gridStep>>;

/**
 * Two measurements one layout threshold apart must describe adjacent
 * compositions. The tolerated ratios:
 * - the column count changes by at most one (never one oversized column to
 *   three compressed ones);
 * - the grid's own length follows its row count: it may differ from
 *   `previous length x (rows above / rows below)` by the card height
 *   tolerance of 1.5x either way, because a card that gives up half its width
 *   gets taller (text wraps more) while its media gets shorter;
 * - the document length, apart from the site header and footer, changes only
 *   by what the grid itself changes, plus `slack` px (two lines of body text)
 *   for reflow elsewhere on the page;
 * - the tallest card changes by less than 1.5x either way.
 */
export function expectBoundedStep(below: GridStep, above: GridStep, context: string, slack = 48) {
  expect(Math.abs(above.columns - below.columns), `${context}: column step`).toBeLessThanOrEqual(1);
  const rowRatio = above.rows / below.rows;
  const gridRatio = above.grid / below.grid;
  expect(gridRatio, `${context}: grid length ratio ${gridRatio.toFixed(2)} after ${below.rows} -> ${above.rows} rows`).toBeGreaterThanOrEqual(rowRatio / 1.5);
  expect(gridRatio, `${context}: grid length ratio ${gridRatio.toFixed(2)} after ${below.rows} -> ${above.rows} rows`).toBeLessThanOrEqual(rowRatio * 1.5);
  const outside = Math.abs(above.height - above.shell - (below.height - below.shell) - (above.grid - below.grid));
  expect(outside, `${context}: the page content length changed ${Math.round(outside)}px more than the grid did`).toBeLessThanOrEqual(slack);
  const cardRatio = below.tallest / above.tallest;
  expect(Math.max(cardRatio, 1 / cardRatio), `${context}: tallest card height jump`).toBeLessThan(1.5);
}

/* ------------------------------------------------------------------------ */
/* Line length                                                              */
/* ------------------------------------------------------------------------ */

/**
 * Characters (spaces included) on each rendered line of every long paragraph
 * in <main>: the text is walked character by character and grouped by the
 * line each glyph sits on, so wrapping, max-width and font metrics are all
 * included. Short paragraphs and the last line of a paragraph are left out.
 */
export async function bodyLineLengths(page: Page, selector = "main p") {
  return page.evaluate((paragraphSelector) => {
    const results: { text: string; lines: number[] }[] = [];
    for (const paragraph of document.querySelectorAll<HTMLElement>(paragraphSelector)) {
      const text = paragraph.textContent ?? "";
      if (text.trim().length < 160 || paragraph.closest('[aria-hidden="true"]')) continue;
      // Characters are visited in logical order, which is line order: a glyph centred more than
      // 0.6 of its own height away from the current line starts the next line.
      const lines: number[] = [];
      let lineCentre = 0;
      const walker = document.createTreeWalker(paragraph, NodeFilter.SHOW_TEXT);
      for (let node = walker.nextNode(); node; node = walker.nextNode()) {
        const value = node.textContent ?? "";
        for (let index = 0; index < value.length; index += 1) {
          const range = document.createRange();
          range.setStart(node, index);
          range.setEnd(node, index + 1);
          const rect = range.getBoundingClientRect();
          if (!rect.height) continue;
          const centre = rect.top + rect.height / 2;
          if (!lines.length || Math.abs(centre - lineCentre) > rect.height * 0.6) {
            lines.push(1);
            lineCentre = centre;
          } else {
            lines[lines.length - 1] += 1;
          }
        }
      }
      results.push({ text: text.trim().slice(0, 30), lines: lines.slice(0, -1) });
    }
    return results;
  }, selector);
}

/* ------------------------------------------------------------------------ */
/* In-browser accessibility audit (axe-core)                                */
/* ------------------------------------------------------------------------ */

/*
 * axe-core is resolved from the jest-axe dependency that the unit tests
 * already use, so no dependency is added: the browser audit runs the same
 * engine, with real layout and colour-contrast checks that jsdom cannot do.
 */
let axeSource: string | null = null;
function loadAxeSource() {
  if (axeSource === null) {
    const fromJestAxe = createRequire(createRequire(__filename).resolve("jest-axe/package.json"));
    axeSource = readFileSync(fromJestAxe.resolve("axe-core/axe.min.js"), "utf8");
  }
  return axeSource;
}

export type AxeViolation = { id: string; impact: string | null; help: string; nodes: { target: string[]; summary: string }[] };

/** Runs axe on the current page, optionally scoped, and returns the serious and critical violations. */
export async function seriousAxeViolations(page: Page, include?: string[]) {
  await page.evaluate(loadAxeSource());
  const violations = await page.evaluate(async (scope) => {
    const axe = (window as unknown as { axe: { run: (context: unknown, options: unknown) => Promise<{ violations: Array<{ id: string; impact: string | null; help: string; nodes: Array<{ target: string[]; failureSummary?: string }> }> }> } }).axe;
    const result = await axe.run(scope ? { include: scope.map((selector) => [selector]) } : document, { resultTypes: ["violations"] });
    return result.violations.map((violation) => ({
      id: violation.id,
      impact: violation.impact,
      help: violation.help,
      nodes: violation.nodes.slice(0, 4).map((node) => ({ target: node.target, summary: (node.failureSummary ?? "").replace(/\s+/g, " ").slice(0, 200) })),
    }));
  }, include ?? null);
  return violations.filter((violation) => violation.impact === "serious" || violation.impact === "critical") as AxeViolation[];
}

/* ------------------------------------------------------------------------ */
/* Runtime errors                                                           */
/* ------------------------------------------------------------------------ */

/**
 * Collects what a visitor's browser would report while the page runs:
 * uncaught exceptions, console errors, failed requests and HTTP errors. The
 * mock serves intentionally missing images (`fixture-missing-*`, HTTP 404),
 * and the browser logs each as a console error without naming the file in the
 * text, so those are matched by the message location and the request URL.
 * Aborted requests (a navigation cancelling a prefetch) are not errors.
 */
export function watchRuntime(page: Page, { allowMissing = /fixture-missing/ }: { allowMissing?: RegExp } = {}) {
  const problems: string[] = [];
  page.on("pageerror", (error) => problems.push(`pageerror: ${error.message.slice(0, 200)}`));
  page.on("console", (message) => {
    if (message.type() !== "error" || allowMissing.test(message.location().url)) return;
    problems.push(`console: ${message.text().slice(0, 200)}`);
  });
  page.on("requestfailed", (request) => {
    if (request.failure()?.errorText === "net::ERR_ABORTED" || allowMissing.test(request.url())) return;
    problems.push(`requestfailed: ${request.url()} ${request.failure()?.errorText ?? ""}`);
  });
  page.on("response", (response) => {
    if (response.status() >= 400 && !allowMissing.test(response.url())) problems.push(`http ${response.status()}: ${response.url()}`);
  });
  return () => problems;
}

/* ------------------------------------------------------------------------ */
/* Containment                                                              */
/* ------------------------------------------------------------------------ */

/**
 * Where the rendered text of an element sits relative to the element's own
 * box. The text fragments are measured, wrapped lines included, even where
 * the element clips them, so a label cut by an ellipsis or by an overflow
 * clip reports its full width and a negative margin. `inside` is false when
 * the text passes the box by more than 1px along the line, or by more than a
 * quarter of the font size across it. `lines` counts the rendered lines
 * (fragments merged within 4px). Hidden (aria-hidden) text is ignored.
 */
export async function textInsideBox(locator: Locator) {
  return locator.evaluate((element) => {
    const box = element.getBoundingClientRect();
    // Only the text fragments count: a range over the element also reports the boxes of the elements inside it.
    const rects: DOMRect[] = [];
    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      if (!node.textContent?.trim() || node.parentElement?.closest('[aria-hidden="true"]')) continue;
      const range = document.createRange();
      range.selectNodeContents(node);
      for (const rect of range.getClientRects()) if (rect.width > 0 && rect.height > 0) rects.push(rect);
    }
    const tops: number[] = [];
    for (const rect of rects) if (!tops.some((top) => Math.abs(top - rect.top) < 4)) tops.push(rect.top);
    const left = Math.min(...rects.map((rect) => rect.left));
    const right = Math.max(...rects.map((rect) => rect.right));
    const top = Math.min(...rects.map((rect) => rect.top));
    const bottom = Math.max(...rects.map((rect) => rect.bottom));
    const margins = { start: box.right - right, end: left - box.left, top: top - box.top, bottom: box.bottom - bottom };
    // A text fragment is as tall as the font's content area, which overshoots a tight line box by up to a fifth of the font size without clipping any glyph.
    const overshoot = 0.25 * (parseFloat(getComputedStyle(element).fontSize) || 16);
    const inside = rects.length > 0 && margins.start >= -1 && margins.end >= -1 && margins.top >= -overshoot && margins.bottom >= -overshoot;
    return { ...margins, inside, lines: tops.length, box: { width: box.width, height: box.height } };
  });
}

/** Asserts that the whole rendered text of the element is visible inside its box; returns the measurement. */
export async function expectTextInside(locator: Locator, message: string) {
  const fit = await textInsideBox(locator);
  const margins = `start ${Math.round(fit.start)}px, end ${Math.round(fit.end)}px, top ${Math.round(fit.top)}px, bottom ${Math.round(fit.bottom)}px`;
  expect(fit.inside, `${message} (text margins inside the box: ${margins})`).toBe(true);
  return fit;
}

/** `inner` lies inside `outer` (one pixel of rounding allowed). */
export const insideBox = (inner: Box, outer: Box, slack = 1) => inner.left >= outer.left - slack && inner.right <= outer.right + slack && inner.top >= outer.top - slack && inner.bottom <= outer.bottom + slack;

/** Presses Tab from the document start until the focused element matches the selector; returns the presses used. */
export async function tabTo(page: Page, selector: string, maxPresses = 120) {
  for (let press = 1; press <= maxPresses; press += 1) {
    await page.keyboard.press("Tab");
    if (await page.evaluate((query) => document.activeElement?.matches(query) ?? false, selector)) return press;
  }
  throw new Error(`Tab never reached ${selector} within ${maxPresses} presses`);
}
