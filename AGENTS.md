# AGENTS.md

See [zeroroot-ai/.github AGENTS.md](https://github.com/zeroroot-ai/.github/blob/main/AGENTS.md) for the canonical workflow contract.

## This repo

`zeroroot-ai/docs-site` — ZeroRoot platform documentation site (Apache-2.0).

Framework: Next.js 15 + Fumadocs. Produces a static export served by nginx.
Image: `ghcr.io/zeroroot-ai/docs-site` (multi-stage, non-root nginx).
Brand: `@zeroroot/brand` design tokens (violet-led dark aesthetic).

## Commands

```bash
pnpm install
pnpm dev       # :3000
pnpm build     # static export → out/
```

## Deployment

Ships as a core optional-by-toggle component in the gibson deploy umbrella
(`helm/gibson-workloads/templates/docs/`). Version-matched to the chart's
appVersion — a v1.4 platform install serves v1.4 docs by default.

ADR-0006: self-hosted vs SaaS seam model.

## Writing rules

Every page under `src/content/docs` is written in Simplified Technical
English (ASD-STE100), STE-flavored mode. `scripts/check-ste-prose.mjs` runs in
`check:docs` and blocks the build on the rules a machine can check. The rest
is on the author. Owner call, 2026-08-25.

Words:
- Use one name for one thing. Do not call the same item by two names.
- Use the short common word: start, use, help, make sure, before, after,
  about, get, show, also.
- Give each word one meaning.
- No marketing adjectives: seamless, robust, powerful, cutting-edge,
  effortless, world-class, next-generation, revolutionary.
- American spelling. Never British spelling.

Verbs:
- Active voice. "The parser reads the file", not "the file is read".
- Use a verb for an action. "Analyze the log", not "perform an analysis".
- No stacked auxiliaries. Not "it is important to note that this may help".
  Write "this improves X".
- No "-ing" main verb where a simple tense works.

Sentences:
- One instruction per sentence. At most 20 words for an instruction, 25 for a
  descriptive sentence.
- No contractions. Use articles: a, an, the, this, these.

Punctuation:
- No semicolons. Write two sentences.
- No em dash or en dash as punctuation.

Structure:
- One topic per paragraph, at most six sentences.
- For steps, use a numbered list, one action per item, imperative form.
- Put a condition before its command.
- Write only the requested text. No preamble, no summary, no closing remarks.

Before you finish a page, check it:
1. Is any sentence over the limit? Split it.
2. Any semicolon or dash punctuation? Remove it.
3. Any contraction? Expand it.
4. Passive voice with a known actor? Make it active.
5. An "-ing" main verb, a nominalization, or a phrasal verb? Use a plain verb.
6. The same concept named two ways? Pick one name.

Generated pages (`api-reference.mdx`, `cli-reference.mdx`) are exempt. Their
prose comes from proto comments and CLI help in other repositories. Fix it at
the source.
