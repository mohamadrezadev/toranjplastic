import { ManagedPage, managedPageMetadata } from "@/components/content/ManagedPage";

export const generateMetadata = () => managedPageMetadata("terms", "شرایط استفاده");
export default function TermsPage() { return <ManagedPage slug="terms" fallbackTitle="شرایط استفاده" />; }
