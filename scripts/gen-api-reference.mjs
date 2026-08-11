#!/usr/bin/env node
/**
 * gen-api-reference.mjs
 *
 * Renders the customer-facing API / proto reference page
 * (src/content/docs/api-reference.mdx) from the machine-readable proto spec
 * (src/generated/api-spec.json) produced from the SDK protos by
 * `pnpm regen:api` (scripts/regen-api-reference.mjs). The reference is
 * generated so it stays in lockstep with the SDK wire surface while the
 * surrounding guides stay hand-written MDX (dashboard#1026 / E13). It is the
 * sibling of the CLI reference (gen-cli-reference.mjs), built to the exact
 * same shape: committed machine-readable spec → Node generator → MDX →
 * byte-compare drift gate.
 *
 * This script is the single renderer. `renderApiReference(spec)` is exported
 * pure (spec in, MDX string out) so the drift gate
 * (check-api-reference-fresh.mjs) renders with the exact same code and
 * byte-compares against the committed page — the committed output can never
 * silently rot.
 *
 * Run directly to (re)write the page from the committed spec:
 *   node scripts/gen-api-reference.mjs
 *
 * Refresh the spec itself from the protos first (needs a sibling sdk checkout
 * and `buf`): `pnpm regen:api`.
 *
 * Customer terminology: the SPEC is already customer-safe — every proto
 * leading comment is passed through the shared internal-tech sanitizer at
 * production time (see regen-api-reference.mjs), so the committed spec, and
 * therefore this page, never name an internal vendor/impl. This renderer does
 * NOT sanitize; it only applies MDX escaping.
 *
 * MDX safety: proto comments and type strings contain `<T>`, `{`, `|` and
 * backticks that would otherwise be parsed as JSX/expressions or break
 * Markdown tables. Type strings and table cells are escaped; prose comments
 * are escaped inline.
 */

import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
export const SPEC_PATH = join(ROOT, "src", "generated", "api-spec.json");
export const PAGE_PATH = join(ROOT, "src", "content", "docs", "api-reference.mdx");

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
// then the MDX/HTML escapes via escapeInline. Applied to proto type strings,
// which contain `map<k, v>` and `<`.
function escapeCell(s) {
  return escapeInline(
    s
      .replace(/\s*\n\s*/g, " ")
      .replace(/\\/g, "\\\\")
      .replace(/\|/g, "\\|"),
  );
}

// escapeCodeCell prepares a value that is rendered INSIDE backticks in a
// Markdown table cell (field/enum-value names, proto type strings like
// `map<string, Value>`). Inline code is verbatim in MDX — JSX is NOT parsed
// inside it — so `<`/`{`/`&` must NOT be entity-escaped here (that would render
// a literal `&lt;`). Only the GFM table delimiter `|` needs neutralising, via a
// backslash (which GFM strips inside a code span in a table). The escape
// character itself (`\`) is escaped FIRST so the scheme is complete — a literal
// backslash in the input can never combine with the pipe escape
// (js/incomplete-sanitization). Proto type strings contain neither, so this is
// a safety no-op in practice.
function escapeCodeCell(s) {
  return s.replace(/\\/g, "\\\\").replace(/\|/g, "\\|");
}

// prose renders a (already-sanitized) multi-line comment as escaped MDX prose.
// Newlines are preserved (single newlines fold into one paragraph in MD;
// blank lines split paragraphs), only the JSX/expression sigils are escaped.
function prose(comment) {
  return escapeInline(comment.trim());
}

function fieldsTable(fields) {
  const rows = fields
    .map((f) => {
      const desc = f.comment ? escapeCell(f.comment) : "—";
      return `| \`${escapeCodeCell(f.name)}\` | ${f.number} | \`${escapeCodeCell(f.type)}\` | ${desc} |`;
    })
    .join("\n");
  return ["| Field | # | Type | Description |", "|---|---|---|---|", rows].join("\n");
}

function enumTable(values) {
  const rows = values
    .map((v) => {
      const desc = v.comment ? escapeCell(v.comment) : "—";
      return `| \`${escapeCodeCell(v.name)}\` | ${v.number} | ${desc} |`;
    })
    .join("\n");
  return ["| Value | # | Description |", "|---|---|---|", rows].join("\n");
}

function methodSignature(m) {
  const inMark = m.clientStreaming ? "stream " : "";
  const outMark = m.serverStreaming ? "stream " : "";
  return `\`${escapeCodeCell(inMark + m.input)}\` → \`${escapeCodeCell(outMark + m.output)}\``;
}

function renderService(svc, out) {
  out.push(`#### \`${svc.name}\``);
  out.push("");
  if (svc.comment) {
    out.push(prose(svc.comment));
    out.push("");
  }
  for (const m of svc.methods) {
    out.push(`##### \`${m.name}\``);
    out.push("");
    out.push(methodSignature(m));
    out.push("");
    if (m.comment) {
      out.push(prose(m.comment));
      out.push("");
    }
  }
}

function renderMessage(msg, out) {
  out.push(`#### \`${msg.name}\``);
  out.push("");
  if (msg.comment) {
    out.push(prose(msg.comment));
    out.push("");
  }
  if (msg.fields.length > 0) {
    out.push(fieldsTable(msg.fields));
    out.push("");
  } else {
    out.push("_No fields._");
    out.push("");
  }
  for (const o of msg.oneofs ?? []) {
    out.push(`**oneof \`${escapeInline(o.name)}\`** — one of: ${o.fields.map((n) => `\`${escapeInline(n)}\``).join(", ")}.`);
    out.push("");
  }
}

function renderEnum(en, out) {
  out.push(`#### \`${en.name}\``);
  out.push("");
  if (en.comment) {
    out.push(prose(en.comment));
    out.push("");
  }
  out.push(enumTable(en.values));
  out.push("");
}

export function renderApiReference(spec) {
  const out = [];
  out.push("---");
  out.push("title: API Reference");
  out.push(
    "description: The Gibson SDK proto surface — every service, message, field, and enum, generated from the protos.",
  );
  out.push("---");
  out.push("");
  out.push(
    "{/* GENERATED FILE — do not edit by hand. Rendered from src/generated/api-spec.json",
  );
  out.push(
    "    by scripts/gen-api-reference.mjs. Run `pnpm regen:api` after a proto change. */}",
  );
  out.push("");
  out.push(
    "This is the machine-generated reference for the Gibson SDK proto surface — " +
      "the services, messages, fields, and enums a component developer compiles " +
      "against. It is exhaustive; the guides walk you through the common workflows. " +
      "Every symbol below is grouped by its proto package.",
  );
  out.push("");
  for (const pkg of spec.packages) {
    out.push(`## Package \`${pkg.name}\``);
    out.push("");
    if (pkg.comment) {
      out.push(prose(pkg.comment));
      out.push("");
    }
    if (pkg.services.length > 0) {
      out.push("### Services");
      out.push("");
      for (const svc of pkg.services) renderService(svc, out);
    }
    if (pkg.messages.length > 0) {
      out.push("### Messages");
      out.push("");
      for (const msg of pkg.messages) renderMessage(msg, out);
    }
    if (pkg.enums.length > 0) {
      out.push("### Enums");
      out.push("");
      for (const en of pkg.enums) renderEnum(en, out);
    }
  }
  // Single trailing newline, no trailing whitespace lines.
  return out.join("\n").replace(/\n+$/, "\n");
}

export function loadSpec() {
  return JSON.parse(readFileSync(SPEC_PATH, "utf8"));
}

// Run directly: (re)write the page from the committed spec.
if (import.meta.url === `file://${process.argv[1]}`) {
  const mdx = renderApiReference(loadSpec());
  writeFileSync(PAGE_PATH, mdx);
  console.log(`gen-api-reference.mjs: wrote ${PAGE_PATH}`);
}
