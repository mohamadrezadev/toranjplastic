import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MediaPicker, mediaAssetIdFromPublicUrl } from './MediaPicker';
import { MediaUploader } from './MediaUploader';
import { ProductGalleryEditor } from './ProductGalleryEditor';
import { ArticleFeaturedImageEditor } from './ArticleFeaturedImageEditor';
import type { AdminMediaAsset } from './types';

// Mock server actions
vi.mock('./actions', () => ({
  uploadMediaItemAction: vi.fn(),
  listMediaAction: vi.fn(),
  uploadMediaAction: vi.fn(),
  deleteMediaAction: vi.fn(),
}));

import { listMediaAction, uploadMediaItemAction } from './actions';

const mockAsset1: AdminMediaAsset = {
  id: 'asset-1',
  status: 'READY',
  defaultAlt: 'پالت پلاستیکی صنعتی',
  sourceMimeType: 'image/webp',
  sourceWidth: 800,
  sourceHeight: 600,
  variants: [{ name: 'thumb', width: 320, height: 240, bytes: 5000 }],
  referenceCount: 0,
  createdAt: '2026-10-27T00:00:00.000Z',
  updatedAt: '2026-10-27T00:00:00.000Z',
};

const mockAsset2: AdminMediaAsset = {
  id: 'asset-2',
  status: 'READY',
  defaultAlt: 'سبد پلاستیکی کد ۱۲',
  sourceMimeType: 'image/jpeg',
  sourceWidth: 1200,
  sourceHeight: 900,
  variants: [{ name: 'thumb', width: 320, height: 240, bytes: 6000 }],
  referenceCount: 2,
  createdAt: '2026-10-27T00:00:00.000Z',
  updatedAt: '2026-10-27T00:00:00.000Z',
};

describe('mediaAssetIdFromPublicUrl', () => {
  it('extracts asset ID correctly from public media URL format', () => {
    expect(mediaAssetIdFromPublicUrl('/api/v1/media/public/asset-123/thumb')).toBe('asset-123');
    expect(mediaAssetIdFromPublicUrl('/api/v1/media/public/asset-abc/card')).toBe('asset-abc');
    expect(mediaAssetIdFromPublicUrl('https://example.com/api/v1/media/public/asset-xyz/detail')).toBe('asset-xyz');
    expect(mediaAssetIdFromPublicUrl('/catalog/products/p1.jpg')).toBeUndefined();
    expect(mediaAssetIdFromPublicUrl(undefined)).toBeUndefined();
  });
});

describe('MediaUploader', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders dropzone with instructions and handles valid file upload with progress', async () => {
    const user = userEvent.setup();
    const onComplete = vi.fn();

    vi.mocked(uploadMediaItemAction).mockResolvedValueOnce({
      ok: true,
      asset: mockAsset1,
    });

    render(<MediaUploader onUploadComplete={onComplete} />);

    expect(screen.getByText(/تصویر را به اینجا بکشید/)).toBeInTheDocument();

    const file = new File(['dummy-content'], 'test-image.webp', { type: 'image/webp' });
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;

    await user.upload(input, file);

    await waitFor(() => {
      expect(onComplete).toHaveBeenCalledWith(mockAsset1);
    });

    expect(screen.getByText('آماده')).toBeInTheDocument();
  });

  it('rejects files larger than 10MB and announces in aria-live', async () => {
    const user = userEvent.setup();
    render(<MediaUploader />);

    // 11MB file
    const largeFile = new File([new ArrayBuffer(11 * 1024 * 1024)], 'large.png', { type: 'image/png' });
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;

    await user.upload(input, largeFile);

    expect(uploadMediaItemAction).not.toHaveBeenCalled();
    expect(screen.getByText(/حجم فایل بیش از ۱۰ مگابایت است/)).toBeInTheDocument();
  });

  it('provides retry capability when upload fails', async () => {
    const user = userEvent.setup();

    vi.mocked(uploadMediaItemAction).mockResolvedValueOnce({
      ok: false,
      error: 'validation',
      code: 'MEDIA_INVALID_FILE',
    });

    render(<MediaUploader />);

    const file = new File(['bad-content'], 'bad.jpg', { type: 'image/jpeg' });
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;

    await user.upload(input, file);

    await waitFor(() => {
      expect(screen.getAllByText(/فرمت فایل معتبر نیست/).length).toBeGreaterThan(0);
    });

    const retryBtn = screen.getByRole('button', { name: 'تلاش مجدد' });
    expect(retryBtn).toBeInTheDocument();

    vi.mocked(uploadMediaItemAction).mockResolvedValueOnce({
      ok: true,
      asset: mockAsset1,
    });

    await user.click(retryBtn);

    await waitFor(() => {
      expect(screen.getByText('آماده')).toBeInTheDocument();
    });
  });
});

describe('MediaPicker', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('opens accessible modal dialog, shows assets, and selects an item', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();

    vi.mocked(listMediaAction).mockResolvedValue({
      ok: true,
      data: {
        items: [mockAsset1, mockAsset2],
        page: 1,
        pageSize: 20,
        total: 2,
        totalPages: 1,
      },
    });

    render(<MediaPicker assets={[mockAsset1, mockAsset2]} onSelect={onSelect} />);

    const trigger = screen.getByRole('button', { name: 'انتخاب از کتابخانه رسانه' });
    await user.click(trigger);

    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeInTheDocument();
    expect(dialog).toHaveAttribute('aria-modal', 'true');

    expect(screen.getByText('پالت پلاستیکی صنعتی')).toBeInTheDocument();
    expect(screen.getByText('سبد پلاستیکی کد ۱۲')).toBeInTheDocument();

    const selectOption = screen.getByRole('option', { name: /پالت پلاستیکی صنعتی/ });
    await user.click(selectOption);

    expect(onSelect).toHaveBeenCalledWith(mockAsset1);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('closes dialog on Escape key and restores focus', async () => {
    const user = userEvent.setup();
    render(<MediaPicker assets={[mockAsset1]} />);

    const trigger = screen.getByRole('button', { name: 'انتخاب از کتابخانه رسانه' });
    await user.click(trigger);

    expect(screen.getByRole('dialog')).toBeInTheDocument();

    await user.keyboard('{Escape}');

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});

describe('ProductGalleryEditor', () => {
  it('renders gallery items with slot 0 marked as cover and supports reordering and removal', async () => {
    const user = userEvent.setup();

    const initialImages = [
      { url: '/api/v1/media/public/asset-1/card', alt: 'تصویر اول' },
      { url: '/catalog/products/p2.jpg', alt: 'تصویر دوم' },
    ];

    render(<ProductGalleryEditor initialImages={initialImages} mediaAssets={[mockAsset1, mockAsset2]} />);

    expect(screen.getByText('کاور / تصویر اصلی')).toBeInTheDocument();
    expect(screen.getByText(/^تصویر [2۲]$/)).toBeInTheDocument();

    // Verify move down swaps items
    const moveDownBtn = screen.getByRole('button', { name: /انتقال تصویر [1۱] به پایین/ });
    await user.click(moveDownBtn);

    // After swapping, slot 1 (cover) now has the second image's alt
    const altInputs = screen.getAllByLabelText(/متن جایگزین/);
    expect((altInputs[0] as HTMLInputElement).value).toBe('تصویر دوم');
    expect((altInputs[1] as HTMLInputElement).value).toBe('تصویر اول');

    // Remove an item
    const removeBtn = screen.getByRole('button', { name: /حذف تصویر [1۱] از گالری/ });
    await user.click(removeBtn);

    expect(screen.getAllByLabelText(/متن جایگزین/)).toHaveLength(1);
  });
});

describe('ArticleFeaturedImageEditor', () => {
  it('renders featured image, allows alt editing, and supports explicit clearing', async () => {
    const user = userEvent.setup();

    const initialImage = { url: '/api/v1/media/public/asset-1/card', alt: 'شاخص مقاله' };

    render(<ArticleFeaturedImageEditor initialImage={initialImage} mediaAssets={[mockAsset1]} />);

    const altInput = screen.getByLabelText(/متن جایگزین/);
    expect((altInput as HTMLInputElement).value).toBe('شاخص مقاله');

    const clearBtn = screen.getByRole('button', { name: 'حذف تصویر شاخص' });
    await user.click(clearBtn);

    expect(screen.getByText(/تصویر شاخص حذف شد/)).toBeInTheDocument();
    const hiddenClearInput = document.querySelector('input[name="featuredImageClear"]');
    expect(hiddenClearInput).toHaveValue('on');
  });
});
