#!/usr/bin/env node
/**
 * check-cli-reference-fresh.mjs
 *
 * Build-time drift gate for the auto-generated CLI reference. The reference
 * page (src/content/docs/cli-reference.mdx) is rendered from the committed
 * command-tree spec (src/generated/cli-spec.json) by gen-cli-reference.mjs. If
 * someone hand-edits the page, or updates the spec without regenerating, the
 * two fall out of sync and the reference silently rots.
 *
 * This gate re-runs the exact generator over the committed spec and
 * byte-compares the result against the committed page. Any difference fails
 * the build with a one-command fix. It is the CLI-reference analogue of
 * check-docs-allowlist-fresh.mjs (regenerate → byte-compare → fail on drift).
 *
 * Wired into `pnpm check:docs`, so it runs on every docs build in CI.
 */

import { readFileSync } from "node:fs";
import { renderCliReference, loadSpec, PAGE_PATH } from "./gen-cli-reference.mjs";

let committed;
try {
  committed = readFileSync(PAGE_PATH, "utf8");
} catch {
  process.stderr.write(
    "\n❌ src/content/docs/cli-reference.mdx is missing.\n" +
      "Run `pnpm regen:cli` (or `node scripts/gen-cli-reference.mjs`) and commit it.\n",
  );
  process.exit(1);
}

const expected = renderCliReference(loadSpec());

if (expected === committed) {
  console.log("check-cli-reference-fresh.mjs: OK, cli-reference.mdx is in sync with cli-spec.json.");
  process.exit(0);
}

process.stderr.write(
  "\n❌ src/content/docs/cli-reference.mdx is stale relative to src/generated/cli-spec.json.\n\n",
);
process.stderr.write("Regenerate and commit:\n  pnpm regen:cli\n\n");

// Show the first differing line to make the drift obvious in CI logs.
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
