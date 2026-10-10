import { describe, expect, it } from 'vitest';
import { HealthService } from './health.service.js';

describe('HealthService', () => {
  it('returns the disclosure-limited liveness contract', () => {
    const response = new HealthService().getHealth(
      new Date('2026-10-10T08:00:00.000Z'),
    );

    expect(response).toEqual({
      status: 'ok',
      service: 'toranj-backend',
      version: '0.0.1',
      timestamp: '2026-10-10T08:00:00.000Z',
    });
    expect(JSON.stringify(response)).not.toMatch(/database|secret|token|host/i);
  });
});
