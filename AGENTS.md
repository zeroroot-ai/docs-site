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
