import { Body, Controller, Get, Param, Post, Query, Req, UseGuards } from '@nestjs/common';
import { AuthGuard, CsrfGuard } from '../identity/auth.guard.js';
import type { AuthenticatedRequest } from '../identity/identity.types.js';
import { CreateContactInquiryDto, CreateInjectionInquiryDto, CreateMaterialInquiryDto, CreateProductInquiryDto, InquiryIdParamDto, InquiryListQueryDto } from './dto/inquiry.dto.js';
import { InquiryService } from './inquiry.service.js';

@Controller('inquiries')
@UseGuards(AuthGuard)
export class InquiryController {
  constructor(private readonly inquiries: InquiryService) {}
  private ownerId(request: AuthenticatedRequest) { return request.auth!.account.id; }

  @Get()
  list(@Query() query: InquiryListQueryDto, @Req() request: AuthenticatedRequest) {
    return this.inquiries.list(this.ownerId(request), query);
  }

  @Get(':id')
  get(@Param() { id }: InquiryIdParamDto, @Req() request: AuthenticatedRequest) {
    return this.inquiries.get(this.ownerId(request), id);
  }

  @Post('product') @UseGuards(CsrfGuard)
  product(@Body() dto: CreateProductInquiryDto, @Req() request: AuthenticatedRequest) { return this.inquiries.createProduct(this.ownerId(request), dto); }

  @Post('injection-service') @UseGuards(CsrfGuard)
  injection(@Body() dto: CreateInjectionInquiryDto, @Req() request: AuthenticatedRequest) { return this.inquiries.createInjection(this.ownerId(request), dto); }

  @Post('material') @UseGuards(CsrfGuard)
  material(@Body() dto: CreateMaterialInquiryDto, @Req() request: AuthenticatedRequest) { return this.inquiries.createMaterial(this.ownerId(request), dto); }

  @Post('contact') @UseGuards(CsrfGuard)
  contact(@Body() dto: CreateContactInquiryDto, @Req() request: AuthenticatedRequest) { return this.inquiries.createContact(this.ownerId(request), dto); }
}
