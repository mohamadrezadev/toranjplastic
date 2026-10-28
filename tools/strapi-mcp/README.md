# Toranj Plastic — Strapi MCP Server (Model Context Protocol)

این پکیج یک سرور استاندارد **Model Context Protocol (MCP)** است که به ایجنت‌های هوش مصنوعی (مثل Claude, Cursor, Antigravity یا هر کلاینت سازگار با MCP) اجازه می‌دهد مستقیماً به پنل تحریریه **Strapi v5** ترنج پلاستیک متصل شوند و مقالات تخصصی، اخبار و یادداشت‌های فنی را به‌طور خودکار بنویسند، مدیریت و منتشر کنند.

---

## ۱. ابزارهای ارائه‌شده به ایجنت (Tools)

1. `strapi_list_categories`:
   - دریافت دسته‌بندی‌های فعال (مانند «فناوری و تولید») جهت اختصاص هوشمند مقاله.
2. `strapi_list_tags`:
   - دریافت تگ‌های موجود (مانند «تزریق پلاستیک»).
3. `strapi_search_articles`:
   - جستجو در مقالات پیشین با کلمه کلیدی یا عبارت، جهت ممانعت از تکرار عنوان و رعایت استراتژی سئو.
4. `strapi_create_article`:
   - نگارش، ثبت و انتشار مقاله جدید با پشتیبانی از فیلدهای:
     - `title` (عنوان فارسی جذاب)
     - `slug` (اسلاگ انگلیسی سئومحور)
     - `summary` (خلاصه جذاب در ۱-۲ جمله)
     - `body` (متن غنی با تیترهای H2/H3، پاراگراف‌ها و اصطلاحات تخصصی تزریق پلاستیک)
     - `categoryDocumentId` (دسته‌بندی مربوطه)
     - `tagDocumentIds` (برچسب‌ها)
     - `status`: `'published'` (انتشار آنی در سایت) یا `'draft'` (پیش‌نویس جهت تایید مدیر)
     - `seo`: متاتایتل و متادیسکریپشن برای گوگل.
5. `strapi_delete_article`:
   - حذف یا آرشیو مقاله با شناسه `documentId`.

---

## ۲. نحوه اتصال به ابزارهای هوش مصنوعی

### در Claude Desktop یا Cursor:
در فایل تنظیمات MCP (مثلاً `claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "toranj-strapi": {
      "command": "node",
      "args": [
        "c:/project/toranjplastic/tools/strapi-mcp/dist/index.js"
      ],
      "env": {
        "STRAPI_URL": "http://localhost:1337"
      }
    }
  }
}
```

---

## ۳. دستور اجرای تست خودکار

برای تست زنده ارتباط سرور و انتشار یک مقاله تستی توسط ایجنت:

```bash
node tools/strapi-mcp/test-client.mjs
```
