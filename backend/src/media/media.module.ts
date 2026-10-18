import { Module } from '@nestjs/common';
import { loadEnvironment, type AppEnvironment } from '../config/environment.js';
import { DatabaseModule } from '../database/database.module.js';
import { IdentityModule } from '../identity/identity.module.js';
import { AdminMediaController } from './admin-media.controller.js';
import { PublicMediaController } from './public-media.controller.js';
import { MEDIA_REPOSITORY } from './media.types.js';
import { PrismaMediaRepository } from './prisma-media.repository.js';
import { MediaService } from './media.service.js';
import { MEDIA_CONFIG } from './media.tokens.js';
import { MediaImageProcessor } from './processing/media-image.processor.js';
import { MEDIA_STORAGE } from './storage/media-storage.js';
import { MountedDiskStorage } from './storage/mounted-disk.storage.js';

@Module({
  imports: [DatabaseModule, IdentityModule],
  controllers: [AdminMediaController, PublicMediaController],
  providers: [
    {
      provide: MEDIA_CONFIG,
      useFactory: (): AppEnvironment['media'] => loadEnvironment(process.env).media,
    },
    {
      provide: MEDIA_STORAGE,
      inject: [MEDIA_CONFIG],
      useFactory: (config: AppEnvironment['media']) => new MountedDiskStorage(config.root),
    },
    PrismaMediaRepository,
    {
      provide: MEDIA_REPOSITORY,
      useExisting: PrismaMediaRepository,
    },
    {
      provide: MediaImageProcessor,
      inject: [MEDIA_STORAGE, MEDIA_CONFIG],
      useFactory: (storage: MountedDiskStorage, config: AppEnvironment['media']) => new MediaImageProcessor(storage, config),
    },
    MediaService,
  ],
  exports: [MEDIA_CONFIG, MEDIA_STORAGE],
})
export class MediaModule {}
