import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller.js';
import { AdminGuard, AuthGuard, CapabilityGuard, CsrfGuard } from './auth.guard.js';
import { IdentityController } from './identity.controller.js';
import { IdentityService } from './identity.service.js';
import { StaffController } from './staff.controller.js';
import { StaffService } from './staff.service.js';

@Module({ controllers: [IdentityController, AdminController, StaffController], providers: [IdentityService, StaffService, AuthGuard, AdminGuard, CapabilityGuard, CsrfGuard], exports: [IdentityService, StaffService, AuthGuard, AdminGuard, CapabilityGuard, CsrfGuard] })
export class IdentityModule {}
