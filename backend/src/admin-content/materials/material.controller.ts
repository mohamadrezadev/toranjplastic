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
  CreateMaterialDto,
  UpdateMaterialDto,
} from '../dto/admin-material.dto.js';
import { AdminPaginationQueryDto, IdParamDto } from '../dto/admin-query.dto.js';
import { AdminMaterialService } from './material.service.js';

@Controller('admin/content/materials')
@UseGuards(AdminGuard)
export class AdminMaterialController {
  constructor(private readonly materials: AdminMaterialService) {}
  private actorId(request: AuthenticatedRequest) {
    return request.auth!.account.id;
  }
  @Get() list(@Query() query: AdminPaginationQueryDto) {
    return this.materials.list(query);
  }
  @Get(':id') get(@Param() { id }: IdParamDto) {
    return this.materials.get(id);
  }
  @Post() @UseGuards(CsrfGuard) create(
    @Body() dto: CreateMaterialDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.materials.create(dto, this.actorId(request));
  }
  @Patch(':id') @UseGuards(CsrfGuard) update(
    @Param() { id }: IdParamDto,
    @Body() dto: UpdateMaterialDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.materials.update(id, dto, this.actorId(request));
  }
  @Post(':id/publish') @HttpCode(200) @UseGuards(CsrfGuard) publish(
    @Param() { id }: IdParamDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.materials.publish(id, this.actorId(request));
  }
  @Post(':id/archive') @HttpCode(200) @UseGuards(CsrfGuard) archive(
    @Param() { id }: IdParamDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.materials.archive(id, this.actorId(request));
  }
}
