import { Controller, Get, Header, Param, Query } from '@nestjs/common';
import { ContentService } from './content.service.js';
import { PaginationQueryDto, ProductQueryDto } from './dto/content-query.dto.js';
import { SlugParamDto } from './dto/slug-param.dto.js';

const publicCache = 'public, max-age=60, stale-while-revalidate=300';

@Controller('public/content')
export class ContentController {
  constructor(private readonly content: ContentService) {}

  @Get('categories')
  @Header('Cache-Control', publicCache)
  listCategories(@Query() query: PaginationQueryDto) {
    return this.content.listCategories(query);
  }

  @Get('products')
  @Header('Cache-Control', publicCache)
  listProducts(@Query() query: ProductQueryDto) {
    return this.content.listProducts(query);
  }

  @Get('products/:slug')
  @Header('Cache-Control', publicCache)
  getProduct(@Param() params: SlugParamDto) {
    return this.content.getProduct(params);
  }

  @Get('services')
  @Header('Cache-Control', publicCache)
  listServices(@Query() query: PaginationQueryDto) {
    return this.content.listServices(query);
  }

  @Get('services/:slug')
  @Header('Cache-Control', publicCache)
  getService(@Param() params: SlugParamDto) {
    return this.content.getService(params);
  }

  @Get('materials')
  @Header('Cache-Control', publicCache)
  listMaterials(@Query() query: PaginationQueryDto) {
    return this.content.listMaterials(query);
  }

  @Get('materials/:slug')
  @Header('Cache-Control', publicCache)
  getMaterial(@Param() params: SlugParamDto) {
    return this.content.getMaterial(params);
  }

  @Get('articles')
  @Header('Cache-Control', publicCache)
  listArticles(@Query() query: PaginationQueryDto) {
    return this.content.listArticles(query);
  }

  @Get('articles/:slug')
  @Header('Cache-Control', publicCache)
  getArticle(@Param() params: SlugParamDto) {
    return this.content.getArticle(params);
  }

  @Get('pages/:slug')
  @Header('Cache-Control', publicCache)
  getPage(@Param() params: SlugParamDto) {
    return this.content.getPage(params);
  }
}
