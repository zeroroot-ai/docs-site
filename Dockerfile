# Stage 1: build
# Use npm (has package-lock.json) instead of pnpm so NODE_AUTH_TOKEN is
# expanded correctly in .npmrc for the private @zeroroot-ai/brand package.
# pnpm ignores project-level .npmrc auth tokens that reference env vars as
# a security measure (they could leak to attacker-controlled registries).
FROM node:22-alpine AS builder
WORKDIR /app
# Pass NODE_AUTH_TOKEN for @zeroroot scoped packages from GitHub Packages.
ARG NODE_AUTH_TOKEN
ENV NODE_AUTH_TOKEN=${NODE_AUTH_TOKEN}
COPY package.json package-lock.json .npmrc ./
RUN npm ci --ignore-scripts
COPY . .
RUN npm run build

# Stage 2: serve
#
# nginx-unprivileged, not plain nginx with `USER nginx`. The previous form
# could never start: the deploy chart runs this pod as uid 101 with no
# NET_BIND_SERVICE, and a non-root process cannot bind a privileged port, so
# nginx died on startup with
#   [emerg] bind() to 0.0.0.0:80 failed (13: Permission denied)
# and the docs vhost answered 503. The unprivileged image is built for exactly
# this: it owns its own cache/run paths and defaults to :8080.
FROM nginxinc/nginx-unprivileged:alpine AS runner
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
ENV NGINX_PORT=8080
EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]

