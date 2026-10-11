import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller.js';
import { AdminGuard, AuthGuard } from './auth.guard.js';
import { IdentityController } from './identity.controller.js';
import { IdentityService } from './identity.service.js';

@Module({ controllers: [IdentityController, AdminController], providers: [IdentityService, AuthGuard, AdminGuard], exports: [IdentityService, AuthGuard, AdminGuard] })
export class IdentityModule {}
