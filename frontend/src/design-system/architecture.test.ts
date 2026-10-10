import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, resolve } from "node:path";
import { describe, expect, it } from "vitest";

const srcRoot = resolve(process.cwd(), "src");

function codeFiles(directory: string): string[] {
  return readdirSync(directory).flatMap((entry) => {
    const path = join(directory, entry);
    return statSync(path).isDirectory() ? codeFiles(path) : /\.(ts|tsx)$/.test(entry) ? [path] : [];
  });
}

describe("design-system boundaries", () => {
  it("exposes required semantic tokens and reduced-motion defaults", () => {
    const tokens = readFileSync(join(srcRoot, "design-system", "tokens.css"), "utf8");
    const globals = readFileSync(join(srcRoot, "app", "globals.css"), "utf8");
    for (const token of ["--control-min-height", "--focus-ring", "--motion-normal", "--shadow-md", "--content-gutter"]) {
      expect(tokens).toContain(token);
    }
    expect(globals).toContain("prefers-reduced-motion");
    expect(globals).toContain("unicode-bidi: isolate");
  });

  it("keeps shared component layers free of app and backend imports", () => {
    const files = codeFiles(join(srcRoot, "components"));
    for (const file of files) {
      const source = readFileSync(file, "utf8");
      expect(source).not.toMatch(/from ["']@\/app/);
      expect(source).not.toMatch(/backend|\/api\/v1/);
    }
  });
});
