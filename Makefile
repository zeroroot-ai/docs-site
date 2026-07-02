# ============================================================================
# ZeroRoot docs-site — uniform Makefile contract
# ============================================================================
# Implements the org-wide target contract (gibson#171 slice 1.4, enforced by
# the makefile-contract workflow in zeroroot-ai/.github):
#
#     make bootstrap | build | test | check | image
#
# This is a Next.js + fumadocs static docs site with no unit-test suite: the
# production build is the CI gate (see .github/workflows/ci.yml), so `check`
# runs the build and `test` is an explicit no-op rather than a silent lie.
#
# Dev installs use pnpm (mirroring ci.yml); the container image builds with
# npm from the committed package-lock.json (see Dockerfile). @zeroroot-ai/brand
# resolves from GitHub Packages (see .npmrc) — bootstrap and image need
# NODE_AUTH_TOKEN set to a token with read:packages.
# ============================================================================

PNPM ?= pnpm

IMAGE_NAME ?= ghcr.io/zeroroot-ai/docs-site
IMAGE_TAG  ?= dev

.PHONY: all bootstrap build test check image help

all: check ## Default: run the full CI-equivalent gate

bootstrap: ## Install dependencies (mirrors ci.yml's pnpm install)
	$(PNPM) install --ignore-scripts

build: ## Production Next.js build
	$(PNPM) build

test: ## No unit-test suite (static docs site) — the build is the gate; see `check`
	@echo "docs-site has no unit-test suite; 'make check' (the production build) is the gate"

check: build ## CI-equivalent gate (mirrors ci.yml: the production build)

image: ## Build the production container image (npm/package-lock.json path)
	docker build --build-arg NODE_AUTH_TOKEN=$(NODE_AUTH_TOKEN) \
		-t $(IMAGE_NAME):$(IMAGE_TAG) .

help: ## List available targets
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | \
		awk 'BEGIN {FS = ":.*?## "}; {printf "  %-12s %s\n", $$1, $$2}'
