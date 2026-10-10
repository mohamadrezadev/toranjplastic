# معماری پایه

```text
Browser / PWA
    |
    v
frontend (Next.js, RTL, public + portal + admin shells)
    | HTTPS / JSON / api-v1
    v
backend (NestJS modular monolith)
    | Prisma
    v
PostgreSQL        Private object storage (از فاز درخواست‌ها)
```

مرزهای ماژول پیشنهادی backend برای فازهای بعد: Identity، Catalog، Content، Inquiries، Quotations، Files، Users/Authorization، Settings و Audit. این‌ها یک process و deployment دارند، ولی قرارداد و مالکیت داده داخلی‌شان جداست.

frontend سه layout خواهد داشت: Public، Customer Portal و Admin Workspace. primitives و tokenها مشترک‌اند؛ navigation و density مستقل است. هیچ business authorization فقط با مخفی‌کردن UI حل نمی‌شود.
