import { ManagedPage, managedPageMetadata } from "@/components/content/ManagedPage";

export const generateMetadata = () => managedPageMetadata("about", "درباره ما");
export default function AboutPage() { return <ManagedPage slug="about" fallbackTitle="درباره ما" />; }
