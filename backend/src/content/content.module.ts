import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module.js';
import { ContentController } from './content.controller.js';
import { ContentService } from './content.service.js';
import { PrismaPublicContentRepository } from './prisma-public-content.repository.js';
import { PUBLIC_CONTENT_REPOSITORY } from './public-content.repository.js';

@Module({
  imports: [DatabaseModule],
  controllers: [ContentController],
  providers: [
    ContentService,
    PrismaPublicContentRepository,
    {
      provide: PUBLIC_CONTENT_REPOSITORY,
      useExisting: PrismaPublicContentRepository,
    },
  ],
})
export class ContentModule {}
