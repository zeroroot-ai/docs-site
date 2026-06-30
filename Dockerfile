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

# Stage 2: serve — non-root nginx (user 101 = nginx in nginx:alpine)
FROM nginx:alpine AS runner
RUN chown -R nginx:nginx /var/cache/nginx /var/run /var/log/nginx /usr/share/nginx/html
COPY --from=builder --chown=nginx:nginx /app/out /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
USER nginx
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

