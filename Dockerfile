# Stage 1: build
#
# pnpm with the committed pnpm-lock.yaml, the SAME lockfile ci.yml installs
# from and the Makefile `bootstrap` target names. @zeroroot-ai/brand comes from
# registry.npmjs.org (attic#17), so no registry credential is involved.
#
# This used to be `npm ci` against a second lockfile, package-lock.json, and
# that file is why the image build was broken for days. Nothing updated it: CI
# runs pnpm, the Makefile runs pnpm, and `packageManager` pins pnpm, so a
# dependency bump moved package.json and pnpm-lock.yaml together and left
# package-lock.json a version behind. `npm ci` then refused the tree —
# "lock file's next@16.3.4 does not satisfy next@16.3.6" (#46 bumped next,
# the image has failed every build since). A lockfile that no toolchain in the
# repo maintains cannot stay in sync, so there is one lockfile now and it is
# the one CI verifies.
FROM node:26-alpine@sha256:0b36e8c136b94cd4fcf02188228e76c31ad5872eef3fec8cbd2eee500cfd9e80 AS builder
WORKDIR /app
# pnpm-workspace.yaml is not optional here: pnpm 10 moved `overrides` out of
# package.json into it, and the lockfile records them. Without it
# --frozen-lockfile refuses the tree with "the current overrides configuration
# doesn't match the value found in the lockfile".
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
# pnpm comes from tools/pnpm, hash pinned: `npm ci` installs the one version
# tools/pnpm/package-lock.json records and verifies every tarball against the
# integrity hash in that lockfile (the zerocool-plugins pattern). Not
# `corepack enable`: node:26-alpine ships no corepack (Node 25 removed it), and
# the build failed with "corepack: not found". Not `npm i -g pnpm@<version>`
# either: that pins a version and no hash, and Scorecard flags it
# (PinnedDependenciesID, #45).
COPY tools/pnpm/package.json tools/pnpm/package-lock.json /opt/pnpm/
RUN cd /opt/pnpm \
 && npm ci --omit=dev --no-audit --no-fund \
 && ln -s /opt/pnpm/node_modules/.bin/pnpm /usr/local/bin/pnpm
# The installed pnpm must be the one package.json's `packageManager` names.
# pnpm self-switches to the `packageManager` version when they differ
# (manage-package-manager-versions), which would download an unpinned pnpm
# and defeat the hash pin above. So a bump to one file without the other
# fails here, before any install runs.
RUN want="$(node -p "require('./package.json').packageManager.split('@')[1]")" \
 && have="$(node -p "require('/opt/pnpm/node_modules/pnpm/package.json').version")" \
 && if [ "$have" != "$want" ]; then \
      echo "tools/pnpm installs pnpm $have but package.json packageManager names pnpm $want" >&2; \
      exit 1; \
    fi \
 && pnpm --version
RUN pnpm install --frozen-lockfile --ignore-scripts
COPY . .
RUN pnpm build

# Stage 2: serve
#
# nginx-unprivileged, not plain nginx with `USER nginx`. The previous form
# could never start: the deploy chart runs this pod as uid 101 with no
# NET_BIND_SERVICE, and a non-root process cannot bind a privileged port, so
# nginx died on startup with
#   [emerg] bind() to 0.0.0.0:80 failed (13: Permission denied)
# and the docs vhost answered 503. The unprivileged image is built for exactly
# this: it owns its own cache/run paths and defaults to :8080.
#
# alpine-slim, not alpine: the full image adds the geoip, image-filter, njs
# and xslt modules, and nginx.conf loads none of them. image-filter pulls in
# libgd and libpng, and libpng was the image's open Trivy alert
# (CVE-2026-46675, #45): no `:alpine` digest carried the fixed 1.6.59-r0 yet.
# The slim image ships the same nginx, the same entrypoint scripts (envsubst
# on templates, /docker-entrypoint.d) and no libpng at all.
FROM nginxinc/nginx-unprivileged:alpine-slim@sha256:c81a27f28bc2d9c2da8998444e653c7b85b9bbbaa92e44ef18d8920784e06507 AS runner
# Recreate the html tree owned by the runtime uid: the base image ships
# /usr/share/nginx/html owned by root (with a stock 50x.html), and
# 40-substitute-origins.sh sed-edits in place as uid 101 — sed's temp file
# needs WRITE ON THE DIRECTORY, which COPY --chown alone does not grant
# (it chowns the copied entries, not the pre-existing dir). Without this the
# container fails startup on-cluster with EACCES (#23, same as www#17).
USER root
RUN rm -rf /usr/share/nginx/html && install -d -o 101 -g 101 /usr/share/nginx/html
USER 101
COPY --from=builder --chown=101:101 /app/out /usr/share/nginx/html
# Runs before nginx starts (stock entrypoint executes /docker-entrypoint.d/*.sh
# in lexical order): substitutes the __APP_ORIGIN__/__WWW_ORIGIN__ sentinels
# that the rehype pass baked into functional cross-surface links
# (scripts/rehype-env-origin-links.mjs) with this environment's origins,
# defaulting to prod (docs-site#19).
COPY --chmod=755 docker/40-substitute-origins.sh /docker-entrypoint.d/40-substitute-origins.sh
# templates/ (not conf.d/): the entrypoint runs envsubst over
# /etc/nginx/templates/*.template, which is what substitutes ${NGINX_PORT}
# in nginx.conf. Copying to conf.d/ would ship the literal directive.
COPY nginx.conf /etc/nginx/templates/default.conf.template
# The Elastic License 2.0 requires the notice to travel with a
# distribution, and a published image is one. /licenses is the OCI
# convention, and this is the last COPY so it does not bust the cache.
COPY LICENSE /licenses/LICENSE
ENV NGINX_PORT=8080
EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]

