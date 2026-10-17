import { SetMetadata } from '@nestjs/common';
import type { UserRole } from '../generated/prisma/enums.js';

export const CAPABILITIES = {
  MANAGEMENT_ACCESS: 'MANAGEMENT_ACCESS',
  STAFF_MANAGEMENT: 'STAFF_MANAGEMENT',
  INQUIRY_OPERATIONS: 'INQUIRY_OPERATIONS',
  CONTENT_MANAGEMENT: 'CONTENT_MANAGEMENT',
  QUOTATION_MANAGEMENT: 'QUOTATION_MANAGEMENT',
} as const;

export type Capability = (typeof CAPABILITIES)[keyof typeof CAPABILITIES];

const roleCapabilities: Record<UserRole, readonly Capability[]> = {
  CUSTOMER: [],
  ADMIN: [
    CAPABILITIES.MANAGEMENT_ACCESS,
    CAPABILITIES.STAFF_MANAGEMENT,
    CAPABILITIES.INQUIRY_OPERATIONS,
    CAPABILITIES.CONTENT_MANAGEMENT,
    CAPABILITIES.QUOTATION_MANAGEMENT,
  ],
  SALES: [
    CAPABILITIES.MANAGEMENT_ACCESS,
    CAPABILITIES.INQUIRY_OPERATIONS,
    CAPABILITIES.QUOTATION_MANAGEMENT,
  ],
  OPERATOR: [CAPABILITIES.MANAGEMENT_ACCESS, CAPABILITIES.CONTENT_MANAGEMENT],
};

export const capabilitiesForRole = (role: UserRole): Capability[] => [
  ...roleCapabilities[role],
];
export const roleHasCapability = (role: UserRole, capability: Capability) =>
  roleCapabilities[role].includes(capability);

export const REQUIRED_CAPABILITY = 'required-capability';
export const RequireCapability = (capability: Capability) =>
  SetMetadata(REQUIRED_CAPABILITY, capability);
