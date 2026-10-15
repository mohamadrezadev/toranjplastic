import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CapabilityGuard, CsrfGuard } from '../../identity/auth.guard.js';
import { CAPABILITIES, RequireCapability } from '../../identity/capabilities.js';
import type { AuthenticatedRequest } from '../../identity/identity.types.js';
import {
  CreateArticleDto,
  UpdateArticleDto,
} from '../dto/admin-article.dto.js';
import { AdminPaginationQueryDto, IdParamDto } from '../dto/admin-query.dto.js';
import { AdminArticleService } from './article.service.js';

@Controller('admin/content/articles')
@RequireCapability(CAPABILITIES.CONTENT_MANAGEMENT)
@UseGuards(CapabilityGuard)
export class AdminArticleController {
  constructor(private readonly articles: AdminArticleService) {}
  private actorId(request: AuthenticatedRequest) {
    return request.auth!.account.id;
  }
  @Get() list(@Query() query: AdminPaginationQueryDto) {
    return this.articles.list(query);
  }
  @Get(':id') get(@Param() { id }: IdParamDto) {
    return this.articles.get(id);
  }
  @Post() @UseGuards(CsrfGuard) create(
    @Body() dto: CreateArticleDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.articles.create(dto, this.actorId(request));
  }
  @Patch(':id') @UseGuards(CsrfGuard) update(
    @Param() { id }: IdParamDto,
    @Body() dto: UpdateArticleDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.articles.update(id, dto, this.actorId(request));
  }
  @Post(':id/publish') @HttpCode(200) @UseGuards(CsrfGuard) publish(
    @Param() { id }: IdParamDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.articles.publish(id, this.actorId(request));
  }
  @Post(':id/archive') @HttpCode(200) @UseGuards(CsrfGuard) archive(
    @Param() { id }: IdParamDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.articles.archive(id, this.actorId(request));
  }
}
