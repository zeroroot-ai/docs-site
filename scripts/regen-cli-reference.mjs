#!/usr/bin/env node
/**
 * regen-cli-reference.mjs  (pnpm regen:cli)
 *
 * The one command a maintainer runs to refresh the CLI reference end-to-end:
 *
 *   1. Re-emit the command-tree spec from the adk CLI itself
 *      (`gibson docs cli`), when an adk checkout is reachable, so the spec
 *      tracks the real command surface. Skipped with a clear note when adk or
 *      the Go toolchain is absent (e.g. in docs CI, which only re-renders and
 *      gates the committed spec).
 *   2. Render src/content/docs/cli-reference.mdx from the spec.
 *
 * Point at a specific adk checkout with ADK_GIBSON_DIR=/path/to/adk/gibson.
 *
 * CI does NOT run this. CI runs `pnpm check:docs`, whose
 * check-cli-reference-fresh gate re-renders from the committed spec and fails
 * on drift. That split keeps generation reproducible without a Go toolchain in
 * the docs image, while `regen:cli` gives maintainers a single refresh command.
 */

import { execFileSync } from "node:child_process";
import { existsSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { renderCliReference, loadSpec, SPEC_PATH, PAGE_PATH } from "./gen-cli-reference.mjs";

const ROOT = fileURLToPath(new URL("..", import.meta.url));

function hasGo() {
  try {
    execFileSync("go", ["version"], { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

function findAdkGibsonDir() {
  const candidates = [
    process.env.ADK_GIBSON_DIR,
    join(ROOT, "..", "adk", "gibson"),
    join(ROOT, "..", "..", "opensource", "adk", "gibson"),
  ].filter(Boolean);
  for (const c of candidates) {
    if (existsSync(join(c, "cmd", "gibson"))) return c;
  }
  return null;
}

function refreshSpec() {
  const adk = findAdkGibsonDir();
  if (!adk) {
    console.log(
      "regen:cli: no adk checkout found (set ADK_GIBSON_DIR to refresh the spec); " +
        "rendering from the committed src/generated/cli-spec.json.",
    );
    return;
  }
  if (!hasGo()) {
    console.log("regen:cli: Go toolchain not found; rendering from the committed spec.");
    return;
  }
  console.log(`regen:cli: refreshing cli-spec.json from ${adk} (go run ./cmd/gibson docs cli)`);
  const json = execFileSync("go", ["run", "./cmd/gibson", "docs", "cli"], {
    cwd: adk,
    encoding: "utf8",
    maxBuffer: 16 * 1024 * 1024,
  });
  // Validate BEFORE writing. An adk checkout predating the `docs cli`
  // subcommand answers with cobra's help text on stdout and exit 0, which the
  // old unconditional write clobbered the committed spec with — corrupting a
  // maintainer's working tree (and, once spec-sync automated this, any CI
  // checkout) before loadSpec() got the chance to complain.
  try {
    JSON.parse(json);
  } catch {
    throw new Error(
      `regen:cli: \`gibson docs cli\` in ${adk} did not emit JSON — the committed spec was left untouched.\n` +
        `That ref probably predates the \`docs cli\` subcommand. First 200 bytes of what it printed:\n` +
        json.slice(0, 200),
    );
  }
  writeFileSync(SPEC_PATH, json);
}

refreshSpec();
writeFileSync(PAGE_PATH, renderCliReference(loadSpec()));
console.log(`regen:cli: wrote ${PAGE_PATH}`);
