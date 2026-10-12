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
  CreateInjectionServiceDto,
  UpdateInjectionServiceDto,
} from '../dto/admin-injection-service.dto.js';
import { AdminPaginationQueryDto, IdParamDto } from '../dto/admin-query.dto.js';
import { AdminInjectionServiceService } from './injection-service.service.js';

@Controller('admin/content/services')
@UseGuards(AdminGuard)
export class AdminInjectionServiceController {
  constructor(private readonly services: AdminInjectionServiceService) {}
  private actorId(request: AuthenticatedRequest) {
    return request.auth!.account.id;
  }

  @Get() list(@Query() query: AdminPaginationQueryDto) {
    return this.services.list(query);
  }
  @Get(':id') get(@Param() { id }: IdParamDto) {
    return this.services.get(id);
  }
  @Post()
  @UseGuards(CsrfGuard)
  create(
    @Body() dto: CreateInjectionServiceDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.services.create(dto, this.actorId(request));
  }
  @Patch(':id')
  @UseGuards(CsrfGuard)
  update(
    @Param() { id }: IdParamDto,
    @Body() dto: UpdateInjectionServiceDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.services.update(id, dto, this.actorId(request));
  }
  @Post(':id/publish')
  @HttpCode(200)
  @UseGuards(CsrfGuard)
  publish(@Param() { id }: IdParamDto, @Req() request: AuthenticatedRequest) {
    return this.services.publish(id, this.actorId(request));
  }
  @Post(':id/archive')
  @HttpCode(200)
  @UseGuards(CsrfGuard)
  archive(@Param() { id }: IdParamDto, @Req() request: AuthenticatedRequest) {
    return this.services.archive(id, this.actorId(request));
  }
}
