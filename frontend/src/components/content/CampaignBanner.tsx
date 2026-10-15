import Image from "next/image";
import Link from "next/link";
import styles from "./Content.module.css";

type CampaignBannerProps = {
  src: string;
  alt: string;
  href: string;
  actionLabel: string;
  priority?: boolean;
  testId?: string;
};

export function CampaignBanner({ src, alt, href, actionLabel, priority = false, testId }: CampaignBannerProps) {
  return (
    <Link
      className={styles.campaignBanner}
      href={href}
      aria-label={actionLabel}
      data-testid={testId}
    >
      <Image
        className={styles.campaignBannerImage}
        src={src}
        alt={alt}
        width={1122}
        height={1402}
        sizes="(max-width: 608px) calc(100vw - 32px), (max-width: 1024px) 72vw, 680px"
        priority={priority}
      />
    </Link>
  );
}
