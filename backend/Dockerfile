FROM node:24-alpine AS builder

RUN apk add --no-cache libc6-compat python3 make g++

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@9.15.9 --activate

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
COPY backend/package.json ./backend/

RUN pnpm --filter backend install --frozen-lockfile

COPY backend ./backend

WORKDIR /app/backend

RUN pnpm db:generate
RUN pnpm build

FROM node:24-alpine AS runner

RUN apk add --no-cache libc6-compat

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@9.15.9 --activate

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
COPY backend/package.json ./backend/

RUN pnpm --filter backend install --prod --frozen-lockfile

COPY --from=builder /app/backend/dist ./backend/dist
COPY --from=builder /app/backend/src/generated ./backend/src/generated
COPY backend/prisma ./backend/prisma
COPY backend/prisma7.config.ts ./backend/prisma7.config.ts

ENV NODE_ENV=production
ENV PORT=3001

EXPOSE 3001

WORKDIR /app/backend

CMD ["pnpm", "start:prod"]
