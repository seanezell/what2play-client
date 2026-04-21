import { describe, it, expect } from 'vitest';
import { decodeJwtPayload } from './jwt';

function jwtWithPayload(payloadObj) {
  const payload = btoa(JSON.stringify(payloadObj));
  return `eyJhbGciOiJIUzI1NiJ9.${payload}.sig`;
}

describe('decodeJwtPayload', () => {
  it('returns parsed payload for a valid JWT-shaped token', () => {
    const token = jwtWithPayload({ sub: 'user-1', exp: 9_999_999_999, email: 'a@b.com' });
    const p = decodeJwtPayload(token);
    expect(p.sub).toBe('user-1');
    expect(p.email).toBe('a@b.com');
  });

  it('returns null for missing or non-string token', () => {
    expect(decodeJwtPayload(null)).toBeNull();
    expect(decodeJwtPayload('')).toBeNull();
    expect(decodeJwtPayload(123)).toBeNull();
  });

  it('returns null for malformed segments', () => {
    expect(decodeJwtPayload('not-a-jwt')).toBeNull();
    expect(decodeJwtPayload('a.b')).toBeNull();
  });

  it('returns null when payload is not valid JSON', () => {
    const bad = `eyJhbGciOiJIUzI1NiJ9.${btoa('@@@')}.sig`;
    expect(decodeJwtPayload(bad)).toBeNull();
  });
});
