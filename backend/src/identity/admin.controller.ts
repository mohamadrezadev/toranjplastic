import { Controller, Get, Header, Req, UseGuards } from '@nestjs/common';
import { CapabilityGuard } from './auth.guard.js';
import { CAPABILITIES, RequireCapability } from './capabilities.js';
import type { AuthenticatedRequest } from './identity.types.js';

@Controller('admin')
export class AdminController {
  @Get('access')
  @Header('Cache-Control', 'no-store')
  @RequireCapability(CAPABILITIES.MANAGEMENT_ACCESS)
  @UseGuards(CapabilityGuard)
  access(@Req() request: AuthenticatedRequest) { return { account: request.auth!.account, authorized: true }; }
}
