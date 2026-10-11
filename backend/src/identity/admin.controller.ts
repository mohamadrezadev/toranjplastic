import { Controller, Get, Header, Req, UseGuards } from '@nestjs/common';
import { AdminGuard } from './auth.guard.js';
import type { AuthenticatedRequest } from './identity.types.js';

@Controller('admin')
export class AdminController {
  @Get('access')
  @Header('Cache-Control', 'no-store')
  @UseGuards(AdminGuard)
  access(@Req() request: AuthenticatedRequest) { return { account: request.auth!.account, authorized: true }; }
}
