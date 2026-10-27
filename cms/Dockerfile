FROM node:24-alpine AS runner

RUN apk add --no-cache libc6-compat wget

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@9.15.9 --activate

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
COPY cms/package.json ./cms/

RUN pnpm --filter cms install --frozen-lockfile

COPY cms ./cms

RUN pnpm --filter cms build

ENV NODE_ENV=production
ENV PORT=1337

EXPOSE 1337

WORKDIR /app/cms

CMD ["pnpm", "start"]
