import { describe, expect, it } from 'vitest';
import { digestToken, hashPassword, normalizeIranianMobile, readCookie, verifyPassword } from './identity.security.js';

describe('identity security', () => {
  it.each(['09123456789', '989123456789', '00989123456789', '+989123456789'])('normalizes %s', (input) => {
    expect(normalizeIranianMobile(input)).toBe('+989123456789');
  });
  it('rejects non-mobile values', () => expect(() => normalizeIranianMobile('123')).toThrow('INVALID_MOBILE'));
  it('hashes and verifies without retaining plaintext', async () => {
    const hash = await hashPassword('strong-password');
    expect(hash).toMatch(/^\$argon2id\$/);
    expect(hash).not.toContain('strong-password');
    expect(await verifyPassword(hash, 'strong-password')).toBe(true);
    expect(await verifyPassword(hash, 'wrong-password')).toBe(false);
  });
  it('digests tokens and parses exact cookies', () => {
    expect(digestToken('a')).toHaveLength(64);
    expect(readCookie('one=1; toranj_session=abc%201', 'toranj_session')).toBe('abc 1');
  });
});
