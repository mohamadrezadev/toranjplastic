import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { PaginationQueryDto, ProductQueryDto } from './dto/content-query.dto.js';
import type { SlugParamDto } from './dto/slug-param.dto.js';
import {
  PUBLIC_CONTENT_REPOSITORY,
  type PublicContentRepository,
} from './public-content.repository.js';

@Injectable()
export class ContentService {
  constructor(
    @Inject(PUBLIC_CONTENT_REPOSITORY)
    private readonly repository: PublicContentRepository,
  ) {}

  listCategories(query: PaginationQueryDto) {
    return this.repository.listCategories(query);
  }

  listProducts(query: ProductQueryDto) {
    return this.repository.listProducts(query);
  }

  listServices(query: PaginationQueryDto) {
    return this.repository.listServices(query);
  }

  listMaterials(query: PaginationQueryDto) {
    return this.repository.listMaterials(query);
  }

  listArticles(query: PaginationQueryDto) {
    return this.repository.listArticles(query);
  }

  async getProduct({ slug }: SlugParamDto) {
    return this.requireContent(await this.repository.findProduct(slug));
  }

  async getService({ slug }: SlugParamDto) {
    return this.requireContent(await this.repository.findService(slug));
  }

  async getMaterial({ slug }: SlugParamDto) {
    return this.requireContent(await this.repository.findMaterial(slug));
  }

  async getArticle({ slug }: SlugParamDto) {
    return this.requireContent(await this.repository.findArticle(slug));
  }

  async getPage({ slug }: SlugParamDto) {
    return this.requireContent(await this.repository.findPage(slug));
  }

  private requireContent<T>(content: T | null): T {
    if (content === null) {
      throw new NotFoundException('محتوا یافت نشد.');
    }
    return content;
  }
}
