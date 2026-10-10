## 1. پیش‌نیازها و زیرساخت آزمون

- [ ] 1.1 وضعیت change فاز صفر (`initialize-project-foundation`) را با پیاده‌سازی فعلی تطبیق دهید و شکاف باقی‌مانده‌ی بررسی بصری را ثبت کنید.
- [ ] 1.2 وابستگی‌ها و پیکربندی آزمون کامپوننت فرانت‌اند را با Vitest، jsdom، Testing Library و assertionهای دسترس‌پذیری اضافه کنید و یک فرمان مستقل برای اجرای آن‌ها بسازید.
- [ ] 1.3 Playwright را برای Chromium، اجرای خودکار web server و viewportهای 360، 390، 768 و 1280 پیکربندی کنید و نصب مرورگر را در CI نگه دارید.

## 2. توکن‌ها و مرزبندی لایه‌ها

- [ ] 2.1 `frontend/src/design-system/tokens.css` را با توکن‌های معنایی رنگ، تایپوگرافی، فاصله، شعاع، اندازه کنترل، border، elevation، focus، motion و container توسعه دهید؛ موقت‌بودن هویت بصری را مستند و رنگ‌های accent را از status جدا کنید.
- [ ] 2.2 ساختار و public exportهای `components/ui`، `components/feedback` و `components/navigation` را ایجاد کنید و وابستگی مستقیم این لایه‌ها به API، داده دامنه و صفحات را ممنوع نگه دارید.
- [ ] 2.3 آزمون‌ها یا کنترل‌های ایستا برای استفاده از توکن‌ها، رفتار RTL پیش‌فرض، utility محدود LTR و احترام به `prefers-reduced-motion` اضافه کنید.

## 3. کامپوننت‌های پایه رابط کاربری

- [ ] 3.1 کامپوننت `Button` را با variantهای primary، secondary، ghost و danger و حالت‌های normal، hover، focus، loading و disabled پیاده‌سازی کنید؛ semantic بومی، حداقل سطح لمس 44×44 و جلوگیری از activation تکراری را آزمون کنید.
- [ ] 3.2 ساختار مشترک field و کامپوننت‌های `Input`، `Textarea` و `Select` را با label، help، required، error، readonly و disabled پیاده‌سازی و ارتباط صحیح شناسه‌های دسترس‌پذیری را آزمون کنید.
- [ ] 3.3 کامپوننت‌های `Checkbox`، `Radio` و `Switch` را بر پایه کنترل‌های بومی پیاده‌سازی و رفتار keyboard، focus، checked و disabled آن‌ها را آزمون کنید.
- [ ] 3.4 utility یا primitive محدود برای نمایش شناسه‌ها و مقادیر LTR در متن RTL اضافه کنید و عدم برهم‌خوردن ترتیب دیداری و دسترسی‌پذیری را آزمون کنید.
- [ ] 3.5 کنترل‌های صفحه فاز صفر را بدون افزودن رفتار یا دامنه محصول جدید به primitiveهای طراحی‌شده منتقل کنید.

## 4. الگوهای بازخورد رابط کاربری

- [ ] 4.1 `Alert` را با variantهای info، success، warning و danger پیاده‌سازی کنید؛ معنا را علاوه بر رنگ با متن/نشانه منتقل و رفتار live region را آزمون کنید.
- [ ] 4.2 `LoadingState` را با `aria-busy` و فضای پایدار پیاده‌سازی کنید تا در بارگذاری باعث پرش غیرضروری layout نشود.
- [ ] 4.3 `EmptyState` را با عنوان، توضیح و action اختیاری پیاده‌سازی کنید و تنها مقصدها یا callbackهای معتبر را بپذیرید.
- [ ] 4.4 `ErrorState` را با پیام امن، recovery اختیاری و retry صریح پیاده‌سازی کنید؛ retry خودکار عملیات non-idempotent را مجاز نکنید.
- [ ] 4.5 آزمون‌های feedback را برای announcement، مدیریت focus، عدم اتکای صرف به رنگ و نبود داده حساس، یادداشت داخلی یا افشای وضعیت منابع تکمیل کنید.

## 5. پوسته عمومی واکنش‌گرا

- [ ] 5.1 یک registry تایپ‌شده برای مسیرهای عمومی خانه، محصولات، تزریق پلاستیک، مواد اولیه، مقالات، درباره ما، تماس، استعلام و ورود/ثبت‌نام ایجاد کنید؛ لینک خالی، `#` و مقصد نامعتبر را حذف کنید.
- [ ] 5.2 برای مقصدهای تأییدشده‌ای که هنوز محتوا ندارند صفحه shell-only با متن «در حال آماده‌سازی» و metadata دارای `noindex` بسازید، بدون افزودن محتوای فرضی یا قابلیت فروشگاهی.
- [ ] 5.3 Header دسکتاپ را server-rendered و MobileNavigation را به‌صورت client island پیاده‌سازی کنید؛ `aria-expanded`، انتقال و بازگشت focus، بستن با Escape و غیرفعال‌شدن پس‌زمینه را آزمون کنید.
- [ ] 5.4 `Footer` را فقط با اطلاعات تماس تأییدشده یا placeholder صریح و `Breadcrumb` را با ساختار معنایی و `aria-current` پیاده‌سازی کنید.
- [ ] 5.5 layout عمومی RTL را زیر `app/(public)` ایجاد کنید، Header و Footer را در آن ترکیب کنید و صفحه خانه فاز صفر را بدون تغییر دامنه به این layout منتقل کنید.
- [ ] 5.6 آزمون‌های یکپارچه پوسته را برای navigation، footer، breadcrumb، مقصدهای معتبر، metadata موقت و نبود actionهای commerce تکمیل کنید.

## 6. آزمون مرورگر و یکپارچه‌سازی CI

- [ ] 6.1 آزمون Playwright برای viewportهای 360، 390، 768 و 1280 بنویسید که نبود horizontal overflow، نمایش صحیح navigation موبایل/دسکتاپ و پایداری layout را بررسی کند.
- [ ] 6.2 جریان کامل keyboard برای drawer موبایل، focus return، inert بودن پس‌زمینه و متن‌های طولانی فارسی همراه با مقادیر LTR را در مرورگر آزمون کنید.
- [ ] 6.3 وضعیت HTTP مقصدهای navigation و `noindex` بودن صفحات موقت را در آزمون end-to-end بررسی کنید.
- [ ] 6.4 فرمان‌های e2e را به workspace ریشه و CI اضافه کنید تا Chromium پس از lint، typecheck، unit test و build اجرا شود.

## 7. اعتبارسنجی و تحویل

- [ ] 7.1 مجموعه کامل lint، typecheck، unit/component test، build و Playwright را اجرا و نتیجه را در handoff این change ثبت کنید.
- [ ] 7.2 بازبینی دستی visual و accessibility را انجام دهید، موارد حل‌نشده برند/محتوا را ثبت کنید و تأیید کنید این change هیچ تغییر backend، schema، secret یا داده خصوصی ایجاد نکرده است.
- [ ] 7.3 change را با `openspec validate build-design-system-foundation --strict` اعتبارسنجی و آماده ورود به مرحله apply کنید.
