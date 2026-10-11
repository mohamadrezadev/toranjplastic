import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller.js';
import { AdminGuard, AuthGuard, CsrfGuard } from './auth.guard.js';
import { IdentityController } from './identity.controller.js';
import { IdentityService } from './identity.service.js';

@Module({ controllers: [IdentityController, AdminController], providers: [IdentityService, AuthGuard, AdminGuard, CsrfGuard], exports: [IdentityService, AuthGuard, AdminGuard, CsrfGuard] })
export class IdentityModule {}
