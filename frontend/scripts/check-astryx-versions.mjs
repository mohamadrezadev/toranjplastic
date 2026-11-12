import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const packageJsonPath = fileURLToPath(new URL("../package.json", import.meta.url));
const packageJson = JSON.parse(await readFile(packageJsonPath, "utf8"));
const dependencyGroups = [packageJson.dependencies ?? {}, packageJson.devDependencies ?? {}];
const astryxPackages = Object.fromEntries(
  dependencyGroups.flatMap((group) =>
    Object.entries(group).filter(([name]) => name.startsWith("@astryxdesign/")),
  ),
);

const requiredPackages = [
  "@astryxdesign/core",
  "@astryxdesign/theme-neutral",
  "@astryxdesign/cli",
];
const missingPackages = requiredPackages.filter((name) => !(name in astryxPackages));

if (missingPackages.length > 0) {
  throw new Error(`Missing required Astryx packages: ${missingPackages.join(", ")}`);
}

const nonExactVersions = Object.entries(astryxPackages).filter(
  ([, version]) => !/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/.test(version),
);

if (nonExactVersions.length > 0) {
  throw new Error(
    `Astryx packages must use exact versions: ${nonExactVersions
      .map(([name, version]) => `${name}@${version}`)
      .join(", ")}`,
  );
}

const versions = new Set(Object.values(astryxPackages));

if (versions.size !== 1) {
  throw new Error(
    `Astryx package versions must match: ${Object.entries(astryxPackages)
      .map(([name, version]) => `${name}@${version}`)
      .join(", ")}`,
  );
}

console.log(
  `Astryx package alignment verified: ${Object.keys(astryxPackages).length} packages at ${[...versions][0]}.`,
);
