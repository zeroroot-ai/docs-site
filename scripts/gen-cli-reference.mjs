#!/usr/bin/env node
/**
 * gen-cli-reference.mjs
 *
 * Renders the customer-facing CLI reference page
 * (src/content/docs/cli-reference.mdx) from the machine-readable command-tree
 * spec (src/generated/cli-spec.json) emitted by `gibson docs cli` in the adk
 * repo. The reference is generated so it stays in lockstep with the CLI while
 * the surrounding guides stay hand-written MDX (dashboard#821 / E13).
 *
 * This script is the single generator. `renderCliReference(spec)` is exported
 * pure (spec in, MDX string out) so the drift gate
 * (check-cli-reference-fresh.mjs) renders with the exact same code and
 * byte-compares against the committed page — the committed output can never
 * silently rot.
 *
 * Run directly to (re)write the page:
 *   node scripts/gen-cli-reference.mjs
 *
 * Refresh the spec itself from the CLI first (needs an adk checkout):
 *   (cd ../adk/gibson && go run ./cmd/gibson docs cli) > src/generated/cli-spec.json
 * or, from this repo: `pnpm regen:cli`.
 *
 * MDX safety: CLI help text contains `<kind>`, `{`, `|` and backticks that
 * would otherwise be parsed as JSX/expressions or break Markdown tables.
 * Multi-line help (long/example) is emitted inside ```text fences (verbatim,
 * never parsed); inline text and table cells are escaped.
 */

import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
export const SPEC_PATH = join(ROOT, "src", "generated", "cli-spec.json");
export const PAGE_PATH = join(ROOT, "src", "content", "docs", "cli-reference.mdx");

// escapeInline neutralises the characters MDX treats specially outside a code
// span, for text emitted as prose: `<` (JSX open) and `{` (expression open),
// via HTML entities. The entity-introducer `&` is escaped FIRST so the scheme
// is complete — a literal `&lt;` in the input becomes `&amp;lt;`, not a stray
// entity (js/incomplete-sanitization).
function escapeInline(s) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/\{/g, "&#123;");
}

// escapeCell prepares a value for a Markdown table cell. It collapses newlines,
// then applies the Markdown-level escapes (backslash FIRST — the escape
// character itself — then the pipe that would otherwise start a new column),
// then the MDX/HTML escapes via escapeInline. Applied to flag usage strings,
// which contain `a | b | c` unions.
function escapeCell(s) {
  return escapeInline(
    s
      .replace(/\s*\n\s*/g, " ")
      .replace(/\\/g, "\\\\")
      .replace(/\|/g, "\\|"),
  );
}

// fence emits a multi-line block verbatim inside a ```text fence, so JSX-like
// `<kind>` and braces in help text are never parsed. The fence length adapts
// if the body ever contains a triple-backtick run (it does not today).
function fence(body) {
  let ticks = "```";
  while (body.includes(ticks)) ticks += "`";
  return `${ticks}text\n${body}\n${ticks}`;
}

function flagLabel(f) {
  return f.shorthand ? `-${f.shorthand}, --${f.name}` : `--${f.name}`;
}

function flagsTable(flags) {
  const rows = flags
    .map((f) => {
      const def = f.default ? `\`${escapeCell(f.default)}\`` : "—";
      return `| \`${escapeCell(flagLabel(f))}\` | ${escapeCell(f.type)} | ${def} | ${escapeCell(f.usage)} |`;
    })
    .join("\n");
  return ["| Flag | Type | Default | Description |", "|---|---|---|---|", rows].join("\n");
}

function renderCommand(cmd, depth, out) {
  const hashes = "#".repeat(Math.min(depth, 6));
  out.push(`${hashes} \`${cmd.path}\``);
  out.push("");
  if (cmd.short) {
    out.push(escapeInline(cmd.short));
    out.push("");
  }
  if (cmd.long) {
    out.push(fence(cmd.long));
    out.push("");
  }
  if (cmd.flags && cmd.flags.length > 0) {
    out.push("**Flags**");
    out.push("");
    out.push(flagsTable(cmd.flags));
    out.push("");
  }
  if (cmd.example) {
    out.push("**Examples**");
    out.push("");
    out.push(fence(cmd.example));
    out.push("");
  }
  for (const sub of cmd.subcommands ?? []) {
    renderCommand(sub, depth + 1, out);
  }
}

export function renderCliReference(spec) {
  const out = [];
  out.push("---");
  out.push("title: CLI Reference");
  out.push(
    "description: Complete reference for every gibson command, flag, and default, generated from the CLI.",
  );
  out.push("---");
  out.push("");
  out.push(
    "{/* GENERATED FILE — do not edit by hand. Rendered from src/generated/cli-spec.json",
  );
  out.push(
    "    by scripts/gen-cli-reference.mjs. Run `pnpm regen:cli` after a CLI change. */}",
  );
  out.push("");
  out.push(
    `\`${spec.binary}\` is the local command-line interface for the Gibson platform. ` +
      "This page lists every command exhaustively; the guides walk you through the " +
      "common workflows.",
  );
  out.push("");
  if (spec.long) {
    out.push(fence(spec.long));
    out.push("");
  }
  if (spec.globalFlags && spec.globalFlags.length > 0) {
    out.push("## Global flags");
    out.push("");
    out.push("Available on every command.");
    out.push("");
    out.push(flagsTable(spec.globalFlags));
    out.push("");
  }
  out.push("## Commands");
  out.push("");
  for (const cmd of spec.commands) {
    renderCommand(cmd, 3, out);
  }
  // Single trailing newline, no trailing whitespace lines.
  return out.join("\n").replace(/\n+$/, "\n");
}

export function loadSpec() {
  return JSON.parse(readFileSync(SPEC_PATH, "utf8"));
}

// Run directly: (re)write the page.
if (import.meta.url === `file://${process.argv[1]}`) {
  const mdx = renderCliReference(loadSpec());
  writeFileSync(PAGE_PATH, mdx);
  console.log(`gen-cli-reference.mjs: wrote ${PAGE_PATH}`);
}
