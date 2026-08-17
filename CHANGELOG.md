# Changelog

## [0.2.1](https://github.com/zeroroot-ai/docs-site/compare/docs-site-v0.2.0...docs-site-v0.2.1) (2026-08-17)


### Miscellaneous

* **docs:** refresh api-spec from zeroroot-ai/sdk@v0.163.0 ([#39](https://github.com/zeroroot-ai/docs-site/issues/39)) ([9c272c6](https://github.com/zeroroot-ai/docs-site/commit/9c272c628b2409702f6edf8f0bd86106c467cb06))

## [0.2.0](https://github.com/zeroroot-ai/docs-site/compare/docs-site-v0.1.0...docs-site-v0.2.0) (2026-08-15)


### Features

* **ci:** auto-refresh cli-spec/api-spec from adk and sdk releases ([#27](https://github.com/zeroroot-ai/docs-site/issues/27)) ([17b3410](https://github.com/zeroroot-ai/docs-site/commit/17b34106dd8d4b529e4a1c087e12f092a83328ff))
* consume @zeroroot-ai/brand tokens (drop inlined CSS vars) ([#1](https://github.com/zeroroot-ai/docs-site/issues/1)) ([2d5a396](https://github.com/zeroroot-ai/docs-site/commit/2d5a39696e0d46c40306c30eb69eac2c40bfe775))
* **content:** bring the real docs in, and fix the CSS reset that broke layout ([#12](https://github.com/zeroroot-ai/docs-site/issues/12)) ([41e50e5](https://github.com/zeroroot-ai/docs-site/commit/41e50e5622b047fc9a41faa9b832c5a5e5a7c433))
* **docs:** auto-generate the API reference from the SDK protos ([#17](https://github.com/zeroroot-ai/docs-site/issues/17)) ([39ded3c](https://github.com/zeroroot-ai/docs-site/commit/39ded3cc8c8c23d5a0b28790946a54079f258993))
* **docs:** auto-generate the CLI reference from the adk command spec ([#15](https://github.com/zeroroot-ai/docs-site/issues/15)) ([a1b094b](https://github.com/zeroroot-ai/docs-site/commit/a1b094b1d900d6a7f946241a2ee744ff0fe7142f))
* initial Fumadocs docs site with brand tokens and nginx image ([2e6e8d8](https://github.com/zeroroot-ai/docs-site/commit/2e6e8d85792f28aabdc531ae9209e92936ee0e80))


### Bug Fixes

* **ci:** gate spec-sync refresh PRs on a full pnpm build ([#30](https://github.com/zeroroot-ai/docs-site/issues/30)) ([4181d82](https://github.com/zeroroot-ai/docs-site/commit/4181d82c0c0e03546ad628b3f753651aaa224144))
* **ci:** remove pnpm cache — no pnpm-lock.yaml in repo ([#2](https://github.com/zeroroot-ai/docs-site/issues/2)) ([de06ed1](https://github.com/zeroroot-ai/docs-site/commit/de06ed176c31008ec81e12f46faef059f7f6d9aa))
* **css:** adopt the full brand globals so the docs match the landing page ([#18](https://github.com/zeroroot-ai/docs-site/issues/18)) ([28808fb](https://github.com/zeroroot-ai/docs-site/commit/28808fb019f642d70fc4f392fab5341e5c461136))
* **css:** reserve link-cyan for content, and drop the dead theme toggle ([#25](https://github.com/zeroroot-ai/docs-site/issues/25)) ([0be6da7](https://github.com/zeroroot-ai/docs-site/commit/0be6da751977cd39924b5a90866b40590458da8a))
* **docker:** make the html tree writable by uid 101 so origin substitution can run ([#23](https://github.com/zeroroot-ai/docs-site/issues/23)) ([#24](https://github.com/zeroroot-ai/docs-site/issues/24)) ([122f42d](https://github.com/zeroroot-ai/docs-site/commit/122f42d23f719f4c72d1e33997b82536ea59dcf0))
* **docker:** resolve fumadocs-ui@16 upgrade to fix npm ci ERESOLVE ([#5](https://github.com/zeroroot-ai/docs-site/issues/5)) ([7a62aff](https://github.com/zeroroot-ai/docs-site/commit/7a62aff4ba0bbb7b5537167476b8b44fde3f6a7f))
* **docker:** serve from nginx-unprivileged on :8080 ([#10](https://github.com/zeroroot-ai/docs-site/issues/10)) ([26c394a](https://github.com/zeroroot-ai/docs-site/commit/26c394a3ce6145cc283ae3fa33895275f6fb376b))
* **docker:** use npm instead of pnpm — pnpm ignores project .npmrc auth tokens ([#3](https://github.com/zeroroot-ai/docs-site/issues/3)) ([e63683a](https://github.com/zeroroot-ai/docs-site/commit/e63683ae971de06175a32afca8608ab369935105))
* **install:** make the ADK the single entry point, and correct what it claims ([#14](https://github.com/zeroroot-ai/docs-site/issues/14)) ([04e0098](https://github.com/zeroroot-ai/docs-site/commit/04e0098e5bd146adc35d7ba685dd5f78bb35fe84))
* **links:** env-derive functional cross-surface links at serve time ([#20](https://github.com/zeroroot-ai/docs-site/issues/20)) ([625aa1d](https://github.com/zeroroot-ai/docs-site/commit/625aa1d83b7d285b7bc9be7ab4c50d54c65fd277))
* **routing:** serve the docs at / instead of an error shell ([#11](https://github.com/zeroroot-ai/docs-site/issues/11)) ([bdfbe3a](https://github.com/zeroroot-ai/docs-site/commit/bdfbe3aff543a4cc7e40f25368842c6ffdd71441))


### Miscellaneous

* add uniform Makefile contract (build/test/check) ([#7](https://github.com/zeroroot-ai/docs-site/issues/7)) ([b845985](https://github.com/zeroroot-ai/docs-site/commit/b845985b1b7927d5525f95bfd9dd21d60411dde7))
* **ci:** pin actions to SHAs, tighten permissions, add Scorecard ([#31](https://github.com/zeroroot-ai/docs-site/issues/31)) ([a506622](https://github.com/zeroroot-ai/docs-site/commit/a506622d29970df4d5c236ab31b302f17cd6d4dd))
* commit pnpm-lock.yaml for reproducible installs ([#9](https://github.com/zeroroot-ai/docs-site/issues/9)) ([8d02f62](https://github.com/zeroroot-ai/docs-site/commit/8d02f626cc0646d6509fb9876279161076044d0e)), closes [#8](https://github.com/zeroroot-ai/docs-site/issues/8)
* **docs:** refresh api-spec from zeroroot-ai/sdk@v0.162.0 ([#28](https://github.com/zeroroot-ai/docs-site/issues/28)) ([8db571d](https://github.com/zeroroot-ai/docs-site/commit/8db571d7566d27a1986df4c0dbc93c4cb1b4fd3a))
