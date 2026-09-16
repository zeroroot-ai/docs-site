#!/usr/bin/env node
// SPDX-License-Identifier: Elastic-2.0
// Copyright 2026 Zero Root AI

/**
 * check-licensing-fresh.mjs
 *
 * Build-time drift gate for the license map on the Licensing page. The table
 * on src/content/docs/security/licensing.mdx is rendered from the committed
 * spec src/generated/licenses.json by gen-licensing.mjs. The spec holds the
 * SPDX id read from each repository's LICENSE file.
 *
 * Two ways the page goes wrong, and this gate catches both:
 *   1. Someone hand-edits a license in the table. The re-render disagrees.
 *   2. Someone refreshes the spec and forgets to render the page. Same.
 *
 * A repository that relicenses is caught one step earlier, by
 * `pnpm regen:licensing`, which re-reads the LICENSE files themselves.
 *
 * Wired into `pnpm check:docs`, so it runs on every docs build in CI.
 *
 * Usage:
 *   node scripts/check-licensing-fresh.mjs            # gate
 *   node scripts/check-licensing-fresh.mjs --selftest # verify the gate fires
 */

import { applyLicenseTable, loadSpec, loadPage, BEGIN, END } from "./gen-licensing.mjs";

// --selftest: a guard that cannot fail is worse than no guard. Each case
// mutates a good input into a bad one and demands that the gate notice.
if (process.argv.includes("--selftest")) {
  const spec = loadSpec();
  const page = loadPage();
  const fail = (why) => {
    process.stderr.write(`\n❌ check-licensing-fresh.mjs selftest: ${why}\n`);
    process.exit(1);
  };

  // 1. A hand-edited license cell must not survive a re-render.
  const tampered = page.replace("Elastic License 2.0 |", "MIT |");
  if (tampered === page) fail("the fixture found no Elastic License 2.0 row to tamper with.");
  if (applyLicenseTable(tampered, spec) === tampered) {
    fail("a hand-edited license cell re-rendered unchanged.");
  }

  // 2. An SPDX id the page has no wording for must stop the generator.
  const unknown = { ...spec, repos: [{ ...spec.repos[0], spdx: "WTFPL" }] };
  try {
    applyLicenseTable(page, unknown);
    fail("an unknown SPDX id rendered instead of throwing.");
  } catch (e) {
    if (!/no wording for/.test(e.message)) fail(`unknown SPDX id threw the wrong error: ${e.message}`);
  }

  // 3. A page whose markers were deleted must stop the generator.
  try {
    applyLicenseTable(page.replace(BEGIN, "").replace(END, ""), spec);
    fail("a page with no markers rendered instead of throwing.");
  } catch (e) {
    if (!/markers/.test(e.message)) fail(`a missing marker threw the wrong error: ${e.message}`);
  }

  console.log("check-licensing-fresh.mjs: selftest OK, the gate fires on all three fixtures.");
  process.exit(0);
}

let committed;
try {
  committed = loadPage();
} catch {
  process.stderr.write(
    "\n❌ src/content/docs/security/licensing.mdx is missing.\n" +
      "Restore it, then run `pnpm gen:licensing`.\n",
  );
  process.exit(1);
}

const expected = applyLicenseTable(committed, loadSpec());

if (expected === committed) {
  console.log("check-licensing-fresh.mjs: OK, licensing.mdx is in sync with licenses.json.");
  process.exit(0);
}

process.stderr.write(
  "\n❌ The license table in src/content/docs/security/licensing.mdx is stale relative to\n" +
    "src/generated/licenses.json. The page states a license the spec does not.\n\n",
);
process.stderr.write("Regenerate and commit:\n  pnpm gen:licensing\n\n");

const a = expected.split("\n");
const b = committed.split("\n");
for (let i = 0; i < Math.max(a.length, b.length); i++) {
  if (a[i] !== b[i]) {
    process.stderr.write(`First difference at line ${i + 1}:\n`);
    process.stderr.write(`  expected: ${JSON.stringify(a[i] ?? "<eof>")}\n`);
    process.stderr.write(`  committed: ${JSON.stringify(b[i] ?? "<eof>")}\n`);
    break;
  }
}
process.exit(1);
