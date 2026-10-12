export const publicRoutes: ReadonlyArray<{ key: string; label: string; path: string; slug: string; showInNavigation: boolean; state: "ready" | "preparing" }> = [
  { key: "home", label: "خانه", path: "/", slug: "", showInNavigation: true, state: "ready" },
  { key: "products", label: "محصولات", path: "/products", slug: "products", showInNavigation: true, state: "ready" },
  { key: "injection", label: "تزریق پلاستیک", path: "/injection-molding", slug: "injection-molding", showInNavigation: true, state: "ready" },
  { key: "materials", label: "مواد اولیه", path: "/materials", slug: "materials", showInNavigation: true, state: "ready" },
  { key: "articles", label: "مقالات", path: "/articles", slug: "articles", showInNavigation: true, state: "ready" },
  { key: "about", label: "درباره ما", path: "/about", slug: "about", showInNavigation: true, state: "ready" },
  { key: "contact", label: "تماس", path: "/contact", slug: "contact", showInNavigation: true, state: "ready" },
  { key: "privacy", label: "حریم خصوصی", path: "/privacy", slug: "privacy", showInNavigation: false, state: "ready" },
  { key: "terms", label: "شرایط استفاده", path: "/terms", slug: "terms", showInNavigation: false, state: "ready" },
  { key: "inquiry", label: "ثبت استعلام", path: "/inquiry", slug: "inquiry", showInNavigation: false, state: "ready" },
  { key: "account", label: "حساب من", path: "/account", slug: "account", showInNavigation: false, state: "ready" },
];

export type PublicRoute = (typeof publicRoutes)[number];
export type PublicPath = PublicRoute["path"];

export const primaryNavigationRoutes = publicRoutes.filter((route) => route.showInNavigation);
export const inquiryRoute = publicRoutes.find((route) => route.key === "inquiry")!;
export const accountRoute = publicRoutes.find((route) => route.key === "account")!;

export function getPublicRouteBySlug(slug: string) {
  return publicRoutes.find((route) => route.slug === slug && route.path !== "/");
}
