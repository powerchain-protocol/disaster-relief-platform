FROM node:24.20.0-alpine AS base
WORKDIR /app
ARG VCS_REF=unknown
ARG VERSION=1.0.0
LABEL org.opencontainers.image.revision=$VCS_REF org.opencontainers.image.version=$VERSION
RUN corepack enable && corepack prepare pnpm@11.24.0 --activate
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json ./
COPY apps/web/package.json apps/web/package.json
COPY packages/api-client/package.json packages/api-client/package.json
COPY packages/api-contract/package.json packages/api-contract/package.json
RUN pnpm install --frozen-lockfile
COPY packages/api-contract packages/api-contract
COPY packages/api-client packages/api-client
COPY apps/web apps/web
RUN pnpm --filter @powerchain/crisis-web... build
EXPOSE 3000
CMD ["pnpm","--filter","@powerchain/crisis-web","start"]
