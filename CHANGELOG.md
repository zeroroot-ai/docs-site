# Changelog

## [0.2.0](https://github.com/zeroroot-ai/docs-site/compare/docs-site-v0.1.0...docs-site-v0.2.0) (2026-08-05)


### Features

* consume @zeroroot-ai/brand tokens (drop inlined CSS vars) ([#1](https://github.com/zeroroot-ai/docs-site/issues/1)) ([2d5a396](https://github.com/zeroroot-ai/docs-site/commit/2d5a39696e0d46c40306c30eb69eac2c40bfe775))
* **content:** bring the real docs in, and fix the CSS reset that broke layout ([#12](https://github.com/zeroroot-ai/docs-site/issues/12)) ([41e50e5](https://github.com/zeroroot-ai/docs-site/commit/41e50e5622b047fc9a41faa9b832c5a5e5a7c433))
* initial Fumadocs docs site with brand tokens and nginx image ([2e6e8d8](https://github.com/zeroroot-ai/docs-site/commit/2e6e8d85792f28aabdc531ae9209e92936ee0e80))


### Bug Fixes

* **ci:** remove pnpm cache — no pnpm-lock.yaml in repo ([#2](https://github.com/zeroroot-ai/docs-site/issues/2)) ([de06ed1](https://github.com/zeroroot-ai/docs-site/commit/de06ed176c31008ec81e12f46faef059f7f6d9aa))
* **docker:** resolve fumadocs-ui@16 upgrade to fix npm ci ERESOLVE ([#5](https://github.com/zeroroot-ai/docs-site/issues/5)) ([7a62aff](https://github.com/zeroroot-ai/docs-site/commit/7a62aff4ba0bbb7b5537167476b8b44fde3f6a7f))
* **docker:** serve from nginx-unprivileged on :8080 ([#10](https://github.com/zeroroot-ai/docs-site/issues/10)) ([26c394a](https://github.com/zeroroot-ai/docs-site/commit/26c394a3ce6145cc283ae3fa33895275f6fb376b))
* **docker:** use npm instead of pnpm — pnpm ignores project .npmrc auth tokens ([#3](https://github.com/zeroroot-ai/docs-site/issues/3)) ([e63683a](https://github.com/zeroroot-ai/docs-site/commit/e63683ae971de06175a32afca8608ab369935105))
* **install:** make the ADK the single entry point, and correct what it claims ([#14](https://github.com/zeroroot-ai/docs-site/issues/14)) ([04e0098](https://github.com/zeroroot-ai/docs-site/commit/04e0098e5bd146adc35d7ba685dd5f78bb35fe84))
* **routing:** serve the docs at / instead of an error shell ([#11](https://github.com/zeroroot-ai/docs-site/issues/11)) ([bdfbe3a](https://github.com/zeroroot-ai/docs-site/commit/bdfbe3aff543a4cc7e40f25368842c6ffdd71441))


### Miscellaneous

* add uniform Makefile contract (build/test/check) ([#7](https://github.com/zeroroot-ai/docs-site/issues/7)) ([b845985](https://github.com/zeroroot-ai/docs-site/commit/b845985b1b7927d5525f95bfd9dd21d60411dde7))
* commit pnpm-lock.yaml for reproducible installs ([#9](https://github.com/zeroroot-ai/docs-site/issues/9)) ([8d02f62](https://github.com/zeroroot-ai/docs-site/commit/8d02f626cc0646d6509fb9876279161076044d0e)), closes [#8](https://github.com/zeroroot-ai/docs-site/issues/8)
