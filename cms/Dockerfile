FROM node:24-alpine AS builder

RUN apk add --no-cache libc6-compat python3 make g++

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@9.15.9 --activate

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
COPY cms/package.json ./cms/

RUN pnpm --filter cms install --frozen-lockfile

COPY cms ./cms

RUN pnpm --filter cms build

FROM node:24-alpine AS runner

RUN apk add --no-cache libc6-compat wget

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@9.15.9 --activate

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
COPY cms/package.json ./cms/
COPY cms/tsconfig.json ./cms/

RUN pnpm --filter cms install --prod --frozen-lockfile

COPY --from=builder /app/cms/dist ./cms/dist
COPY --from=builder /app/cms/public ./cms/public

ENV NODE_ENV=production
ENV PORT=1337

EXPOSE 1337

WORKDIR /app/cms

CMD ["pnpm", "start"]
