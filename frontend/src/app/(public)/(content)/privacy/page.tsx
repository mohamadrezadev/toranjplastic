import { ManagedPage, managedPageMetadata } from "@/components/content/ManagedPage";

export const generateMetadata = () => managedPageMetadata("privacy", "سیاست حفظ حریم خصوصی");
export default function PrivacyPage() { return <ManagedPage slug="privacy" fallbackTitle="سیاست حفظ حریم خصوصی" />; }
