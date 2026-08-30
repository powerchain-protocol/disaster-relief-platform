FROM node:24.20.0-alpine AS base
WORKDIR /app
ARG VCS_REF=unknown
ARG VERSION=1.0.0
LABEL org.opencontainers.image.revision=$VCS_REF org.opencontainers.image.version=$VERSION
RUN corepack enable && corepack prepare pnpm@11.24.0 --activate
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json ./
COPY apps/backend/package.json apps/backend/package.json
COPY packages/api-client/package.json packages/api-client/package.json
COPY packages/api-contract/package.json packages/api-contract/package.json
COPY packages/charts/package.json packages/charts/package.json
COPY packages/fees/package.json packages/fees/package.json
COPY packages/token-factory/package.json packages/token-factory/package.json
COPY packages/utility/package.json packages/utility/package.json
COPY packages/policy/package.json packages/policy/package.json
COPY packages/bridge/package.json packages/bridge/package.json
COPY packages/rewards/package.json packages/rewards/package.json
RUN pnpm install --frozen-lockfile
COPY packages packages
COPY apps/backend apps/backend
RUN pnpm --filter @powerchain/crisis-api... build
EXPOSE 4000
CMD ["node","apps/backend/dist/server.js"]
