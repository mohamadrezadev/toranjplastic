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
import { AdminGuard, CsrfGuard } from '../../identity/auth.guard.js';
import type { AuthenticatedRequest } from '../../identity/identity.types.js';
import {
  CreateManagedPageDto,
  UpdateManagedPageDto,
} from '../dto/admin-managed-page.dto.js';
import { AdminPaginationQueryDto, IdParamDto } from '../dto/admin-query.dto.js';
import { AdminManagedPageService } from './managed-page.service.js';

@Controller('admin/content/pages')
@UseGuards(AdminGuard)
export class AdminManagedPageController {
  constructor(private readonly pages: AdminManagedPageService) {}
  private actorId(request: AuthenticatedRequest) {
    return request.auth!.account.id;
  }
  @Get() list(@Query() query: AdminPaginationQueryDto) {
    return this.pages.list(query);
  }
  @Get(':id') get(@Param() { id }: IdParamDto) {
    return this.pages.get(id);
  }
  @Post() @UseGuards(CsrfGuard) create(
    @Body() dto: CreateManagedPageDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.pages.create(dto, this.actorId(request));
  }
  @Patch(':id') @UseGuards(CsrfGuard) update(
    @Param() { id }: IdParamDto,
    @Body() dto: UpdateManagedPageDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.pages.update(id, dto, this.actorId(request));
  }
  @Post(':id/publish') @HttpCode(200) @UseGuards(CsrfGuard) publish(
    @Param() { id }: IdParamDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.pages.publish(id, this.actorId(request));
  }
  @Post(':id/archive') @HttpCode(200) @UseGuards(CsrfGuard) archive(
    @Param() { id }: IdParamDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.pages.archive(id, this.actorId(request));
  }
}
