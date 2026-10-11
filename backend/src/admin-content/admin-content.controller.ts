import { Body, Controller, Get, HttpCode, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { AdminGuard, CsrfGuard } from '../identity/auth.guard.js';
import type { AuthenticatedRequest } from '../identity/identity.types.js';
import { AdminContentService } from './admin-content.service.js';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/admin-category.dto.js';
import { CreateProductDto, UpdateProductDto } from './dto/admin-product.dto.js';
import { CreateInjectionServiceDto, UpdateInjectionServiceDto } from './dto/admin-injection-service.dto.js';
import { CreateMaterialDto, UpdateMaterialDto } from './dto/admin-material.dto.js';
import { CreateArticleDto, UpdateArticleDto } from './dto/admin-article.dto.js';
import { CreateManagedPageDto, UpdateManagedPageDto } from './dto/admin-managed-page.dto.js';
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

  @Get('services')
  listInjectionServices(@Query() query: AdminPaginationQueryDto) {
    return this.content.listInjectionServices(query);
  }

  @Get('services/:id')
  getInjectionService(@Param() { id }: IdParamDto) {
    return this.content.getInjectionService(id);
  }

  @Post('services')
  @UseGuards(CsrfGuard)
  createInjectionService(@Body() dto: CreateInjectionServiceDto, @Req() request: AuthenticatedRequest) {
    return this.content.createInjectionService(dto, this.actorId(request));
  }

  @Patch('services/:id')
  @UseGuards(CsrfGuard)
  updateInjectionService(@Param() { id }: IdParamDto, @Body() dto: UpdateInjectionServiceDto, @Req() request: AuthenticatedRequest) {
    return this.content.updateInjectionService(id, dto, this.actorId(request));
  }

  @Post('services/:id/publish')
  @HttpCode(200)
  @UseGuards(CsrfGuard)
  publishInjectionService(@Param() { id }: IdParamDto, @Req() request: AuthenticatedRequest) {
    return this.content.publishInjectionService(id, this.actorId(request));
  }

  @Post('services/:id/archive')
  @HttpCode(200)
  @UseGuards(CsrfGuard)
  archiveInjectionService(@Param() { id }: IdParamDto, @Req() request: AuthenticatedRequest) {
    return this.content.archiveInjectionService(id, this.actorId(request));
  }

  @Get('materials')
  listMaterials(@Query() query: AdminPaginationQueryDto) {
    return this.content.listMaterials(query);
  }

  @Get('materials/:id')
  getMaterial(@Param() { id }: IdParamDto) {
    return this.content.getMaterial(id);
  }

  @Post('materials')
  @UseGuards(CsrfGuard)
  createMaterial(@Body() dto: CreateMaterialDto, @Req() request: AuthenticatedRequest) {
    return this.content.createMaterial(dto, this.actorId(request));
  }

  @Patch('materials/:id')
  @UseGuards(CsrfGuard)
  updateMaterial(@Param() { id }: IdParamDto, @Body() dto: UpdateMaterialDto, @Req() request: AuthenticatedRequest) {
    return this.content.updateMaterial(id, dto, this.actorId(request));
  }

  @Post('materials/:id/publish')
  @HttpCode(200)
  @UseGuards(CsrfGuard)
  publishMaterial(@Param() { id }: IdParamDto, @Req() request: AuthenticatedRequest) {
    return this.content.publishMaterial(id, this.actorId(request));
  }

  @Post('materials/:id/archive')
  @HttpCode(200)
  @UseGuards(CsrfGuard)
  archiveMaterial(@Param() { id }: IdParamDto, @Req() request: AuthenticatedRequest) {
    return this.content.archiveMaterial(id, this.actorId(request));
  }

  @Get('articles')
  listArticles(@Query() query: AdminPaginationQueryDto) {
    return this.content.listArticles(query);
  }

  @Get('articles/:id')
  getArticle(@Param() { id }: IdParamDto) {
    return this.content.getArticle(id);
  }

  @Post('articles')
  @UseGuards(CsrfGuard)
  createArticle(@Body() dto: CreateArticleDto, @Req() request: AuthenticatedRequest) {
    return this.content.createArticle(dto, this.actorId(request));
  }

  @Patch('articles/:id')
  @UseGuards(CsrfGuard)
  updateArticle(@Param() { id }: IdParamDto, @Body() dto: UpdateArticleDto, @Req() request: AuthenticatedRequest) {
    return this.content.updateArticle(id, dto, this.actorId(request));
  }

  @Post('articles/:id/publish')
  @HttpCode(200)
  @UseGuards(CsrfGuard)
  publishArticle(@Param() { id }: IdParamDto, @Req() request: AuthenticatedRequest) {
    return this.content.publishArticle(id, this.actorId(request));
  }

  @Post('articles/:id/archive')
  @HttpCode(200)
  @UseGuards(CsrfGuard)
  archiveArticle(@Param() { id }: IdParamDto, @Req() request: AuthenticatedRequest) {
    return this.content.archiveArticle(id, this.actorId(request));
  }

  @Get('pages')
  listManagedPages(@Query() query: AdminPaginationQueryDto) {
    return this.content.listManagedPages(query);
  }

  @Get('pages/:id')
  getManagedPage(@Param() { id }: IdParamDto) {
    return this.content.getManagedPage(id);
  }

  @Post('pages')
  @UseGuards(CsrfGuard)
  createManagedPage(@Body() dto: CreateManagedPageDto, @Req() request: AuthenticatedRequest) {
    return this.content.createManagedPage(dto, this.actorId(request));
  }

  @Patch('pages/:id')
  @UseGuards(CsrfGuard)
  updateManagedPage(@Param() { id }: IdParamDto, @Body() dto: UpdateManagedPageDto, @Req() request: AuthenticatedRequest) {
    return this.content.updateManagedPage(id, dto, this.actorId(request));
  }

  @Post('pages/:id/publish')
  @HttpCode(200)
  @UseGuards(CsrfGuard)
  publishManagedPage(@Param() { id }: IdParamDto, @Req() request: AuthenticatedRequest) {
    return this.content.publishManagedPage(id, this.actorId(request));
  }

  @Post('pages/:id/archive')
  @HttpCode(200)
  @UseGuards(CsrfGuard)
  archiveManagedPage(@Param() { id }: IdParamDto, @Req() request: AuthenticatedRequest) {
    return this.content.archiveManagedPage(id, this.actorId(request));
  }
}
