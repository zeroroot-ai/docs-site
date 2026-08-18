#!/usr/bin/env node
/**
 * check-static-export-standalone.mjs
 *
 * Build-time guard: the exported site in `out/` must serve correctly on a
 * PLAIN static host, with no per-host rewrite rules.
 *
 * The defect this exists to keep fixed: a Next catch-all route exports as a
 * sibling file (`out/docs.html`), while the `out/docs/` directory that also
 * appears holds only RSC payload chunks and carries no `index.html`. Every
 * static host resolves a request for `/docs/` against that index-less
 * directory. S3 and CloudFront return 404; nginx 403s on it before it ever
 * tries `docs.html`.
 *
 * The site used to compensate in `nginx.conf` with a regex location that
 * stripped the trailing slash and retried `$base.html`. That made the
 * container the only place the export worked — the identical bytes on object
 * storage were broken, and nothing failed until a human loaded the page.
 * `trailingSlash: true` in next.config.mjs emits `out/docs/index.html`
 * instead, which needs no host rules at all. This guard asserts that stays
 * true, so the compensating rules can never quietly come back.
 *
 * Two assertions, both against the real `out/` tree:
 *
 *   1. `out/index.html` exists. Without it the site root is a 404 or a
 *      directory listing. It comes from `public/index.html`, which redirects
 *      to /docs/ as a real HTTP-servable file rather than a runtime redirect
 *      an export cannot perform.
 *
 *   2. Every sibling `<route>.html` whose `<route>/` directory also exists
 *      has a matching `<route>/index.html`. This is the trailing-slash
 *      defect stated exactly.
 *
 * Modes:
 *
 *   (default)    Scan `out/`; fail on any violation.
 *   --selftest   Synthesise both a broken tree (sibling .html + index-less
 *                directory, i.e. the pre-fix shape) and a good tree; assert
 *                the scanner rejects the first and accepts the second.
 *                A guard that cannot fail is worse than no guard.
 *
 * Exit codes: 0 clean, 1 violations found (or selftest failure).
 */

import { existsSync, mkdirSync, mkdtempSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';

const ROOT = join(fileURLToPath(new URL('.', import.meta.url)), '..');

/** Directories that hold build assets, never routes. */
const NON_ROUTE_DIRS = new Set(['_next']);

/**
 * Collect every violation in an exported tree.
 *
 * @param {string} outDir the export root (normally `out/`)
 * @returns {string[]} human-readable violations, empty when clean
 */
function scan(outDir) {
  const violations = [];

  if (!existsSync(join(outDir, 'index.html'))) {
    violations.push(
      'out/index.html is missing — the site root would 404. It is emitted from public/index.html.',
    );
  }

  /** @param {string} dir absolute directory to walk */
  function walk(dir) {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue;
      if (NON_ROUTE_DIRS.has(entry.name)) continue;

      const child = join(dir, entry.name);
      const siblingHtml = `${child}.html`;

      // The defect shape: `<route>.html` next to an index-less `<route>/`.
      if (existsSync(siblingHtml) && !existsSync(join(child, 'index.html'))) {
        const route = `/${relative(outDir, child)}/`.replace(/\\/g, '/');
        violations.push(
          `${route} would 404 on a plain static host: ` +
            `${relative(outDir, siblingHtml)} exists but ${relative(outDir, child)}/index.html does not. ` +
            'Set trailingSlash: true in next.config.mjs — do not add a rewrite rule to the host.',
        );
      }

      walk(child);
    }
  }

  walk(outDir);
  return violations;
}

/** Build a throwaway tree in the shape the guard must reject, then one it must accept. */
function selftest() {
  const dir = mkdtempSync(join(tmpdir(), 'export-guard-'));
  let failures = 0;

  try {
    // --- fixture 1: the pre-fix shape. MUST be rejected. -------------------
    const broken = join(dir, 'broken');
    mkdirSync(join(broken, 'docs'), { recursive: true });
    writeFileSync(join(broken, 'index.html'), '<!doctype html>');
    writeFileSync(join(broken, 'docs.html'), '<!doctype html>');
    // `docs/` holds only a payload chunk, exactly as Next emits it.
    writeFileSync(join(broken, 'docs', 'page.rsc'), 'payload');

    const brokenViolations = scan(broken);
    if (brokenViolations.length === 0) {
      console.error('selftest FAIL: the scanner accepted an index-less route directory.');
      failures += 1;
    }

    // --- fixture 2: a missing root index. MUST be rejected. ----------------
    const noRoot = join(dir, 'no-root');
    mkdirSync(noRoot, { recursive: true });
    if (scan(noRoot).length === 0) {
      console.error('selftest FAIL: the scanner accepted a tree with no index.html.');
      failures += 1;
    }

    // --- fixture 3: the fixed shape. MUST be accepted. ---------------------
    const good = join(dir, 'good');
    mkdirSync(join(good, 'docs', 'install'), { recursive: true });
    mkdirSync(join(good, '_next', 'static'), { recursive: true });
    writeFileSync(join(good, 'index.html'), '<!doctype html>');
    writeFileSync(join(good, 'docs.html'), '<!doctype html>');
    writeFileSync(join(good, 'docs', 'index.html'), '<!doctype html>');
    writeFileSync(join(good, 'docs', 'install', 'index.html'), '<!doctype html>');
    writeFileSync(join(good, '_next', 'static', 'chunk.js'), '//');

    const goodViolations = scan(good);
    if (goodViolations.length > 0) {
      console.error('selftest FAIL: the scanner rejected a correct tree:');
      for (const v of goodViolations) console.error(`  - ${v}`);
      failures += 1;
    }
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }

  if (failures > 0) {
    console.error(`check-static-export-standalone: selftest FAILED (${failures}).`);
    process.exit(1);
  }
  console.log('check-static-export-standalone: selftest OK (3 fixtures).');
}

function main() {
  if (process.argv.includes('--selftest')) {
    selftest();
    return;
  }

  const outDir = join(ROOT, 'out');
  if (!existsSync(outDir)) {
    console.error('check-static-export-standalone: out/ does not exist. Run `next build` first.');
    process.exit(1);
  }

  const violations = scan(outDir);
  if (violations.length > 0) {
    console.error('check-static-export-standalone: the export needs host-specific rules to work.\n');
    for (const v of violations) console.error(`  - ${v}`);
    console.error('');
    process.exit(1);
  }

  console.log('check-static-export-standalone: OK, out/ serves on a plain static host.');
}

main();
