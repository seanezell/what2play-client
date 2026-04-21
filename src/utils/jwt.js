/**
 * Decode the payload segment of a JWT (browser: base64url via atob).
 * Returns null if the token is missing, malformed, or not valid JSON.
 */
export function decodeJwtPayload(token) {
  if (!token || typeof token !== 'string') return null;
  try {
    const parts = token.split('.');
    if (parts.length < 2) return null;
    const payload = JSON.parse(atob(parts[1]));
    return payload && typeof payload === 'object' ? payload : null;
  } catch {
    return null;
  }
}
