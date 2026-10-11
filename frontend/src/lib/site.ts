const localOrigin = "http://localhost:3000";

function parseOrigin(value: string | undefined) {
  try {
    return new URL(value || localOrigin).origin;
  } catch {
    return localOrigin;
  }
}

export const siteOrigin = parseOrigin(process.env.NEXT_PUBLIC_SITE_URL);
export const siteName = "ترنج پلاستیک";
export const absoluteUrl = (path: string) => new URL(path, `${siteOrigin}/`).toString();
