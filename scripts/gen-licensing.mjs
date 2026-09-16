#!/usr/bin/env node
// SPDX-License-Identifier: Elastic-2.0
// Copyright 2026 Zero Root AI

/**
 * gen-licensing.mjs
 *
 * Renders the license map on src/content/docs/security/licensing.mdx from the
 * machine-readable spec src/generated/licenses.json. The spec records the SPDX
 * id read from each repository's own LICENSE file, so the page restates the
 * LICENSE files instead of asserting a license from memory.
 *
 * The page is prose plus one generated table, so this generator rewrites only
 * the region between the BEGIN and END markers. The prose around it stays
 * hand-written MDX.
 *
 * `applyLicenseTable(page, spec)` is exported pure (page and spec in, page
 * string out) so the drift gate (check-licensing-fresh.mjs) renders with the
 * exact same code and byte-compares against the committed page.
 *
 * Run directly to (re)write the page:
 *   node scripts/gen-licensing.mjs
 *
 * Refresh the spec itself from the LICENSE files on GitHub:
 *   pnpm regen:licensing        (needs an authenticated `gh`)
 */

import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
export const SPEC_PATH = join(ROOT, "src", "generated", "licenses.json");
export const PAGE_PATH = join(ROOT, "src", "content", "docs", "security", "licensing.mdx");

export const BEGIN =
  "{/* BEGIN GENERATED LICENSE TABLE. Rendered from src/generated/licenses.json " +
  "by scripts/gen-licensing.mjs. Run `pnpm regen:licensing`, never hand-edit. */}";
export const END = "{/* END GENERATED LICENSE TABLE */}";

/**
 * How each SPDX id reads in the table. An id that is not here is a license the
 * page has never described, so the generator stops rather than print a guess.
 */
export const DISPLAY = {
  "Apache-2.0": "Apache-2.0",
  MIT: "MIT",
  "Elastic-2.0": "Elastic License 2.0",
  "BUSL-1.1": "Business Source License 1.1",
};

/** Prepare a value for a Markdown table cell. The pipe would start a column. */
function cell(s) {
  return s.replace(/\|/g, "\\|");
}

export function renderLicenseTable(spec) {
  const out = [BEGIN, "", "| Repository | License | What it is |", "|---|---|---|"];
  for (const r of spec.repos) {
    const display = DISPLAY[r.spdx];
    if (!display) {
      throw new Error(
        `gen-licensing.mjs: ${r.name} carries SPDX id "${r.spdx}", which the page has no wording for. ` +
          `Add it to DISPLAY in scripts/gen-licensing.mjs and say what it means in the prose.`,
      );
    }
    const url = `https://github.com/${spec.org}/${r.name}`;
    out.push(`| [\`${r.name}\`](${url}) | ${display} | ${cell(r.what)} |`);
  }
  out.push("", END);
  return out.join("\n");
}

export function applyLicenseTable(page, spec) {
  const start = page.indexOf(BEGIN);
  const end = page.indexOf(END);
  if (start === -1 || end === -1 || end < start) {
    throw new Error(
      `gen-licensing.mjs: ${PAGE_PATH} has no BEGIN/END GENERATED LICENSE TABLE markers. ` +
        `Restore them around the table.`,
    );
  }
  return page.slice(0, start) + renderLicenseTable(spec) + page.slice(end + END.length);
}

export function loadSpec() {
  return JSON.parse(readFileSync(SPEC_PATH, "utf8"));
}

export function loadPage() {
  return readFileSync(PAGE_PATH, "utf8");
}

// Run directly: (re)write the generated region of the page.
if (import.meta.url === `file://${process.argv[1]}`) {
  writeFileSync(PAGE_PATH, applyLicenseTable(loadPage(), loadSpec()));
  console.log(`gen-licensing.mjs: wrote the license table into ${PAGE_PATH}`);
}
