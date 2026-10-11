import type { ContentStatus } from "@/lib/admin-content";
import styles from "../Admin.module.css";

const labels: Record<ContentStatus, string> = { DRAFT: "پیش‌نویس", PUBLISHED: "منتشرشده", ARCHIVED: "آرشیوشده" };
const classes: Record<ContentStatus, string> = { DRAFT: styles.badgeDraft, PUBLISHED: styles.badgePublished, ARCHIVED: styles.badgeArchived };

export function StatusBadge({ status }: { status: ContentStatus }) {
  return <span className={[styles.badge, classes[status]].join(" ")}>{labels[status]}</span>;
}
