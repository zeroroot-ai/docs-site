# Stage 1: build
FROM node:22-alpine AS builder
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@latest --activate
# Pass NODE_AUTH_TOKEN for @zeroroot scoped packages from GitHub Packages.
ARG NODE_AUTH_TOKEN
ENV NODE_AUTH_TOKEN=${NODE_AUTH_TOKEN}
COPY package.json .npmrc ./
RUN pnpm install --ignore-scripts
COPY . .
RUN pnpm build

# Stage 2: serve — non-root nginx (user 101 = nginx in nginx:alpine)
FROM nginx:alpine AS runner
RUN chown -R nginx:nginx /var/cache/nginx /var/run /var/log/nginx /usr/share/nginx/html
COPY --from=builder --chown=nginx:nginx /app/out /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
USER nginx
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
