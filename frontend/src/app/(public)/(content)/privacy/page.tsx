import { ManagedPage, managedPageMetadata } from "@/components/content/ManagedPage";

export const generateMetadata = () => managedPageMetadata("privacy", "حریم خصوصی");
export default function PrivacyPage() { return <ManagedPage slug="privacy" fallbackTitle="حریم خصوصی" />; }
