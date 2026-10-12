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
  CreateCategoryDto,
  UpdateCategoryDto,
} from '../dto/admin-category.dto.js';
import { AdminPaginationQueryDto, IdParamDto } from '../dto/admin-query.dto.js';
import { AdminCategoryService } from './category.service.js';

@Controller('admin/content/categories')
@UseGuards(AdminGuard)
export class AdminCategoryController {
  constructor(private readonly categories: AdminCategoryService) {}
  private actorId(request: AuthenticatedRequest) {
    return request.auth!.account.id;
  }

  @Get() list(@Query() query: AdminPaginationQueryDto) {
    return this.categories.list(query);
  }
  @Get(':id') get(@Param() { id }: IdParamDto) {
    return this.categories.get(id);
  }
  @Post()
  @UseGuards(CsrfGuard)
  create(@Body() dto: CreateCategoryDto, @Req() request: AuthenticatedRequest) {
    return this.categories.create(dto, this.actorId(request));
  }
  @Patch(':id')
  @UseGuards(CsrfGuard)
  update(
    @Param() { id }: IdParamDto,
    @Body() dto: UpdateCategoryDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.categories.update(id, dto, this.actorId(request));
  }
  @Post(':id/publish')
  @HttpCode(200)
  @UseGuards(CsrfGuard)
  publish(@Param() { id }: IdParamDto, @Req() request: AuthenticatedRequest) {
    return this.categories.publish(id, this.actorId(request));
  }
  @Post(':id/archive')
  @HttpCode(200)
  @UseGuards(CsrfGuard)
  archive(@Param() { id }: IdParamDto, @Req() request: AuthenticatedRequest) {
    return this.categories.archive(id, this.actorId(request));
  }
}
