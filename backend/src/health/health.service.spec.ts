import { describe, expect, it, vi } from 'vitest';
import { HealthService } from './health.service.js';
import { ReadyController } from './health.controller.js';
import type { PrismaService } from '../database/prisma.service.js';
import type { MediaStorage } from '../media/storage/media-storage.js';
import { HttpException, HttpStatus } from '@nestjs/common';

describe('HealthService and ReadyController', () => {
  const timestamp = new Date('2026-10-10T08:00:00.000Z');

  it('returns the disclosure-limited liveness contract', () => {
    const response = new HealthService().getHealth(timestamp);

    expect(response).toEqual({
      status: 'ok',
      service: 'toranj-backend',
      version: '0.0.1',
      timestamp: '2026-10-10T08:00:00.000Z',
    });
    expect(JSON.stringify(response)).not.toMatch(/database|secret|token|host/i);
  });

  it('returns ready 200 when database and media storage are both ready', async () => {
    const mockPrisma = {
      $queryRaw: vi.fn().mockResolvedValue([{ 1: 1 }]),
    } as unknown as PrismaService;

    const mockStorage = {
      checkReadiness: vi.fn().mockResolvedValue(true),
    } as unknown as MediaStorage;

    const service = new HealthService(mockPrisma, mockStorage, {
      minFreeBytes: 1024,
    } as never);

    const readiness = await service.getReadiness(timestamp);
    expect(readiness).toEqual({
      status: 'ready',
      service: 'toranj-backend',
      version: '0.0.1',
      timestamp: '2026-10-10T08:00:00.000Z',
      components: {
        database: 'up',
        mediaStorage: 'up',
      },
    });

    // Test controller returns 200
    const controller = new ReadyController(service);
    const controllerRes = await controller.getReady();
    expect(controllerRes.status).toBe('ready');
  });

  it('returns not_ready and throws 503 when database is down', async () => {
    const mockPrisma = {
      $queryRaw: vi.fn().mockRejectedValue(new Error('Connection refused to postgres:5432')),
    } as unknown as PrismaService;

    const mockStorage = {
      checkReadiness: vi.fn().mockResolvedValue(true),
    } as unknown as MediaStorage;

    const service = new HealthService(mockPrisma, mockStorage);
    const readiness = await service.getReadiness(timestamp);

    expect(readiness.status).toBe('not_ready');
    expect(readiness.components.database).toBe('down');
    expect(readiness.components.mediaStorage).toBe('up');

    // Never leak error message or path
    const json = JSON.stringify(readiness);
    expect(json).not.toContain('Connection refused');
    expect(json).not.toContain('5432');

    // Test controller throws 503
    const controller = new ReadyController(service);
    await expect(controller.getReady()).rejects.toThrow(HttpException);
    try {
      await controller.getReady();
    } catch (err: unknown) {
      const httpErr = err as HttpException;
      expect(httpErr.getStatus()).toBe(HttpStatus.SERVICE_UNAVAILABLE);
      expect(httpErr.getResponse()).toMatchObject({
        status: 'not_ready',
        components: { database: 'down', mediaStorage: 'up' },
      });
    }
  });

  it('returns not_ready and throws 503 when media storage is unavailable or out of space', async () => {
    const mockPrisma = {
      $queryRaw: vi.fn().mockResolvedValue([{ 1: 1 }]),
    } as unknown as PrismaService;

    const mockStorage = {
      checkReadiness: vi.fn().mockResolvedValue(false),
    } as unknown as MediaStorage;

    const service = new HealthService(mockPrisma, mockStorage);
    const readiness = await service.getReadiness(timestamp);

    expect(readiness.status).toBe('not_ready');
    expect(readiness.components.database).toBe('up');
    expect(readiness.components.mediaStorage).toBe('down');

    // Controller throws 503
    const controller = new ReadyController(service);
    await expect(controller.getReady()).rejects.toMatchObject({
      status: HttpStatus.SERVICE_UNAVAILABLE,
    });
  });
});
