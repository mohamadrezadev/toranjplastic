import { Body, Controller, Get, HttpCode, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { AdminGuard, CsrfGuard } from '../identity/auth.guard.js';
import type { AuthenticatedRequest } from '../identity/identity.types.js';
import { AdminContentService } from './admin-content.service.js';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/admin-category.dto.js';
import { CreateProductDto, UpdateProductDto } from './dto/admin-product.dto.js';
import { AdminPaginationQueryDto, AdminProductQueryDto, IdParamDto } from './dto/admin-query.dto.js';

@Controller('admin/content')
@UseGuards(AdminGuard)
export class AdminContentController {
  constructor(private readonly content: AdminContentService) {}

  private actorId(request: AuthenticatedRequest): string {
    return request.auth!.account.id;
  }

  @Get('categories')
  listCategories(@Query() query: AdminPaginationQueryDto) {
    return this.content.listCategories(query);
  }

  @Get('categories/:id')
  getCategory(@Param() { id }: IdParamDto) {
    return this.content.getCategory(id);
  }

  @Post('categories')
  @UseGuards(CsrfGuard)
  createCategory(@Body() dto: CreateCategoryDto, @Req() request: AuthenticatedRequest) {
    return this.content.createCategory(dto, this.actorId(request));
  }

  @Patch('categories/:id')
  @UseGuards(CsrfGuard)
  updateCategory(@Param() { id }: IdParamDto, @Body() dto: UpdateCategoryDto, @Req() request: AuthenticatedRequest) {
    return this.content.updateCategory(id, dto, this.actorId(request));
  }

  @Post('categories/:id/publish')
  @HttpCode(200)
  @UseGuards(CsrfGuard)
  publishCategory(@Param() { id }: IdParamDto, @Req() request: AuthenticatedRequest) {
    return this.content.publishCategory(id, this.actorId(request));
  }

  @Post('categories/:id/archive')
  @HttpCode(200)
  @UseGuards(CsrfGuard)
  archiveCategory(@Param() { id }: IdParamDto, @Req() request: AuthenticatedRequest) {
    return this.content.archiveCategory(id, this.actorId(request));
  }

  @Get('products')
  listProducts(@Query() query: AdminProductQueryDto) {
    return this.content.listProducts(query);
  }

  @Get('products/:id')
  getProduct(@Param() { id }: IdParamDto) {
    return this.content.getProduct(id);
  }

  @Post('products')
  @UseGuards(CsrfGuard)
  createProduct(@Body() dto: CreateProductDto, @Req() request: AuthenticatedRequest) {
    return this.content.createProduct(dto, this.actorId(request));
  }

  @Patch('products/:id')
  @UseGuards(CsrfGuard)
  updateProduct(@Param() { id }: IdParamDto, @Body() dto: UpdateProductDto, @Req() request: AuthenticatedRequest) {
    return this.content.updateProduct(id, dto, this.actorId(request));
  }

  @Post('products/:id/publish')
  @HttpCode(200)
  @UseGuards(CsrfGuard)
  publishProduct(@Param() { id }: IdParamDto, @Req() request: AuthenticatedRequest) {
    return this.content.publishProduct(id, this.actorId(request));
  }

  @Post('products/:id/archive')
  @HttpCode(200)
  @UseGuards(CsrfGuard)
  archiveProduct(@Param() { id }: IdParamDto, @Req() request: AuthenticatedRequest) {
    return this.content.archiveProduct(id, this.actorId(request));
  }
}
