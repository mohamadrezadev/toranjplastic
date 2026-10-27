FROM node:24-alpine AS builder

RUN apk add --no-cache libc6-compat

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@9.15.9 --activate

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
COPY frontend/package.json ./frontend/

RUN pnpm --filter frontend install --frozen-lockfile

COPY frontend ./frontend

WORKDIR /app/frontend

ARG NEXT_PUBLIC_API_URL
ARG BACKEND_API_URL
ARG STRAPI_API_URL
ARG MEDIA_PUBLIC_ORIGIN
ARG STRAPI_MEDIA_ORIGIN

ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

RUN pnpm build

FROM node:24-alpine AS runner

RUN apk add --no-cache libc6-compat

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@9.15.9 --activate

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
COPY frontend/package.json ./frontend/

RUN pnpm --filter frontend install --prod --frozen-lockfile

COPY --from=builder /app/frontend/.next ./frontend/.next
COPY --from=builder /app/frontend/public ./frontend/public
COPY frontend/next.config.ts ./frontend/next.config.ts

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

WORKDIR /app/frontend

CMD ["pnpm", "start"]
