import { CanActivate, ExecutionContext, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import type { AuthenticatedRequest } from './identity.types.js';
import { IdentityService } from './identity.service.js';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly identity: IdentityService) {}
  async canActivate(context: ExecutionContext) {
    await this.identity.authenticate(context.switchToHttp().getRequest<AuthenticatedRequest>());
    return true;
  }
}

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private readonly identity: IdentityService) {}
  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const auth = request.auth ?? await this.identity.authenticate(request);
    if (!auth) throw new UnauthorizedException();
    if (auth.account.role !== 'ADMIN') throw new ForbiddenException('دسترسی به این بخش مجاز نیست.');
    return true;
  }
}

@Injectable()
export class CsrfGuard implements CanActivate {
  constructor(private readonly identity: IdentityService) {}
  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    this.identity.assertCsrf(request);
    return true;
  }
}
