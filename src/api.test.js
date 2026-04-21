import { describe, it, expect, vi, beforeEach } from 'vitest';
import { apiCall } from './api';

vi.mock('./auth', () => ({
  getIdToken: vi.fn(() => 'test-id-token'),
  isTokenExpired: vi.fn(() => false),
  login: vi.fn(),
  logout: vi.fn(),
}));

describe('apiCall', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ items: [] }),
      })
    );
  });

  it('returns parsed JSON on success', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ ok: true, count: 2 }),
    });
    const out = await apiCall('/w2p/test');
    expect(out).toEqual({ ok: true, count: 2 });
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/w2p/test'),
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer test-id-token',
        }),
      })
    );
  });

  it('throws with API error field when present', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 400,
      statusText: 'Bad Request',
      json: async () => ({ error: 'Invalid input' }),
    });
    await expect(apiCall('/bad')).rejects.toThrow('Invalid input');
  });

  it('throws status-based message when body is not JSON', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 502,
      statusText: 'Bad Gateway',
      json: async () => {
        throw new Error('not json');
      },
    });
    await expect(apiCall('/bad')).rejects.toThrow(/502/);
  });
});
