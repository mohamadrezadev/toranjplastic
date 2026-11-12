import type { ContentStatus } from "@/features/admin-content/shared";
import { StatusBadge as SharedStatusBadge, type StatusBadgeTone } from "@/components/ui";

const labels: Record<ContentStatus, string> = { DRAFT: "پیش‌نویس", PUBLISHED: "منتشرشده", ARCHIVED: "آرشیوشده" };
const tones: Record<ContentStatus, StatusBadgeTone> = { DRAFT: "warning", PUBLISHED: "neutral", ARCHIVED: "neutral" };

export function StatusBadge({ status }: { status: ContentStatus }) {
  return <SharedStatusBadge label={labels[status]} tone={tones[status]} />;
}
