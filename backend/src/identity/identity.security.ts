import { createHash, randomBytes } from 'node:crypto';
import argon2 from 'argon2';

const mobilePattern = /^9\d{9}$/;

export function normalizeIranianMobile(value: string): string {
  const compact = value.trim().replace(/[\s()-]/g, '');
  const local = compact.startsWith('+98') ? compact.slice(3) : compact.startsWith('0098') ? compact.slice(4) : compact.startsWith('98') ? compact.slice(2) : compact.startsWith('0') ? compact.slice(1) : compact;
  if (!mobilePattern.test(local)) throw new Error('INVALID_MOBILE');
  return `+98${local}`;
}

export function validatePassword(value: string): void {
  if (value.length < 10 || value.length > 128) throw new Error('INVALID_PASSWORD');
}

export function hashPassword(password: string) {
  validatePassword(password);
  return argon2.hash(password, { type: argon2.argon2id, memoryCost: 19_456, timeCost: 2, parallelism: 1 });
}

export function verifyPassword(hash: string, password: string) {
  return argon2.verify(hash, password);
}

export const randomToken = () => randomBytes(32).toString('base64url');
export const digestToken = (value: string) => createHash('sha256').update(value).digest('hex');

export function readCookie(cookieHeader: string | undefined, name: string): string | undefined {
  for (const part of cookieHeader?.split(';') ?? []) {
    const [rawName, ...rawValue] = part.trim().split('=');
    if (rawName === name) return decodeURIComponent(rawValue.join('='));
  }
  return undefined;
}
