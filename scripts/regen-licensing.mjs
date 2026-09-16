#!/usr/bin/env node
// SPDX-License-Identifier: Elastic-2.0
// Copyright 2026 Zero Root AI

/**
 * regen-licensing.mjs  (pnpm regen:licensing)
 *
 * The one command a maintainer runs to refresh the Licensing page end-to-end:
 *
 *   1. Read the LICENSE file of every repository in src/generated/licenses.json
 *      straight from GitHub, and write the SPDX id it finds into the spec.
 *   2. Render the table on src/content/docs/security/licensing.mdx from the
 *      spec.
 *
 * So the page states what the LICENSE files state. Nobody types a license into
 * the page by hand.
 *
 * It needs an authenticated `gh`. CI does NOT run it. CI runs `pnpm
 * check:docs`, whose check-licensing-fresh gate re-renders from the committed
 * spec and fails on drift. That split is the same one regen:cli uses: the
 * build stays offline and reproducible, and one maintainer command refreshes
 * the source of truth.
 *
 * Run it when a repository relicenses, and when a repository joins or leaves
 * the table.
 */

import { execFileSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import { applyLicenseTable, loadSpec, loadPage, SPEC_PATH, PAGE_PATH } from "./gen-licensing.mjs";

/**
 * Read the SPDX id out of the text of a LICENSE file. Ordered most specific
 * first: the Elastic and Business Source texts both name themselves on their
 * first line, while the Apache and MIT texts carry a long preamble.
 */
export function spdxOf(text) {
  const t = text.replace(/\s+/g, " ");
  if (/Elastic License 2\.0/i.test(t)) return "Elastic-2.0";
  if (/Business Source License 1\.1/i.test(t)) return "BUSL-1.1";
  if (/Apache License, ?Version 2\.0/i.test(t) || /Apache License Version 2\.0/i.test(t)) {
    return "Apache-2.0";
  }
  if (/MIT License/i.test(t) && /THE SOFTWARE IS PROVIDED "AS IS"/i.test(t)) return "MIT";
  return null;
}

function fetchLicense(org, name) {
  const b64 = execFileSync(
    "gh",
    ["api", `repos/${org}/${name}/contents/LICENSE`, "--jq", ".content"],
    { encoding: "utf8", maxBuffer: 8 * 1024 * 1024 },
  );
  return Buffer.from(b64, "base64").toString("utf8");
}

const spec = loadSpec();
let changed = 0;

for (const repo of spec.repos) {
  const spdx = spdxOf(fetchLicense(spec.org, repo.name));
  if (!spdx) {
    throw new Error(
      `regen:licensing: ${spec.org}/${repo.name} has a LICENSE this script does not recognize. ` +
        `Teach spdxOf() to read it before the page claims anything about that repository.`,
    );
  }
  if (spdx !== repo.spdx) {
    console.log(`regen:licensing: ${repo.name}: ${repo.spdx} -> ${spdx}`);
    repo.spdx = spdx;
    changed++;
  }
}

writeFileSync(SPEC_PATH, `${JSON.stringify(spec, null, 2)}\n`);
writeFileSync(PAGE_PATH, applyLicenseTable(loadPage(), spec));
console.log(
  `regen:licensing: read ${spec.repos.length} LICENSE files, ${changed} changed. Wrote ${PAGE_PATH}`,
);
