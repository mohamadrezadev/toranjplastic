# ADR-0001 — pnpm monorepo با backend ماژولار

Status: Accepted
Date: 2026-10-10

## Decision

یک pnpm workspace با دو application مستقل `frontend/` و `backend/` انتخاب شد. backend یک NestJS modular monolith است و PostgreSQL/Prisma را مالک است؛ frontend هیچ import runtime از backend یا دسترسی مستقیم دیتابیس ندارد.

## Why

این تصمیم دقیقاً با handoff منطبق است، توسعه و deploy مستقل UI/API را حفظ می‌کند، و برای اندازه v1 از پیچیدگی microservice جلوگیری می‌کند. workspace واحد کیفیت، نسخه‌ها و onboarding را یکپارچه نگه می‌دارد.

## Consequences

قرارداد HTTP باید explicit و versioned باشد. مرز ماژول‌های backend باید در code review enforce شود. استخراج سرویس مستقل فقط با ADR و شواهد scaling/ownership مجاز است.
