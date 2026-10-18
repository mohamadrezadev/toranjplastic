import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Inject,
  Param,
  Patch,
  Post,
  Query,
  Req,
  ServiceUnavailableException,
  StreamableFile,
  UseGuards,
} from '@nestjs/common';
import type { AppEnvironment } from '../config/environment.js';
import { CapabilityGuard, CsrfGuard } from '../identity/auth.guard.js';
import { CAPABILITIES, RequireCapability } from '../identity/capabilities.js';
import type { AuthenticatedRequest } from '../identity/identity.types.js';
import type { Response } from 'express';
import { Res } from '@nestjs/common';
import { MEDIA_CONFIG } from './media.tokens.js';
import { MediaService } from './media.service.js';
import { parseMediaUpload } from './multipart-upload.js';
import { MediaInvalidFileError, MediaPixelLimitError, MediaProcessingBusyError, MediaUploadTooLargeError } from './processing/media-processing.errors.js';
import { MediaStorageUnavailableError } from './storage/media-storage.errors.js';
import { AdminMediaQueryDto, MediaIdParamDto, PreviewVariantQueryDto, UpdateMediaAltDto } from './dto/admin-media.dto.js';

@Controller('admin/media')
@RequireCapability(CAPABILITIES.CONTENT_MANAGEMENT)
@UseGuards(CapabilityGuard)
export class AdminMediaController {
  constructor(
    private readonly media: MediaService,
    @Inject(MEDIA_CONFIG) private readonly config: AppEnvironment['media'],
  ) {}

  @Get()
  list(@Query() query: AdminMediaQueryDto) { return this.media.list(query); }

  @Get(':id')
  get(@Param() { id }: MediaIdParamDto) { return this.media.get(id); }

  @Get(':id/preview')
  async preview(
    @Param() { id }: MediaIdParamDto,
    @Query() { variant }: PreviewVariantQueryDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.media.privateVariant(id, variant);
    response.setHeader('Cache-Control', 'no-store');
    response.setHeader('ETag', `"${result.etag}"`);
    response.setHeader('X-Content-Type-Options', 'nosniff');
    return new StreamableFile(result.stream, { type: 'image/webp' });
  }

  @Post()
  @UseGuards(CsrfGuard)
  async upload(@Req() request: AuthenticatedRequest) {
    try {
      const parsed = await parseMediaUpload(request, this.config.maxUploadBytes);
      return await this.media.upload(parsed.stream, parsed.defaultAlt, request.auth!.account.id);
    } catch (error) {
      if (error instanceof MediaUploadTooLargeError || error instanceof MediaPixelLimitError || code(error) === 'MEDIA_UPLOAD_TOO_LARGE') {
        throw new BadRequestException({ code: code(error) ?? 'MEDIA_UPLOAD_TOO_LARGE', message: 'اندازه فایل یا تصویر بیش از حد مجاز است.' });
      }
      if (error instanceof MediaInvalidFileError) {
        throw new BadRequestException({ code: error.code, message: 'فایل تصویر معتبر نیست.' });
      }
      if (error instanceof MediaProcessingBusyError) {
        throw new ServiceUnavailableException({ code: error.code, message: 'ظرفیت پردازش رسانه موقتاً تکمیل است.' });
      }
      if (error instanceof MediaStorageUnavailableError) {
        throw new ServiceUnavailableException({ code: 'MEDIA_STORAGE_UNAVAILABLE', message: 'فضای ذخیره‌سازی رسانه در دسترس نیست.' });
      }
      throw new BadRequestException({ code: code(error) ?? 'MEDIA_INVALID_UPLOAD', message: 'درخواست بارگذاری معتبر نیست.' });
    }
  }

  @Patch(':id')
  @UseGuards(CsrfGuard)
  updateAlt(@Param() { id }: MediaIdParamDto, @Body() dto: UpdateMediaAltDto, @Req() request: AuthenticatedRequest) {
    return this.media.updateDefaultAlt(id, dto.defaultAlt, request.auth!.account.id);
  }

  @Delete(':id')
  @HttpCode(204)
  @UseGuards(CsrfGuard)
  delete(@Param() { id }: MediaIdParamDto, @Req() request: AuthenticatedRequest) {
    return this.media.delete(id, request.auth!.account.id);
  }
}

function code(error: unknown) {
  return typeof error === 'object' && error && 'code' in error && typeof error.code === 'string' ? error.code : undefined;
}
