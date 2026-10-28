import { ManagedPage, managedPageMetadata } from "@/components/content/ManagedPage";

export const generateMetadata = () => managedPageMetadata("terms", "قوانین و مقررات استفاده");
export default function TermsPage() { return <ManagedPage slug="terms" fallbackTitle="قوانین و مقررات استفاده" />; }
