import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  Res,
  StreamableFile,
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';
import { AuthGuard, CsrfGuard } from '../identity/auth.guard.js';
import type { AuthenticatedRequest } from '../identity/identity.types.js';
import {
  AcceptQuotationDto,
  InquiryQuotationRouteDto,
  QuotationRouteDto,
  RejectQuotationDto,
} from './quotation.dto.js';
import { QuotationPdfService } from './quotation-pdf.service.js';
import { QuotationsService } from './quotations.service.js';

@Controller('inquiries/:inquiryId/quotations')
@UseGuards(AuthGuard)
export class CustomerQuotationsController {
  constructor(
    private readonly quotations: QuotationsService,
    private readonly pdf: QuotationPdfService,
  ) {}
  private ownerId(request: AuthenticatedRequest) {
    return request.auth!.account.id;
  }

  @Get()
  list(
    @Param() { inquiryId }: InquiryQuotationRouteDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.quotations.customerList(this.ownerId(request), inquiryId);
  }

  @Get(':quotationId')
  get(
    @Param() { inquiryId, quotationId }: QuotationRouteDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.quotations.customerGet(
      this.ownerId(request),
      inquiryId,
      quotationId,
    );
  }

  @Post(':quotationId/accept')
  @UseGuards(CsrfGuard)
  accept(
    @Param() { inquiryId, quotationId }: QuotationRouteDto,
    @Body() dto: AcceptQuotationDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.quotations.customerAccept(
      inquiryId,
      quotationId,
      dto.quotationVersion,
      dto.inquiryExpectedVersion,
      this.ownerId(request),
    );
  }

  @Post(':quotationId/reject')
  @UseGuards(CsrfGuard)
  reject(
    @Param() { inquiryId, quotationId }: QuotationRouteDto,
    @Body() dto: RejectQuotationDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.quotations.customerReject(
      inquiryId,
      quotationId,
      dto.quotationVersion,
      dto.inquiryExpectedVersion,
      dto.reason,
      this.ownerId(request),
    );
  }

  @Get(':quotationId/pdf')
  async download(
    @Param() { inquiryId, quotationId }: QuotationRouteDto,
    @Req() request: AuthenticatedRequest,
    @Res({ passthrough: true }) response: Response,
  ) {
    const row = await this.quotations.pdfRowForCustomer(
      this.ownerId(request),
      inquiryId,
      quotationId,
    );
    const buffer = await this.pdf.render(row);
    response.setHeader('Content-Type', 'application/pdf');
    response.setHeader('Cache-Control', 'private, no-store');
    response.setHeader(
      'Content-Disposition',
      `attachment; filename="quotation-${row.quotationNumber}-v${row.version}.pdf"`,
    );
    return new StreamableFile(buffer);
  }
}
