# ترنج پلاستیک

Monorepo مشخصات‌محور وب‌سایت فارسی و RTL ترنج پلاستیک. فرانت‌اند و بک‌اند مستقل‌اند، اما dependency و quality gate مشترک دارند.

## ساختار

```text
frontend/             Next.js public site, portal and admin UI
backend/              NestJS modular monolith and Prisma
openspec/             OpenSpec source-of-truth specs and change artifacts
docs/                 architecture, handoff review and ADRs
compose.yaml          local PostgreSQL
```

## شروع محلی

پیش‌نیاز: Node.js 24.11+، pnpm 9.15+ و Docker.

```bash
cp .env.example .env
docker compose up -d postgres
pnpm install
pnpm db:generate
pnpm dev
```

- Frontend: `http://localhost:3000`
- Backend health: `http://localhost:3001/api/v1/health`

روی PowerShell به‌جای `cp` از `Copy-Item .env.example .env` استفاده کنید. برای اجرای همه gateها: `pnpm check`.

قبل از توسعه قابلیت جدید، [OpenSpec](openspec/config.yaml) و [قوانین پروژه](AGENTS.md) را بخوانید. چرخه رسمی پروژه `explore → propose → review → apply → archive` است.
