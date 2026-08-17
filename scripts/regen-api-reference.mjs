#!/usr/bin/env node
/**
 * regen-api-reference.mjs  (pnpm regen:api)
 *
 * The one command a maintainer runs to refresh the API / proto reference
 * end-to-end, the sibling of regen-cli-reference.mjs:
 *
 *   1. Re-emit the machine-readable proto spec from the SDK protos themselves,
 *      when a sibling sdk checkout and `buf` are reachable, so the spec tracks
 *      the real wire surface. Skipped with a clear note when the sdk or buf is
 *      absent (e.g. in docs CI, which only re-renders and gates the committed
 *      spec).
 *   2. Render src/content/docs/api-reference.mdx from the spec.
 *
 * Point at a specific sdk checkout with SDK_DIR=/path/to/sdk.
 *
 * ── How the spec is produced ────────────────────────────────────────────────
 * `buf build` (run in the sdk module) emits a FileDescriptorSet as JSON,
 * including sourceCodeInfo (the leading comments). This script walks it into a
 * stable, sorted doc spec: packages → services / messages / enums → methods /
 * fields / values, each with its leading comment. Only the first-party,
 * customer-facing SDK packages are emitted (see FIRST_PARTY_PREFIXES /
 * EXCLUDE_PACKAGES).
 *
 * ── CLI name (hard requirement, check-docs-cli-name.mjs) ────────────────────
 * Proto leading comments sometimes say `gibson-cli`; the binary is `gibson`.
 * Every comment goes through `sanitizeComment`, and `assertClean` re-checks the
 * assembled spec and THROWS on a leak, so a bad name fails `regen:api` loudly
 * rather than shipping.
 *
 * The vendor-name deny list that used to run here was removed with
 * `check-no-internal-tech-in-docs.mjs`: proto comments may name the standards
 * and backends the platform implements.
 *
 * CI does NOT run this. CI runs `pnpm check:docs`, whose
 * check-api-reference-fresh gate re-renders from the committed spec and fails
 * on drift. That split keeps generation reproducible without buf/a Go
 * toolchain in the docs image, while `regen:api` gives maintainers a single
 * refresh command.
 *
 *   node scripts/regen-api-reference.mjs            # refresh spec (if sdk+buf) + page
 *   node scripts/regen-api-reference.mjs --selftest # prove the sanitizer fixes the CLI name
 */

import { execFileSync } from "node:child_process";
import { existsSync, writeFileSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import { renderApiReference, loadSpec, SPEC_PATH, PAGE_PATH } from "./gen-api-reference.mjs";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const MODULE_NAME = "buf.build/zeroroot-ai-platform/sdk";

// Which packages land in the reference. The SDK is the Apache, component-dev
// wire surface (ADR-0058); we document every first-party package a customer
// compiles against, EXCEPT:
//   - gibson.auth.v1  — proto-option extensions consumed by the platform's
//     authz-registry codegen, not a callable API (and identity-vendor heavy).
//   - gibson.test.v1  — test fixtures, not a customer surface.
// Dependency packages (google.protobuf, buf.validate) are never first-party.
const FIRST_PARTY_PREFIXES = ["gibson.", "taxonomy."];
const EXCLUDE_PACKAGES = new Set(["gibson.auth.v1", "gibson.test.v1"]);

function isFirstParty(pkg) {
  if (!pkg) return false;
  if (EXCLUDE_PACKAGES.has(pkg)) return false;
  return FIRST_PARTY_PREFIXES.some((p) => pkg.startsWith(p));
}

// ── Comment sanitizer ───────────────────────────────────────────────────────
// Name fixes for the docs CLI-name guard, check-docs-cli-name.mjs, which forbids
// the `gibson-cli` substring (the binary is `gibson`). Applied longest-match
// first so `gibson-client.ts` (an internal dashboard file the protos mention)
// is rewritten before the shorter matches, leaving no `gibson-cli` substring.
// Mirrors check-docs-cli-name.mjs's FORBIDDEN by design (that guard is not
// importable); NAME_FORBIDDEN below is the backstop that keeps them in sync.
const NAME_FIXES = [
  [/gibson-client\.ts/g, "the dashboard data client"],
  [/gibson-client/g, "the dashboard client"],
  [/gibson-cli/g, "gibson"],
];
const NAME_FORBIDDEN = /gibson-cli/;

// tidy repairs the punctuation/whitespace artifacts left when a term is
// dropped ("" replacement) mid-sentence. Cosmetic only — assertClean, not
// tidy, is what guarantees cleanliness.
function tidy(text) {
  return text
    .split("\n")
    .map((line) =>
      line
        .replace(/\(\s*\)/g, "") // empty parens left by a dropped clause
        .replace(/\s-(\w)/g, " $1") // dangling hyphen glued to a word (e.g. "-emitted")
        .replace(/\s+([,.;:)])/g, "$1") // space before punctuation / close-paren
        .replace(/([(])\s+/g, "$1") // space after open-paren
        .replace(/,\s*,/g, ",") // doubled commas
        .replace(/\s{2,}/g, " ") // collapse runs of spaces
        .replace(/^\s*[,.;:]\s*/, "") // leading punctuation after a dropped lead
        .replace(/\s+$/, ""), // trailing whitespace
    )
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function sanitizeComment(raw) {
  if (!raw) return "";
  // Strip the single convention space proto emits after `//` on every comment
  // line, so continuation lines render left-aligned rather than indented.
  // Relative indentation (nested lists) is preserved — only one space goes.
  let text = raw.replace(/^ /gm, "");
  for (const [re, replacement] of NAME_FIXES) {
    text = text.replace(re, replacement);
  }
  return tidy(text);
}

// assertClean re-checks an already-sanitized string and throws on any surviving
// match — the production-time backstop that proves the committed spec (and
// therefore the page) never ships the wrong CLI name.
function assertClean(text, where) {
  NAME_FORBIDDEN.lastIndex = 0;
  const nm = NAME_FORBIDDEN.exec(text);
  if (nm) {
    throw new Error(
      `sanitizer leak at ${where}: cli-name guard still matches ${JSON.stringify(nm[0])} in:\n${text}`,
    );
  }
}

// ── Descriptor walking ──────────────────────────────────────────────────────

function scalarName(field) {
  return field.type.replace(/^TYPE_/, "").toLowerCase();
}

// shortType strips the leading dot and, for a type in the same package, the
// package prefix ("gibson.mission.v1.Mission.Step" → "Mission.Step").
// Cross-package and well-known types keep their qualified name
// ("google.protobuf.Timestamp", "gibson.common.v1.Value") so the reference is
// unambiguous.
function shortType(typeName, pkg) {
  const t = typeName.replace(/^\./, "");
  const prefix = pkg + ".";
  return t.startsWith(prefix) ? t.slice(prefix.length) : t;
}

// buildTypeIndex maps every message's fully-qualified name (WITH the leading
// dot, matching FieldDescriptorProto.typeName) to { mapEntry, keyType,
// valueType }. Used to render `map<k, v>` for the synthetic *Entry messages
// the compiler generates for map fields. Walks EVERY file (deps included) so a
// map field referencing any package resolves.
function buildTypeIndex(files) {
  const index = new Map();
  const walk = (pkg, prefix, msgs) => {
    for (const m of msgs || []) {
      const dotted = prefix ? `${prefix}.${m.name}` : m.name;
      const fq = `.${pkg}.${dotted}`;
      if (m.options && m.options.mapEntry) {
        const key = (m.field || []).find((f) => f.number === 1);
        const val = (m.field || []).find((f) => f.number === 2);
        index.set(fq, {
          mapEntry: true,
          keyType: key ? scalarName(key) : "string",
          valueType: renderRefOrScalar(val, pkg),
        });
      } else {
        index.set(fq, { mapEntry: false });
      }
      walk(pkg, dotted, m.nestedType);
    }
  };
  for (const f of files) walk(f.package, "", f.messageType);
  return index;
}

// renderRefOrScalar renders a single (non-repeated, non-map) field's type,
// used for map value types where recursion into another map is impossible.
function renderRefOrScalar(field, pkg) {
  if (!field) return "string";
  if (field.type === "TYPE_MESSAGE" || field.type === "TYPE_ENUM") {
    return shortType(field.typeName, pkg);
  }
  return scalarName(field);
}

function renderFieldType(f, pkg, index) {
  const repeated = f.label === "LABEL_REPEATED";
  let base;
  if (f.type === "TYPE_MESSAGE" || f.type === "TYPE_ENUM") {
    const info = index.get(f.typeName);
    if (info && info.mapEntry) {
      return `map<${info.keyType}, ${info.valueType}>`;
    }
    base = shortType(f.typeName, pkg);
  } else {
    base = scalarName(f);
  }
  if (repeated) return `repeated ${base}`;
  if (f.proto3Optional) return `optional ${base}`;
  return base;
}

// resolveLocation maps a sourceCodeInfo path to a canonical comment key. Path
// segments are FileDescriptorProto field numbers: messageType=4, enumType=5,
// service=6; within a message field=2, nestedType=3, enumType=4; within an
// enum value=2; within a service method=2; the FileDescriptorProto.package
// field is 2.
function resolveLocation(file, path) {
  const pkg = file.package;
  if (path.length >= 2 && path[0] === 4) {
    let msg = (file.messageType || [])[path[1]];
    if (!msg) return null;
    let name = msg.name;
    let i = 2;
    while (i < path.length) {
      const field = path[i];
      const j = path[i + 1];
      if (field === 3) {
        msg = (msg.nestedType || [])[j];
        if (!msg) return null;
        name += "." + msg.name;
        i += 2;
        continue;
      }
      if (field === 2) {
        const fld = (msg.field || [])[j];
        return fld ? { key: `F:${pkg}.${name}.${fld.name}` } : null;
      }
      if (field === 4) {
        const en = (msg.enumType || [])[j];
        if (!en) return null;
        const enName = `${name}.${en.name}`;
        if (i + 2 < path.length && path[i + 2] === 2) {
          const v = (en.value || [])[path[i + 3]];
          return v ? { key: `V:${pkg}.${enName}.${v.name}` } : null;
        }
        return { key: `E:${pkg}.${enName}` };
      }
      return null; // oneofDecl (8) or other — no doc key
    }
    return { key: `T:${pkg}.${name}` };
  }
  if (path.length >= 2 && path[0] === 5) {
    const en = (file.enumType || [])[path[1]];
    if (!en) return null;
    if (path.length >= 4 && path[2] === 2) {
      const v = (en.value || [])[path[3]];
      return v ? { key: `V:${pkg}.${en.name}.${v.name}` } : null;
    }
    return { key: `E:${pkg}.${en.name}` };
  }
  if (path.length >= 2 && path[0] === 6) {
    const svc = (file.service || [])[path[1]];
    if (!svc) return null;
    if (path.length >= 4 && path[2] === 2) {
      const m = (svc.method || [])[path[3]];
      return m ? { key: `M:${pkg}.${svc.name}.${m.name}` } : null;
    }
    return { key: `S:${pkg}.${svc.name}` };
  }
  if (path.length === 1 && path[0] === 2) {
    return { key: `P:${pkg}` };
  }
  return null;
}

function buildComments(file) {
  const out = new Map();
  const locs = (file.sourceCodeInfo && file.sourceCodeInfo.location) || [];
  for (const loc of locs) {
    const path = loc.path || [];
    let raw = loc.leadingComments || "";
    const resolved = resolveLocation(file, path);
    if (!resolved) continue;
    // Package doc often lives in the leading DETACHED comment (the file banner
    // above the syntax/package statement); fall back to it.
    if (!raw && resolved.key.startsWith("P:") && loc.leadingDetachedComments) {
      raw = loc.leadingDetachedComments.join("\n\n");
    }
    if (!raw.trim()) continue;
    const clean = sanitizeComment(raw);
    if (clean) out.set(resolved.key, clean);
  }
  return out;
}

function collator() {
  return (a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0);
}

function computeOneofs(msg) {
  const decls = msg.oneofDecl || [];
  if (decls.length === 0) return [];
  const groups = decls.map((d) => ({ name: d.name, members: [] }));
  for (const f of msg.field || []) {
    if (f.oneofIndex === undefined || f.oneofIndex === null) continue;
    if (f.proto3Optional) continue; // synthetic oneof for `optional` scalars
    const g = groups[f.oneofIndex];
    if (g) g.members.push({ name: f.name, number: f.number });
  }
  return groups
    .filter((g) => g.members.length > 0)
    .map((g) => ({
      name: g.name,
      fields: g.members.sort((a, b) => a.number - b.number).map((m) => m.name),
    }))
    .sort(collator());
}

function buildSpec(fds) {
  const files = fds.file || [];
  const index = buildTypeIndex(files);
  // pkg name → accumulator across the (possibly several) files of that package.
  const pkgs = new Map();
  const acc = (pkg) => {
    if (!pkgs.has(pkg)) pkgs.set(pkg, { services: [], messages: [], enums: [], docs: [] });
    return pkgs.get(pkg);
  };

  for (const file of files) {
    const pkg = file.package;
    if (!isFirstParty(pkg)) continue;
    const comments = buildComments(file);
    const bucket = acc(pkg);

    const pkgDoc = comments.get(`P:${pkg}`);
    if (pkgDoc) bucket.docs.push(pkgDoc);

    for (const svc of file.service || []) {
      bucket.services.push({
        name: svc.name,
        comment: comments.get(`S:${pkg}.${svc.name}`) || "",
        methods: (svc.method || [])
          .map((m) => ({
            name: m.name,
            input: shortType(m.inputType, pkg),
            output: shortType(m.outputType, pkg),
            clientStreaming: !!m.clientStreaming,
            serverStreaming: !!m.serverStreaming,
            comment: comments.get(`M:${pkg}.${svc.name}.${m.name}`) || "",
          }))
          .sort(collator()),
      });
    }

    const emitMessage = (msg, prefix) => {
      const dotted = prefix ? `${prefix}.${msg.name}` : msg.name;
      const fq = `${pkg}.${dotted}`;
      if (!(msg.options && msg.options.mapEntry)) {
        bucket.messages.push({
          name: dotted,
          comment: comments.get(`T:${fq}`) || "",
          fields: (msg.field || [])
            .map((f) => ({
              name: f.name,
              number: f.number ?? 0,
              type: renderFieldType(f, pkg, index),
              comment: comments.get(`F:${fq}.${f.name}`) || "",
            }))
            .sort((a, b) => a.number - b.number),
          oneofs: computeOneofs(msg),
        });
      }
      for (const n of msg.nestedType || []) emitMessage(n, dotted);
      for (const en of msg.enumType || []) emitEnum(en, dotted);
    };
    const emitEnum = (en, prefix) => {
      const dotted = prefix ? `${prefix}.${en.name}` : en.name;
      const fq = `${pkg}.${dotted}`;
      bucket.enums.push({
        name: dotted,
        comment: comments.get(`E:${fq}`) || "",
        values: (en.value || [])
          .map((v) => ({
            name: v.name,
            number: v.number ?? 0,
            comment: comments.get(`V:${fq}.${v.name}`) || "",
          }))
          .sort((a, b) => a.number - b.number),
      });
    };

    for (const msg of file.messageType || []) emitMessage(msg, "");
    for (const en of file.enumType || []) emitEnum(en, "");
  }

  const packages = [...pkgs.entries()]
    .map(([name, b]) => {
      const pkg = {
        name,
        comment: [...new Set(b.docs)].sort().join("\n\n"),
        services: b.services.sort(collator()),
        messages: b.messages
          .map((m) => (m.oneofs && m.oneofs.length ? m : (({ oneofs, ...rest }) => rest)(m)))
          .sort(collator()),
        enums: b.enums.sort(collator()),
      };
      if (!pkg.comment) delete pkg.comment;
      return pkg;
    })
    .sort(collator());

  const spec = { module: MODULE_NAME, generator: "scripts/regen-api-reference.mjs", packages };
  // Backstop: prove every comment in the finished spec uses the right CLI name.
  assertClean(JSON.stringify(spec), "assembled spec");
  return spec;
}

// ── buf / sdk discovery ─────────────────────────────────────────────────────

function hasBuf() {
  try {
    execFileSync("buf", ["--version"], { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

function findSdkDir() {
  const candidates = [
    process.env.SDK_DIR,
    join(ROOT, "..", "sdk"),
    join(ROOT, "..", "..", "opensource", "sdk"),
  ].filter(Boolean);
  for (const c of candidates) {
    if (existsSync(join(c, "buf.yaml")) && existsSync(join(c, "api", "proto"))) return c;
  }
  return null;
}

function refreshSpec() {
  const sdk = findSdkDir();
  if (!sdk) {
    console.log(
      "regen:api: no sdk checkout found (set SDK_DIR to refresh the spec); " +
        "rendering from the committed src/generated/api-spec.json.",
    );
    return;
  }
  if (!hasBuf()) {
    console.log("regen:api: `buf` not found on PATH; rendering from the committed spec.");
    return;
  }
  console.log(`regen:api: refreshing api-spec.json from ${sdk} (buf build)`);
  const dir = mkdtempSync(join(tmpdir(), "api-spec-"));
  const out = join(dir, "fds.json");
  try {
    execFileSync("buf", ["build", "-o", out], {
      cwd: sdk,
      stdio: ["ignore", "ignore", "inherit"],
    });
    const fds = JSON.parse(readFileSync(out, "utf8"));
    const spec = buildSpec(fds);
    writeFileSync(SPEC_PATH, JSON.stringify(spec, null, 2) + "\n");
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

// ── selftest: prove the sanitizer fixes the CLI name ────────────────────────
function runSelftest() {
  // One mention per name fix, mid-sentence, so the sanitizer must handle
  // in-prose replacement (not just whole-line drops).
  const sample = [
    "Run gibson-cli inspect; replaces gibson-client.ts (getKPIs).",
    "Fetches through gibson-client for data.",
  ].join("\n");
  const cleaned = sanitizeComment(sample);
  try {
    assertClean(cleaned, "selftest");
  } catch (err) {
    process.stderr.write(`\u274c regen:api --selftest FAILED: ${err.message}\n`);
    return 1;
  }
  // Every fix must actually have been exercised by the sample (guards the
  // sample against silently drifting out of coverage as the list grows).
  const missing = [];
  for (const [re] of NAME_FIXES) {
    re.lastIndex = 0;
    if (!re.test(sample)) missing.push(String(re));
  }
  if (missing.length > 0) {
    process.stderr.write(
      `\u274c regen:api --selftest FAILED: sample does not exercise ${missing.join(", ")}\n`,
    );
    return 1;
  }
  console.log(
    `check via regen:api --selftest: OK \u2014 sanitizer applied all ${NAME_FIXES.length} name fix(es); ` +
      `cleaned sample uses the right CLI name.\n---\n${cleaned}\n---`,
  );
  return 0;
}

// ── main ────────────────────────────────────────────────────────────────────
if (import.meta.url === `file://${process.argv[1]}`) {
  if (process.argv[2] === "--selftest") {
    process.exit(runSelftest());
  }
  refreshSpec();
  writeFileSync(PAGE_PATH, renderApiReference(loadSpec()));
  console.log(`regen:api: wrote ${PAGE_PATH}`);
}
