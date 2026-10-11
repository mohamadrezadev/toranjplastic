import type { Request } from 'express';
import type { AccountStatus, UserRole } from '../generated/prisma/enums.js';

export interface PublicAccount {
  id: string;
  mobile: string;
  displayName: string;
  email: string | null;
  companyName: string | null;
  role: UserRole;
  status: AccountStatus;
  createdAt: Date;
  lastLoginAt: Date | null;
}

export interface AuthenticatedRequest extends Request {
  auth?: { account: PublicAccount; sessionId: string; csrfDigest: string };
}
