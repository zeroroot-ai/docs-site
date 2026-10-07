# Changelog

## [0.6.14](https://github.com/zeroroot-ai/docs-site/compare/docs-site-v0.6.13...docs-site-v0.6.14) (2026-10-06)


### Bug Fixes

* **api-reference:** the recorded BSR module name points at a deleted module ([#64](https://github.com/zeroroot-ai/docs-site/issues/64)) ([352c11c](https://github.com/zeroroot-ai/docs-site/commit/352c11c37636bdc7587073bc58384c8906960f1d))
* end-phase integration of docs-site ([#98](https://github.com/zeroroot-ai/docs-site/issues/98)) ([ee549dc](https://github.com/zeroroot-ai/docs-site/commit/ee549dcb844be1db04914ab4c6d4a73953593e5f))
* **image:** apk upgrade the runtime stage behind APT_CACHE_BUST ([#68](https://github.com/zeroroot-ai/docs-site/issues/68)) ([5996097](https://github.com/zeroroot-ai/docs-site/commit/59960972d414a1b3227fe7f891d96869ea000554)), closes [#45](https://github.com/zeroroot-ai/docs-site/issues/45)
* **image:** build from the one lockfile CI verifies, and delete the other ([#63](https://github.com/zeroroot-ai/docs-site/issues/63)) ([c775da5](https://github.com/zeroroot-ai/docs-site/commit/c775da5fe4f02761564a5fdbf87f84fa75e0761f))
* **image:** hash-pin pnpm with npm ci and drop libpng from the runtime base ([#66](https://github.com/zeroroot-ai/docs-site/issues/66)) ([b6d9970](https://github.com/zeroroot-ai/docs-site/commit/b6d9970bc9420a8333ee787d3864d04eb26411f6)), closes [#45](https://github.com/zeroroot-ai/docs-site/issues/45)
* **rework:** pnpm moves by hand, together with packageManager ([#92](https://github.com/zeroroot-ai/docs-site/issues/92)) ([7401729](https://github.com/zeroroot-ai/docs-site/commit/74017299dbc38674d263c0d2d01c03d0ee0fce42))


### Documentation

* add the invited-member quickstart and correct the tenant roles ([#57](https://github.com/zeroroot-ai/docs-site/issues/57)) ([e1cbd6d](https://github.com/zeroroot-ai/docs-site/commit/e1cbd6d019e30c7bef60f5b216c57431f0ac8861))
* clone the ADK, and stop offering a bare binary install ([#60](https://github.com/zeroroot-ai/docs-site/issues/60)) ([179179b](https://github.com/zeroroot-ai/docs-site/commit/179179bef22865452e94f9aad25d37ec2e0f0974))
* delete the invited-member page, and stop promising a second email ([#62](https://github.com/zeroroot-ai/docs-site/issues/62)) ([1bbe6c9](https://github.com/zeroroot-ai/docs-site/commit/1bbe6c9da6c6101a7d60461546b9ab370e872843))
* **install:** the enrol flow is two environment variables and a first start ([#75](https://github.com/zeroroot-ai/docs-site/issues/75)) ([bad2117](https://github.com/zeroroot-ai/docs-site/commit/bad2117371aac650fabdddd756d18dc681fa08f5))
* **missions:** a node can start from the state of an earlier node ([#80](https://github.com/zeroroot-ai/docs-site/issues/80)) ([946dd65](https://github.com/zeroroot-ai/docs-site/commit/946dd652e2ca2727b65215316a01db6650e33a1e))
* **plugins:** plugins and connectors live in gibson, not in the integrations repo ([#96](https://github.com/zeroroot-ai/docs-site/issues/96)) ([e561274](https://github.com/zeroroot-ai/docs-site/commit/e56127493bb16e2294623c55d92f51ab7daa929f))
* **rbac:** state what removal does, and drop the two unimplemented claims ([#67](https://github.com/zeroroot-ai/docs-site/issues/67)) ([6d60be9](https://github.com/zeroroot-ai/docs-site/commit/6d60be9588216afefe044e347bd336ab2a56b48a)), closes [#59](https://github.com/zeroroot-ai/docs-site/issues/59)
* **security:** the supply-chain page describes on-prem and air-gapped installs ([#61](https://github.com/zeroroot-ai/docs-site/issues/61)) ([13e1a42](https://github.com/zeroroot-ai/docs-site/commit/13e1a4270fcd7f320eee6df30379ba718832aac4))
* two pages cite the ADR that holds their rule ([#77](https://github.com/zeroroot-ai/docs-site/issues/77)) ([7bd9a40](https://github.com/zeroroot-ai/docs-site/commit/7bd9a400607d7072da696596ddaa3d365e8c00d1))
* update ADR citations to the current series ([#71](https://github.com/zeroroot-ai/docs-site/issues/71)) ([a089266](https://github.com/zeroroot-ai/docs-site/commit/a089266e3080d968cf7079ff98e7e638d921e6bb))


### Miscellaneous

* **deps:** bump github/codeql-action/upload-sarif ([5226c39](https://github.com/zeroroot-ai/docs-site/commit/5226c398024018b19f5add9fa349d0c39329db83))
* **deps:** bump github/codeql-action/upload-sarif from 4.37.7 to 4.38.2 in the codeql-action group ([#82](https://github.com/zeroroot-ai/docs-site/issues/82)) ([5226c39](https://github.com/zeroroot-ai/docs-site/commit/5226c398024018b19f5add9fa349d0c39329db83))
* **deps:** bump next from 16.3.4 to 16.3.6 ([#46](https://github.com/zeroroot-ai/docs-site/issues/46)) ([7f995dd](https://github.com/zeroroot-ai/docs-site/commit/7f995ddc4d90b94f6c19856128c7311dec6f8862))
* **deps:** bump node from `ef24c50` to `0b36e8c` ([#43](https://github.com/zeroroot-ai/docs-site/issues/43)) ([7461b64](https://github.com/zeroroot-ai/docs-site/commit/7461b64a515cba9cbe7533e889f10956ea124e5f))
* **deps:** bump the actions-deps group with 5 updates ([#83](https://github.com/zeroroot-ai/docs-site/issues/83)) ([9a33bea](https://github.com/zeroroot-ai/docs-site/commit/9a33bea13d78202c6182ffed22e6e81580d46ab0))
* **deps:** bump the npm-deps group across 2 directories with 13 updates ([#87](https://github.com/zeroroot-ai/docs-site/issues/87)) ([04a0342](https://github.com/zeroroot-ai/docs-site/commit/04a034274a99152626f90168ea4237be49584dee))
* **deps:** the Dependabot file follows the shared template ([#81](https://github.com/zeroroot-ai/docs-site/issues/81)) ([fb63e98](https://github.com/zeroroot-ai/docs-site/commit/fb63e98761dd2bced374b3f5052d70404e784bb3))
* **docs:** refresh api-spec ([#69](https://github.com/zeroroot-ai/docs-site/issues/69)) ([40b3a99](https://github.com/zeroroot-ai/docs-site/commit/40b3a99bb7cefebfe3e4164cfcc09fb2f802122f))
* **docs:** refresh api-spec ([#78](https://github.com/zeroroot-ai/docs-site/issues/78)) ([cf68c85](https://github.com/zeroroot-ai/docs-site/commit/cf68c857ae8072ca69328412670902dde40098a5))
* **docs:** refresh api-spec ([#90](https://github.com/zeroroot-ai/docs-site/issues/90)) ([d50f035](https://github.com/zeroroot-ai/docs-site/commit/d50f0359ea4dca01ec57388c55a8f908e6284937))
* **docs:** refresh api-spec from zeroroot-ai/sdk@v0.192.0 ([40b3a99](https://github.com/zeroroot-ai/docs-site/commit/40b3a99bb7cefebfe3e4164cfcc09fb2f802122f))
* **docs:** refresh api-spec from zeroroot-ai/sdk@v0.194.0 ([cf68c85](https://github.com/zeroroot-ai/docs-site/commit/cf68c857ae8072ca69328412670902dde40098a5))
* **docs:** refresh api-spec from zeroroot-ai/sdk@v0.196.1 ([d50f035](https://github.com/zeroroot-ai/docs-site/commit/d50f0359ea4dca01ec57388c55a8f908e6284937))
* **docs:** refresh cli-spec ([#70](https://github.com/zeroroot-ai/docs-site/issues/70)) ([34ea692](https://github.com/zeroroot-ai/docs-site/commit/34ea6925d6c4545070c8029b70e57338fdcc86ff))
* **docs:** refresh cli-spec ([#76](https://github.com/zeroroot-ai/docs-site/issues/76)) ([bf59e89](https://github.com/zeroroot-ai/docs-site/commit/bf59e89296e134b223990743c8e72d51d74b1d8a))
* **docs:** refresh cli-spec from zeroroot-ai/adk@v0.112.0 ([34ea692](https://github.com/zeroroot-ai/docs-site/commit/34ea6925d6c4545070c8029b70e57338fdcc86ff))
* **docs:** refresh cli-spec from zeroroot-ai/adk@v0.112.2 ([bf59e89](https://github.com/zeroroot-ai/docs-site/commit/bf59e89296e134b223990743c8e72d51d74b1d8a))

## [0.6.13](https://github.com/zeroroot-ai/docs-site/compare/docs-site-v0.6.12...docs-site-v0.6.13) (2026-10-01)


### Bug Fixes

* **release:** image-tag.env annotation block form (unblocks the fan-out) ([#55](https://github.com/zeroroot-ai/docs-site/issues/55)) ([4ac6b5c](https://github.com/zeroroot-ai/docs-site/commit/4ac6b5c3a9e43ad6cf32180099b9fc80cab90cdb))
* **release:** move image-tag.env annotation to block form ([4ac6b5c](https://github.com/zeroroot-ai/docs-site/commit/4ac6b5c3a9e43ad6cf32180099b9fc80cab90cdb))

## [0.6.12](https://github.com/zeroroot-ai/docs-site/compare/docs-site-v0.6.11...docs-site-v0.6.12) (2026-10-01)


### Documentation

* **ontology:** link the domain-packs page from Related ([#52](https://github.com/zeroroot-ai/docs-site/issues/52)) ([9ae6bb3](https://github.com/zeroroot-ai/docs-site/commit/9ae6bb30ce69eba11181ba64673eb0210d1f9a9c))

## [0.6.11](https://github.com/zeroroot-ai/docs-site/compare/docs-site-v0.6.10...docs-site-v0.6.11) (2026-09-30)


### Bug Fixes

* **image:** bump the nginx runner base, libexpat 2.8.5 closes CVE-2026-93990 ([#49](https://github.com/zeroroot-ai/docs-site/issues/49)) ([6bc709f](https://github.com/zeroroot-ai/docs-site/commit/6bc709f271a1b80cbe3378b34584f9fa7f7d3938))

## [0.6.10](https://github.com/zeroroot-ai/docs-site/compare/docs-site-v0.6.9...docs-site-v0.6.10) (2026-09-30)


### Documentation

* **domain-packs:** add the domain-packs page (fixes /docs/domain-packs 404) ([#47](https://github.com/zeroroot-ai/docs-site/issues/47)) ([7301dcd](https://github.com/zeroroot-ai/docs-site/commit/7301dcda7a4252c069277358218202bf12f0acc3))

## [0.6.9](https://github.com/zeroroot-ai/docs-site/compare/docs-site-v0.6.8...docs-site-v0.6.9) (2026-09-30)


### Bug Fixes

* **ci:** link-check checks only the Markdown a PR touched (.github v0.7.2) ([#44](https://github.com/zeroroot-ai/docs-site/issues/44)) ([bc19841](https://github.com/zeroroot-ai/docs-site/commit/bc19841bf367615258325c59d4b51db75ed8ec47))
* **ci:** pin every zeroroot-ai/.github reference to v0.5.1 ([#36](https://github.com/zeroroot-ai/docs-site/issues/36)) ([f71e034](https://github.com/zeroroot-ai/docs-site/commit/f71e0349b07bed33e35c79ed994f2bff098bd672))
* **ci:** pin the org tree guards to a commit SHA ([#27](https://github.com/zeroroot-ai/docs-site/issues/27)) ([550462c](https://github.com/zeroroot-ai/docs-site/commit/550462cb46722fe2486f883a457520d26e0a134c))
* **deps:** clear both transitive advisories, in both lockfiles ([#29](https://github.com/zeroroot-ai/docs-site/issues/29)) ([a97ef6c](https://github.com/zeroroot-ai/docs-site/commit/a97ef6c85a5a6b4b207ed7d0f6cac1b3096b391b))
* **docs:** generate the licensing table from the LICENSE files ([#30](https://github.com/zeroroot-ai/docs-site/issues/30)) ([2a8ec84](https://github.com/zeroroot-ai/docs-site/commit/2a8ec846944735c0e80195c4913b01d689f6d409))
* **image:** ship the license text and label in the docs-site image ([#31](https://github.com/zeroroot-ai/docs-site/issues/31)) ([a6e0ff3](https://github.com/zeroroot-ai/docs-site/commit/a6e0ff382a8fca5b64cde6bc775b0d41627bc664))
* **rework:** pin every zeroroot-ai/.github reference to v0.4.0 ([#33](https://github.com/zeroroot-ai/docs-site/issues/33)) ([a4b092a](https://github.com/zeroroot-ai/docs-site/commit/a4b092a9592fd1c25e978825daa6421dc0d945e3))


### Documentation

* remove a pre-reset issue reference and use American spelling ([#34](https://github.com/zeroroot-ai/docs-site/issues/34)) ([9fa9bff](https://github.com/zeroroot-ai/docs-site/commit/9fa9bff24d5b56dc909615d9c4eaf7cf0c8bb4ff))


### Miscellaneous

* **deps:** bump nginxinc/nginx-unprivileged ([#25](https://github.com/zeroroot-ai/docs-site/issues/25)) ([339504a](https://github.com/zeroroot-ai/docs-site/commit/339504a8df9ae3c9ce8806a0f45f4a5fb58df57b))
* **deps:** bump node from `2d984a1` to `ef24c50` ([#26](https://github.com/zeroroot-ai/docs-site/issues/26)) ([406afc7](https://github.com/zeroroot-ai/docs-site/commit/406afc73a8cc889297dd067b7ef27e40a9cefc05))
* **docs:** refresh api-spec from zeroroot-ai/sdk@main ([#35](https://github.com/zeroroot-ai/docs-site/issues/35)) ([3048994](https://github.com/zeroroot-ai/docs-site/commit/30489946c2d9a78086d613b0710446065a3e4cab))
* **docs:** refresh api-spec from zeroroot-ai/sdk@main ([#37](https://github.com/zeroroot-ai/docs-site/issues/37)) ([f99f042](https://github.com/zeroroot-ai/docs-site/commit/f99f042a4d78508f93e47134261bac268436adab))
* **docs:** refresh api-spec from zeroroot-ai/sdk@v0.179.0 ([#40](https://github.com/zeroroot-ai/docs-site/issues/40)) ([07b6803](https://github.com/zeroroot-ai/docs-site/commit/07b68032e1e0808913ed823f9ba64aef59b8778e))
* **docs:** refresh cli-spec from zeroroot-ai/adk@main ([#38](https://github.com/zeroroot-ai/docs-site/issues/38)) ([c34ed55](https://github.com/zeroroot-ai/docs-site/commit/c34ed557ff8dd7536b7bb8f318ae47f86f264616))
* **docs:** refresh cli-spec from zeroroot-ai/adk@v0.109.4 ([#41](https://github.com/zeroroot-ai/docs-site/issues/41)) ([3cbd6d4](https://github.com/zeroroot-ai/docs-site/commit/3cbd6d49ce4dc7d36307475b1eb402b05aae8db2))

## [0.6.8](https://github.com/zeroroot-ai/docs-site/compare/docs-site-v0.6.7...docs-site-v0.6.8) (2026-09-09)


### Miscellaneous

* **docs:** refresh api-spec from zeroroot-ai/sdk@v0.177.4 ([#22](https://github.com/zeroroot-ai/docs-site/issues/22)) ([83d6bcc](https://github.com/zeroroot-ai/docs-site/commit/83d6bcc10b01347a3d016abd70cbc2ead99247ca))

## [0.6.7](https://github.com/zeroroot-ai/docs-site/compare/docs-site-v0.6.6...docs-site-v0.6.7) (2026-09-09)


### Miscellaneous

* **guards:** add the tree guards and sweep the dead links out of the docs ([#20](https://github.com/zeroroot-ai/docs-site/issues/20)) ([d01a77f](https://github.com/zeroroot-ai/docs-site/commit/d01a77fb089d874c2028ae28adddfc5e596351f7))

## Changelog

This repository restarted from a fresh baseline on 2026-09-06. Release notes before that date are archived offline and do not resolve on GitHub. release-please adds each release below this line.
