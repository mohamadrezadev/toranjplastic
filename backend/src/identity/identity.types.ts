import type { Request } from 'express';
import type { AccountStatus, UserRole } from '../generated/prisma/enums.js';
import type { Capability } from './capabilities.js';

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
  capabilities: Capability[];
}

export interface AuthenticatedRequest extends Request {
  auth?: { account: PublicAccount; sessionId: string; csrfDigest: string };
}
