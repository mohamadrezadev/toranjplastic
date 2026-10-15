import { Body, Controller, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { CAPABILITIES, RequireCapability } from './capabilities.js';
import { CapabilityGuard, CsrfGuard } from './auth.guard.js';
import { CreateStaffDto, StaffIdParamDto, StaffListQueryDto, UpdateStaffRoleDto, UpdateStaffStatusDto } from './dto/staff.dto.js';
import type { AuthenticatedRequest } from './identity.types.js';
import { StaffService } from './staff.service.js';

@Controller('admin/staff')
@RequireCapability(CAPABILITIES.STAFF_MANAGEMENT)
@UseGuards(CapabilityGuard)
export class StaffController {
  constructor(private readonly staff: StaffService) {}
  private actorId(request: AuthenticatedRequest) { return request.auth!.account.id; }

  @Get() list(@Query() query: StaffListQueryDto) { return this.staff.list(query); }
  @Get(':id') get(@Param() { id }: StaffIdParamDto) { return this.staff.get(id); }
  @Post() @UseGuards(CsrfGuard)
  create(@Body() input: CreateStaffDto, @Req() request: AuthenticatedRequest) { return this.staff.create(input, this.actorId(request)); }
  @Patch(':id/role') @UseGuards(CsrfGuard)
  role(@Param() { id }: StaffIdParamDto, @Body() input: UpdateStaffRoleDto, @Req() request: AuthenticatedRequest) { return this.staff.changeRole(id, input.role, input.expectedVersion, this.actorId(request)); }
  @Patch(':id/status') @UseGuards(CsrfGuard)
  status(@Param() { id }: StaffIdParamDto, @Body() input: UpdateStaffStatusDto, @Req() request: AuthenticatedRequest) { return this.staff.changeStatus(id, input.status, input.expectedVersion, this.actorId(request)); }
}
