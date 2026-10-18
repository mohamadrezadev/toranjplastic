import { Controller, Get, Param, Res, StreamableFile } from '@nestjs/common';
import type { Response } from 'express';
import { MediaVariantParamDto } from './dto/admin-media.dto.js';
import { MediaService } from './media.service.js';

@Controller('media/public')
export class PublicMediaController {
  constructor(private readonly media: MediaService) {}

  @Get(':id/:variant')
  async variant(
    @Param() { id, variant }: MediaVariantParamDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.media.publicVariant(id, variant);
    response.setHeader('Cache-Control', 'public, max-age=300');
    response.setHeader('ETag', `"${result.etag}"`);
    response.setHeader('X-Content-Type-Options', 'nosniff');
    return new StreamableFile(result.stream, { type: 'image/webp' });
  }
}
