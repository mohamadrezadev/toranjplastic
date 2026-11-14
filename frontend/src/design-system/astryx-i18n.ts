import type { Overrides } from "@astryxdesign/core/i18n";

/**
 * Persian strings for the public Astryx components used by Toranj Plastic.
 * Astryx does not currently ship a fa-IR catalog, so the provider falls back
 * to English unless these sparse, product-owned overrides are supplied.
 */
export const astryxPersianOverrides = {
  "fa-IR": {
    "@astryx.field.required": "الزامی",
    "@astryx.field.optional": "اختیاری",
    "@astryx.field.labelTooltip": "دربارهٔ {label}",
    "@astryx.spinner.loading": "در حال بارگذاری",
    "@astryx.switch.loading": "در حال بارگذاری",
    "@astryx.textInput.clearLabel": "پاک‌کردن {label}",
    "@astryx.textArea.counter": "{count, number} از {limit, number}",
    "@astryx.textArea.charactersRemaining": "{count, number} نویسه باقی مانده",
    "@astryx.textArea.charactersOverLimit": "{count, number} نویسه بیشتر از حد مجاز",
    "@astryx.banner.dismiss": "بستن",
    "@astryx.banner.dismissTitled": "{dismiss} {title}",
    "@astryx.banner.collapse": "جمع‌کردن",
    "@astryx.banner.expand": "بازکردن",
    "@astryx.dialog.close": "بستن",
    "@astryx.mobileNav.closeNavigation": "بستن فهرست",
    "@astryx.mobileNav.toggle.open": "بازکردن فهرست",
    "@astryx.topNav.landmarkLabel": "ناوبری اصلی",
    "@astryx.sideNav.label": "ناوبری بخش‌ها",
    "@astryx.breadcrumbs.label": "مسیر راهنما",
    "@astryx.pagination.label": "صفحه‌بندی",
    "@astryx.pagination.previous": "رفتن به صفحهٔ قبل",
    "@astryx.pagination.next": "رفتن به صفحهٔ بعد",
    "@astryx.pagination.previousBy": "رفتن به {step, number} صفحه قبل",
    "@astryx.pagination.nextBy": "رفتن به {step, number} صفحه بعد",
    "@astryx.pagination.first": "رفتن به صفحهٔ نخست",
    "@astryx.pagination.last": "رفتن به صفحهٔ آخر",
    "@astryx.pagination.goToPage": "رفتن به صفحهٔ {page, number}",
    "@astryx.pagination.goToPageInput": "رفتن به صفحه",
    "@astryx.pagination.pageLabel": "صفحه",
    "@astryx.pagination.ofTotalPages": "از {total, number}",
    "@astryx.pagination.pageIndicators": "نشانگرهای صفحه",
    "@astryx.pagination.itemsPerPage": "تعداد در هر صفحه",
    "@astryx.pagination.count": "{from, number} تا {to, number} از {total, number}",
    "@astryx.pagination.pageOfTotal": "صفحهٔ {current, number} از {total, number}",
    "@astryx.pagination.pageAnnounce": "صفحهٔ {current, number}",
    // Public content layer (Link, MetadataList); task 5.3.
    "@astryx.link.newTab": "(در برگهٔ تازه باز می‌شود)",
    "@astryx.metadataList.showMore": "نمایش بیشتر",
    "@astryx.metadataList.showLess": "نمایش کمتر",
    // Article category TabList (task 5.3): the visual-only arrow-key hint shown on
    // first keyboard focus ("← → to navigate") and the fallback list name.
    "@astryx.keyboardHint.toNavigate": "برای جابه‌جایی",
    "@astryx.tabList.label": "زبانه‌ها",
  },
} satisfies Overrides;
