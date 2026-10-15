import { readdir, readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const adminRoot = dirname(fileURLToPath(import.meta.url));

async function findPageFiles(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(entries.map(async (entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return findPageFiles(path);
    return entry.name === "page.tsx" ? [path] : [];
  }));
  return files.flat();
}

describe("admin route configuration", () => {
  it("opts every private admin page out of cookie-less instant validation", async () => {
    const pages = await findPageFiles(adminRoot);
    const missing = [] as string[];

    for (const page of pages) {
      const source = await readFile(page, "utf8");
      if (!source.includes("export const instant = false;")) missing.push(page);
    }

    expect(pages.length).toBeGreaterThan(0);
    expect(missing).toEqual([]);
  });
});
