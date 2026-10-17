import {
  Controller,
  Get,
  Param,
  Req,
  Res,
  StreamableFile,
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';
import { AuthGuard } from '../identity/auth.guard.js';
import type { AuthenticatedRequest } from '../identity/identity.types.js';
import {
  InquiryQuotationRouteDto,
  QuotationRouteDto,
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
