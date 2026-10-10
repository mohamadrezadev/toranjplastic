export const publicRoutes = [
  { key: "home", label: "خانه", path: "/", slug: "", showInNavigation: true, state: "ready" },
  { key: "products", label: "محصولات", path: "/products", slug: "products", showInNavigation: true, state: "preparing" },
  { key: "injection", label: "تزریق پلاستیک", path: "/injection-molding", slug: "injection-molding", showInNavigation: true, state: "preparing" },
  { key: "materials", label: "مواد اولیه", path: "/materials", slug: "materials", showInNavigation: true, state: "preparing" },
  { key: "articles", label: "مقالات", path: "/articles", slug: "articles", showInNavigation: true, state: "preparing" },
  { key: "about", label: "درباره ما", path: "/about", slug: "about", showInNavigation: true, state: "preparing" },
  { key: "contact", label: "تماس", path: "/contact", slug: "contact", showInNavigation: true, state: "preparing" },
  { key: "inquiry", label: "ثبت استعلام", path: "/inquiry", slug: "inquiry", showInNavigation: false, state: "preparing" },
  { key: "account", label: "ورود / ثبت‌نام", path: "/account", slug: "account", showInNavigation: false, state: "preparing" },
] as const;

export type PublicRoute = (typeof publicRoutes)[number];
export type PublicPath = PublicRoute["path"];

export const primaryNavigationRoutes = publicRoutes.filter((route) => route.showInNavigation);
export const inquiryRoute = publicRoutes.find((route) => route.key === "inquiry")!;
export const accountRoute = publicRoutes.find((route) => route.key === "account")!;

export function getPublicRouteBySlug(slug: string) {
  return publicRoutes.find((route) => route.slug === slug && route.path !== "/");
}
