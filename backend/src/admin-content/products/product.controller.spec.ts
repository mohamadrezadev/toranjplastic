import { describe, expect, it, vi } from 'vitest';
import type { AuthenticatedRequest } from '../../identity/identity.types.js';
import { AdminProductController } from './product.controller.js';

const request = {
  auth: { account: { id: 'operator-1' } },
} as unknown as AuthenticatedRequest;

describe('AdminProductController', () => {
  it('delegates every product operation with the authenticated actor', async () => {
    const products = {
      list: vi.fn().mockResolvedValue('list'),
      get: vi.fn().mockResolvedValue('detail'),
      create: vi.fn().mockResolvedValue('created'),
      update: vi.fn().mockResolvedValue('updated'),
      publish: vi.fn().mockResolvedValue('published'),
      archive: vi.fn().mockResolvedValue('archived'),
    };
    const controller = new AdminProductController(products as never);
    const query = { page: 1, pageSize: 20 };
    const create = { name: 'محصول', slug: 'product' };
    const update = { name: 'محصول جدید' };

    await expect(controller.list(query as never)).resolves.toBe('list');
    await expect(controller.get({ id: 'product-1' })).resolves.toBe('detail');
    await expect(controller.create(create as never, request)).resolves.toBe(
      'created',
    );
    await expect(
      controller.update({ id: 'product-1' }, update as never, request),
    ).resolves.toBe('updated');
    await expect(
      controller.publish({ id: 'product-1' }, request),
    ).resolves.toBe('published');
    await expect(
      controller.archive({ id: 'product-1' }, request),
    ).resolves.toBe('archived');

    expect(products.create).toHaveBeenCalledWith(create, 'operator-1');
    expect(products.update).toHaveBeenCalledWith(
      'product-1',
      update,
      'operator-1',
    );
    expect(products.publish).toHaveBeenCalledWith('product-1', 'operator-1');
    expect(products.archive).toHaveBeenCalledWith('product-1', 'operator-1');
  });
});
