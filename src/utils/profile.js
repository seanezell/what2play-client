/**
 * Normalize profile payloads from GET /profile (various wrapper shapes).
 */
export function normalizeProfile(p) {
  if (!p) return null;
  const src = p.profile || p.user || p.data || p;
  return {
    username: src.username || src.user_name || src.userName || src.name || '',
    real_name: src.real_name || src.realName || src.name || '',
    preferred_platform: src.preferred_platform || src.preferredPlatform || src.platform || '',
    avatar_url: src.avatar_url || src.avatarUrl || '',
  };
}
