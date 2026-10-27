import { Inject, Injectable, Optional } from '@nestjs/common';
import type { AppEnvironment } from '../config/environment.js';
import { PrismaService } from '../database/prisma.service.js';
import { MEDIA_CONFIG } from '../media/media.tokens.js';
import { MEDIA_STORAGE, type MediaStorage } from '../media/storage/media-storage.js';

export interface HealthResponse {
  status: 'ok';
  service: 'toranj-backend';
  version: string;
  timestamp: string;
}

export interface ReadyResponse {
  status: 'ready' | 'not_ready';
  service: 'toranj-backend';
  version: string;
  timestamp: string;
  components: {
    database: 'up' | 'down';
    mediaStorage: 'up' | 'down';
  };
}

@Injectable()
export class HealthService {
  constructor(
    @Optional() private readonly prisma?: PrismaService,
    @Optional() @Inject(MEDIA_STORAGE) private readonly mediaStorage?: MediaStorage,
    @Optional() @Inject(MEDIA_CONFIG) private readonly mediaConfig?: AppEnvironment['media'],
  ) {}

  getHealth(now = new Date()): HealthResponse {
    return {
      status: 'ok',
      service: 'toranj-backend',
      version: process.env.APP_VERSION ?? '0.0.1',
      timestamp: now.toISOString(),
    };
  }

  async getReadiness(now = new Date()): Promise<ReadyResponse> {
    let databaseStatus: 'up' | 'down' = 'down';
    let mediaStatus: 'up' | 'down' = 'down';

    if (this.prisma) {
      try {
        await this.prisma.$queryRaw`SELECT 1`;
        databaseStatus = 'up';
      } catch {
        databaseStatus = 'down';
      }
    }

    if (this.mediaStorage) {
      try {
        const minFreeBytes = this.mediaConfig?.minFreeBytes ?? 0;
        const isReady = await this.mediaStorage.checkReadiness(minFreeBytes);
        mediaStatus = isReady ? 'up' : 'down';
      } catch {
        mediaStatus = 'down';
      }
    }

    const isAllReady = databaseStatus === 'up' && mediaStatus === 'up';

    return {
      status: isAllReady ? 'ready' : 'not_ready',
      service: 'toranj-backend',
      version: process.env.APP_VERSION ?? '0.0.1',
      timestamp: now.toISOString(),
      components: {
        database: databaseStatus,
        mediaStorage: mediaStatus,
      },
    };
  }
}
