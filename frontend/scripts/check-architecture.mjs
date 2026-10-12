import { readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, extname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = dirname(fileURLToPath(import.meta.url));
export const frontendRoot = resolve(scriptDir, '..');
export const sourceRoot = join(frontendRoot, 'src');
export const featureRoot = join(sourceRoot, 'features', 'admin-content');

const sourceExtensions = ['.ts', '.tsx', '.js', '.jsx', '.mjs'];
const importPattern = /(?:import|export)\s+(?:[\s\S]*?\s+from\s*)?["']([^"']+)["']|import\(\s*["']([^"']+)["']\s*\)/g;

function codeFiles(directory) {
  if (!statSync(directory).isDirectory()) return [];
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? codeFiles(path) : sourceExtensions.includes(extname(entry.name)) ? [path] : [];
  });
}

function importSpecifiers(source) {
  return [...source.matchAll(importPattern)].map((match) => match[1] ?? match[2]);
}

function resolveImport(importer, specifier) {
  if (specifier.startsWith('@/')) return resolve(sourceRoot, specifier.slice(2));
  if (specifier.startsWith('.')) return resolve(dirname(importer), specifier);
  return null;
}

function resolveSourceFile(path) {
  for (const extension of sourceExtensions) {
    if (statSync(`${path}${extension}`, { throwIfNoEntry: false })?.isFile()) return `${path}${extension}`;
  }
  for (const extension of sourceExtensions) {
    const indexPath = join(path, `index${extension}`);
    if (statSync(indexPath, { throwIfNoEntry: false })?.isFile()) return indexPath;
  }
  return path;
}

function featureFor(path) {
  const normalizedRoot = `${featureRoot}${sep}`;
  if (!path.startsWith(normalizedRoot)) return null;
  const feature = path.slice(normalizedRoot.length).split(sep)[0] ?? null;
  return feature === 'shared' ? null : feature;
}

export function inspectSources(sources) {
  const violations = [];
  const graph = new Map();
  for (const [file, source] of Object.entries(sources)) {
    const importer = resolve(file);
    const fromFeature = featureFor(importer);
    if (fromFeature) graph.set(fromFeature, graph.get(fromFeature) ?? new Set());
    for (const specifier of importSpecifiers(source)) {
      if (specifier === 'backend' || specifier.startsWith('backend/') || specifier.includes('/backend/')) {
        violations.push(`frontend imports backend source: ${relative(frontendRoot, importer)} -> ${specifier}`);
        continue;
      }
      const target = resolveImport(importer, specifier);
      if (!target) continue;
      const resolvedTarget = resolveSourceFile(target);
      if (relative(sourceRoot, resolvedTarget).split(sep).includes('backend')) {
        violations.push(`frontend imports backend source: ${relative(frontendRoot, importer)} -> ${specifier}`);
        continue;
      }
      const toFeature = featureFor(resolvedTarget);
      if (!fromFeature || !toFeature || fromFeature === toFeature) continue;
      const publicEntry = resolveSourceFile(join(featureRoot, toFeature, 'index'));
      const publicSpecifier = new RegExp(`(?:^|/)features/admin-content/${toFeature}/?(?:index)?$`).test(specifier);
      if (resolvedTarget !== publicEntry && !publicSpecifier) {
        violations.push(`admin-content feature deep import: ${fromFeature} -> ${toFeature} (${specifier})`);
      } else {
        graph.get(fromFeature).add(toFeature);
      }
    }
  }

  const visiting = new Set();
  const visited = new Set();
  function visit(node, path) {
    if (visiting.has(node)) {
      violations.push(`admin-content feature cycle: ${[...path, node].join(' -> ')}`);
      return;
    }
    if (visited.has(node)) return;
    visiting.add(node);
    for (const next of graph.get(node) ?? []) visit(next, [...path, node]);
    visiting.delete(node);
    visited.add(node);
  }
  for (const node of graph.keys()) visit(node, []);
  return [...new Set(violations)];
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const files = codeFiles(sourceRoot);
  const sources = Object.fromEntries(files.map((file) => [file, readFileSync(file, 'utf8')]));
  const violations = inspectSources(sources);
  if (violations.length) {
    console.error(violations.join('\n'));
    process.exitCode = 1;
  } else {
    console.log(`Architecture boundaries passed (${files.length} source files checked).`);
  }
}
