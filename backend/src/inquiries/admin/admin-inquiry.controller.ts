import { Body, Controller, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { AdminGuard, CsrfGuard } from '../../identity/auth.guard.js';
import type { AuthenticatedRequest } from '../../identity/identity.types.js';
import { InquiryIdParamDto } from '../dto/inquiry.dto.js';
import { AddInquiryNoteDto, AdminInquiryListQueryDto, UpdateInquiryAssignmentDto, UpdateInquiryStatusDto } from './admin-inquiry.dto.js';
import { AdminInquiryService } from './admin-inquiry.service.js';

@Controller('admin/inquiries')
@UseGuards(AdminGuard)
export class AdminInquiryController {
  constructor(private readonly inquiries: AdminInquiryService) {}
  private actorId(request: AuthenticatedRequest) { return request.auth!.account.id; }

  @Get()
  list(@Query() query: AdminInquiryListQueryDto) { return this.inquiries.list(query); }

  @Get('summary')
  summary() { return this.inquiries.summary(); }

  @Get('assignees')
  assignees() { return this.inquiries.assignees(); }

  @Get(':id')
  get(@Param() { id }: InquiryIdParamDto) { return this.inquiries.get(id); }

  @Patch(':id/assignment') @UseGuards(CsrfGuard)
  assign(@Param() { id }: InquiryIdParamDto, @Body() dto: UpdateInquiryAssignmentDto, @Req() request: AuthenticatedRequest) {
    return this.inquiries.assign(id, dto.assignedAdminId ?? null, dto.expectedVersion, this.actorId(request));
  }

  @Post(':id/status') @UseGuards(CsrfGuard)
  status(@Param() { id }: InquiryIdParamDto, @Body() dto: UpdateInquiryStatusDto, @Req() request: AuthenticatedRequest) {
    return this.inquiries.transition(id, dto.toStatus, dto.expectedVersion, this.actorId(request));
  }

  @Post(':id/notes') @UseGuards(CsrfGuard)
  note(@Param() { id }: InquiryIdParamDto, @Body() dto: AddInquiryNoteDto, @Req() request: AuthenticatedRequest) {
    return this.inquiries.addNote(id, dto.text, this.actorId(request));
  }
}
