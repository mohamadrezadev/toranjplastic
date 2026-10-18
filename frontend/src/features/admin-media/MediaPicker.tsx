import Link from 'next/link';
import { Select } from '@/components/ui';
import type { AdminMediaAsset } from './types';

export function mediaAssetIdFromPublicUrl(url: string | undefined): string | undefined {
  if (!url) return undefined;
  try {
    const pathname = url.startsWith('/') ? url : new URL(url).pathname;
    const match = pathname.match(/\/api\/v1\/media\/public\/([^/]+)\/(?:thumb|card|detail)$/);
    return match?.[1] ? decodeURIComponent(match[1]) : undefined;
  } catch {
    return undefined;
  }
}

export function MediaPicker({
  name,
  label,
  assets,
  defaultValue,
}: {
  name: string;
  label: string;
  assets: AdminMediaAsset[];
  defaultValue?: string;
}) {
  return (
    <div>
      <Select name={name} label={label} defaultValue={defaultValue ?? ''}>
        <option value="">استفاده از آدرس قدیمی / بدون تصویر</option>
        {assets.filter((asset) => asset.status === 'READY').map((asset) => (
          <option key={asset.id} value={asset.id}>{asset.defaultAlt ?? asset.id}</option>
        ))}
      </Select>
      <small><Link href="/admin/media">مدیریت و بارگذاری رسانه‌ها</Link></small>
    </div>
  );
}
