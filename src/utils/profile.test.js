import { describe, it, expect } from 'vitest';
import { normalizeProfile } from './profile';

describe('normalizeProfile', () => {
  it('returns null for null/undefined', () => {
    expect(normalizeProfile(null)).toBeNull();
    expect(normalizeProfile(undefined)).toBeNull();
  });

  it('unwraps profile wrapper', () => {
    const p = normalizeProfile({
      profile: {
        username: 'u1',
        real_name: 'Real',
        preferred_platform: 'PC',
        avatar_url: 'https://x/a.png',
      },
    });
    expect(p).toEqual({
      username: 'u1',
      real_name: 'Real',
      preferred_platform: 'PC',
      avatar_url: 'https://x/a.png',
    });
  });

  it('unwraps user wrapper and alternate field names', () => {
    const p = normalizeProfile({
      user: {
        user_name: 'legacy',
        realName: 'N',
        preferredPlatform: 'PC',
        avatarUrl: 'https://y/b.png',
      },
    });
    expect(p.username).toBe('legacy');
    expect(p.real_name).toBe('N');
    expect(p.avatar_url).toBe('https://y/b.png');
  });

  it('uses flat object when no wrapper', () => {
    const p = normalizeProfile({
      username: 'flat',
      real_name: 'F',
      preferred_platform: 'PC',
      avatar_url: '',
    });
    expect(p.username).toBe('flat');
  });
});
