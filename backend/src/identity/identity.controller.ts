import { Body, Controller, Get, Header, Post, Req, Res, UseGuards } from '@nestjs/common';
import type { Request, Response } from 'express';
import { AuthGuard } from './auth.guard.js';
import { PasswordLoginDto } from './dto/login.dto.js';
import { RegisterDto } from './dto/register.dto.js';
import { IdentityService } from './identity.service.js';
import type { AuthenticatedRequest } from './identity.types.js';

@Controller('auth')
export class IdentityController {
  constructor(private readonly identity: IdentityService) {}

  @Get('csrf')
  @Header('Cache-Control', 'no-store')
  csrf(@Res({ passthrough: true }) response: Response) { return this.identity.issueCsrf(response); }

  @Post('register')
  @Header('Cache-Control', 'no-store')
  register(@Body() input: RegisterDto, @Req() request: Request) {
    this.identity.assertOrigin(request.headers.origin);
    return this.identity.register(input, request.ip ?? 'unknown');
  }

  @Post('login/password')
  @Header('Cache-Control', 'no-store')
  login(@Body() input: PasswordLoginDto, @Req() request: Request, @Res({ passthrough: true }) response: Response) {
    this.identity.assertOrigin(request.headers.origin);
    return this.identity.login(input, request.ip ?? 'unknown', request.headers.cookie, response);
  }

  @Get('me')
  @Header('Cache-Control', 'no-store')
  @UseGuards(AuthGuard)
  me(@Req() request: AuthenticatedRequest) { return request.auth!.account; }

  @Post('logout')
  @Header('Cache-Control', 'no-store')
  @UseGuards(AuthGuard)
  logout(@Req() request: AuthenticatedRequest, @Res({ passthrough: true }) response: Response) {
    this.identity.assertOrigin(request.headers.origin);
    return this.identity.logout(request, response);
  }
}
