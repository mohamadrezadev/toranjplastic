import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Req,
  Res,
  StreamableFile,
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';
import { CapabilityGuard, CsrfGuard } from '../identity/auth.guard.js';
import { CAPABILITIES, RequireCapability } from '../identity/capabilities.js';
import type { AuthenticatedRequest } from '../identity/identity.types.js';
import {
  InquiryQuotationRouteDto,
  QuotationDraftInputDto,
  QuotationRouteDto,
  ReviseQuotationDto,
  SendQuotationDto,
  UpdateQuotationDraftDto,
} from './quotation.dto.js';
import { QuotationPdfService } from './quotation-pdf.service.js';
import { QuotationsService } from './quotations.service.js';

@Controller('admin/inquiries/:inquiryId/quotations')
@RequireCapability(CAPABILITIES.QUOTATION_MANAGEMENT)
@UseGuards(CapabilityGuard)
export class AdminQuotationsController {
  constructor(
    private readonly quotations: QuotationsService,
    private readonly pdf: QuotationPdfService,
  ) {}
  private actorId(request: AuthenticatedRequest) {
    return request.auth!.account.id;
  }

  @Get()
  list(@Param() { inquiryId }: InquiryQuotationRouteDto) {
    return this.quotations.adminList(inquiryId);
  }

  @Post()
  @UseGuards(CsrfGuard)
  create(
    @Param() { inquiryId }: InquiryQuotationRouteDto,
    @Body() dto: QuotationDraftInputDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.quotations.createDraft(inquiryId, dto, this.actorId(request));
  }

  @Get(':quotationId')
  get(@Param() { inquiryId, quotationId }: QuotationRouteDto) {
    return this.quotations.adminGet(inquiryId, quotationId);
  }

  @Put(':quotationId')
  @UseGuards(CsrfGuard)
  update(
    @Param() { inquiryId, quotationId }: QuotationRouteDto,
    @Body() dto: UpdateQuotationDraftDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.quotations.updateDraft(
      inquiryId,
      quotationId,
      dto,
      dto.expectedVersion,
      this.actorId(request),
    );
  }

  @Post(':quotationId/revisions')
  @UseGuards(CsrfGuard)
  revise(
    @Param() { inquiryId, quotationId }: QuotationRouteDto,
    @Body() dto: ReviseQuotationDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.quotations.revise(
      inquiryId,
      quotationId,
      dto.expectedVersion,
      this.actorId(request),
    );
  }

  @Post(':quotationId/send')
  @UseGuards(CsrfGuard)
  send(
    @Param() { inquiryId, quotationId }: QuotationRouteDto,
    @Body() dto: SendQuotationDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.quotations.send(
      inquiryId,
      quotationId,
      dto.expectedVersion,
      dto.inquiryExpectedVersion,
      this.actorId(request),
    );
  }

  @Get(':quotationId/pdf')
  async download(
    @Param() { inquiryId, quotationId }: QuotationRouteDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const row = await this.quotations.pdfRowForStaff(inquiryId, quotationId);
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
