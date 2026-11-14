import { Footer, Header } from "@/components/navigation";
import ContentNotFound from "./(public)/(content)/not-found";

/*
 * Root not-found for URLs that match no route (OpenSpec change
 * rebuild-ui-with-astryx, owner decision OD-8, option B). The public layout
 * does not apply to a root not-found, so the shared Persian not-found content
 * is composed inside the public header and footer. Next adds `noindex` and the
 * 404 status itself.
 */
export default function RootNotFound() {
  return <><Header /><div><ContentNotFound /></div><Footer /></>;
}
