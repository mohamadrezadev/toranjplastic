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
  CreateProductDto,
  UpdateProductDto,
} from '../dto/admin-product.dto.js';
import { AdminProductQueryDto, IdParamDto } from '../dto/admin-query.dto.js';
import { AdminProductService } from './product.service.js';

@Controller('admin/content/products')
@RequireCapability(CAPABILITIES.CONTENT_MANAGEMENT)
@UseGuards(CapabilityGuard)
export class AdminProductController {
  constructor(private readonly products: AdminProductService) {}
  private actorId(request: AuthenticatedRequest) {
    return request.auth!.account.id;
  }

  @Get() list(@Query() query: AdminProductQueryDto) {
    return this.products.list(query);
  }
  @Get(':id') get(@Param() { id }: IdParamDto) {
    return this.products.get(id);
  }
  @Post()
  @UseGuards(CsrfGuard)
  create(@Body() dto: CreateProductDto, @Req() request: AuthenticatedRequest) {
    return this.products.create(dto, this.actorId(request));
  }
  @Patch(':id')
  @UseGuards(CsrfGuard)
  update(
    @Param() { id }: IdParamDto,
    @Body() dto: UpdateProductDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.products.update(id, dto, this.actorId(request));
  }
  @Post(':id/publish')
  @HttpCode(200)
  @UseGuards(CsrfGuard)
  publish(@Param() { id }: IdParamDto, @Req() request: AuthenticatedRequest) {
    return this.products.publish(id, this.actorId(request));
  }
  @Post(':id/archive')
  @HttpCode(200)
  @UseGuards(CsrfGuard)
  archive(@Param() { id }: IdParamDto, @Req() request: AuthenticatedRequest) {
    return this.products.archive(id, this.actorId(request));
  }
}
