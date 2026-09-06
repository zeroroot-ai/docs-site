#!/usr/bin/env node
// SPDX-License-Identifier: Elastic-2.0
// Copyright 2026 Zero Root AI

/**
 * check-ste-prose.mjs: the docs are written in Simplified Technical English.
 *
 * Owner call, 2026-08-25. The rules live in AGENTS.md under "Writing rules".
 * This guard checks the parts a machine can check:
 *
 *   - no sentence over 25 words
 *   - no semicolons
 *   - no em dash or en dash used as punctuation
 *   - no contractions
 *   - no marketing adjectives
 *
 * Spelling is not checked here. scripts/check-no-british-spellings.mjs owns
 * it, and it already scans every page.
 *
 * What it reads: every hand-written page under src/content/docs. Generated
 * pages (api-reference, cli-reference) are skipped: their prose comes from
 * proto comments and CLI help in other repositories.
 *
 * What it skips inside a page: frontmatter, fenced code blocks, inline code,
 * MDX import lines and JSX comments, table rows, and URLs. A heading is
 * checked like any sentence.
 *
 * Usage:
 *   node scripts/check-ste-prose.mjs            # scan
 *   node scripts/check-ste-prose.mjs --selftest # verify the scanner
 *
 * Exit codes: 0 clean, 1 violations found (or selftest failure).
 */

import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(fileURLToPath(new URL(".", import.meta.url)), "..");
const DOCS = join(ROOT, "src", "content", "docs");
const GENERATED = new Set(["api-reference.mdx", "cli-reference.mdx"]);
const MAX_WORDS = 25;

const MARKETING = [
  "seamless",
  "robust",
  "powerful",
  "cutting-edge",
  "effortless",
  "world-class",
  "next-generation",
  "revolutionary",
];

const CONTRACTION = /\b(?:[A-Za-z]+n't|[A-Za-z]+'(?:re|ll|ve|d|m)|(?:it|he|she|that|there|what|who|where|how|let)'s)\b/g;

/** Strip everything that is not prose. Line count is preserved. */
export function proseOf(src) {
  let s = src;
  // frontmatter
  s = s.replace(/^---\n[\s\S]*?\n---\n?/, (m) => "\n".repeat(m.split("\n").length - 1));
  // fenced code
  s = s.replace(/```[\s\S]*?```/g, (m) => "\n".repeat(m.split("\n").length - 1));
  // JSX comments and import lines
  s = s.replace(/\{\/\*[\s\S]*?\*\/\}/g, (m) => "\n".repeat(m.split("\n").length - 1));
  s = s.replace(/^import .*$/gm, "");
  // table rows
  s = s.replace(/^\|.*$/gm, "");
  // inline code and URLs
  s = s.replace(/`[^`\n]*`/g, "code");
  s = s.replace(/\]\([^)]*\)/g, "]");
  s = s.replace(/https?:\/\/\S+/g, "url");
  return s;
}

/** Split prose into sentences with the line each starts on. */
export function sentencesOf(prose) {
  const out = [];
  const lines = prose.split("\n");
  let buf = "";
  let startLine = 1;
  const flush = (line) => {
    const t = buf.replace(/\s+/g, " ").trim();
    if (t) out.push({ line: startLine, text: t });
    buf = "";
    startLine = line;
  };
  lines.forEach((raw, i) => {
    const line = i + 1;
    const l = raw.replace(/^\s*(?:[-*]|\d+\.)\s+/, "").replace(/^#+\s*/, "").trim();
    if (!l) {
      flush(line + 1);
      return;
    }
    if (!buf) startLine = line;
    // sentence boundaries inside the line
    const parts = l.split(/(?<=[.!?])\s+(?=[A-Z(*_"“])/);
    parts.forEach((p, j) => {
      buf += (buf ? " " : "") + p;
      if (j < parts.length - 1) flush(line);
    });
    if (/[.!?:]$/.test(l) || /^#/.test(raw) || /^\s*(?:[-*]|\d+\.)\s+/.test(raw)) flush(line + 1);
  });
  flush(lines.length);
  return out;
}

export function violationsOf(src) {
  const v = [];
  const prose = proseOf(src);
  prose.split("\n").forEach((l, i) => {
    const line = i + 1;
    if (l.includes(";")) v.push({ line, why: "semicolon: write two sentences" });
    if (/[—–]/.test(l)) v.push({ line, why: "dash used as punctuation: use a comma, a colon, or a new sentence" });
    const c = l.match(CONTRACTION);
    if (c) v.push({ line, why: `contraction: ${c.join(", ")}` });
    for (const w of MARKETING) {
      if (new RegExp(`\\b${w}\\b`, "i").test(l)) v.push({ line, why: `marketing adjective: ${w}` });
    }
  });
  for (const s of sentencesOf(prose)) {
    const n = s.text.split(/\s+/).filter((w) => /[A-Za-z0-9]/.test(w)).length;
    if (n > MAX_WORDS) v.push({ line: s.line, why: `${n} words in one sentence (max ${MAX_WORDS}): "${s.text.slice(0, 70)}..."` });
  }
  return v.sort((a, b) => a.line - b.line);
}

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (name.endsWith(".mdx") && !GENERATED.has(name)) out.push(p);
  }
  return out;
}

function selftest() {
  const cases = [
    ["Gibson reads the file.", 0],
    ["The parser reads the file; then it stops.", 1],
    ["The runtime — the thing agents run inside — denies the call.", 1],
    ["It doesn't stop.", 1],
    ["A robust runtime.", 1],
    ["`don't` is code and `a; b` too.", 0],
    ["```\nx; y — z don't\n```\nClean line.", 0],
    ["| a; b | c — d |\n", 0],
    ["---\ndescription: don't; ever — no\n---\nClean.", 0],
    ["This sentence has exactly twenty six words in it because the guard must fail on any sentence that runs past the limit the rules set out.", 1],
    ["- Item one is short.\n- Item two is short.", 0],
    ["See [the guide](https://example.com/a;b—c) now.", 0],
  ];
  let bad = 0;
  for (const [src, want] of cases) {
    const got = violationsOf(src).length;
    if (got !== want) {
      bad++;
      console.error(`selftest FAIL: expected ${want}, got ${got} for ${JSON.stringify(src)}`);
      for (const v of violationsOf(src)) console.error("   ", v.why);
    }
  }
  if (bad) process.exit(1);
  console.log(`selftest OK (${cases.length} cases)`);
}

function main() {
  if (process.argv.includes("--selftest")) return selftest();
  const only = process.argv.slice(2).filter((a) => !a.startsWith("--"));
  const files = only.length ? only.map((f) => join(ROOT, f)) : walk(DOCS);
  let total = 0;
  const summary = [];
  for (const f of files) {
    const v = violationsOf(readFileSync(f, "utf8"));
    if (!v.length) continue;
    total += v.length;
    summary.push(`${relative(ROOT, f)}: ${v.length}`);
    if (!process.argv.includes("--summary")) {
      for (const x of v) console.log(`${relative(ROOT, f)}:${x.line}: ${x.why}`);
    }
  }
  if (process.argv.includes("--summary")) console.log(summary.join("\n"));
  if (total) {
    console.error(`\n❌ check-ste-prose: ${total} violation(s). Rules: AGENTS.md, Writing rules.`);
    process.exit(1);
  }
  console.log(`✓ check-ste-prose: ${files.length} page(s) clean`);
}

main();
