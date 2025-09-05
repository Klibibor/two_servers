import apiFetch from '../utils/api';
import tokenStore from '../utils/tokenStore';

// Mock fetch globally
global.fetch = jest.fn();

// Mock tokenStore
jest.mock('../utils/tokenStore', () => ({
  __esModule: true,
  default: {
    getToken: jest.fn(),
    setToken: jest.fn(),
  },
}));

// Mock getCookie function (for CSRF token)
Object.defineProperty(document, 'cookie', {
  writable: true,
  value: 'csrftoken=mock-csrf-token',
});

describe('apiFetch with cookie-based refresh', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    fetch.mockClear();
    tokenStore.getToken.mockReturnValue('valid-access-token');
  });

  it('should make successful request with JWT token', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: 'success' }),
    });

    const response = await apiFetch('/api/products/', { method: 'GET' });
    const data = await response.json();

    expect(fetch).toHaveBeenCalledWith('http://localhost:8000/api/products/', {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer valid-access-token',
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });
    expect(data).toEqual({ data: 'success' });
  });

  it('should refresh token on 401 and retry request', async () => {
    // First call returns 401
    fetch
      .mockResolvedValueOnce({
        ok: false,
        status: 401,
      })
      // Refresh call succeeds
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ access: 'new-access-token' }),
      })
      // Retry call succeeds
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: 'success after refresh' }),
      });

    const response = await apiFetch('/api/products/', { method: 'GET' });
    const data = await response.json();

    // Should have made 3 calls: original, refresh, retry
    expect(fetch).toHaveBeenCalledTimes(3);
    
    // Check refresh call was made correctly (cookie-based)
    expect(fetch).toHaveBeenNthCalledWith(2, 'http://localhost:8000/api/auth/token/refresh/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': 'mock-csrf-token',
      },
      credentials: 'include',
    });
    
    // Check that new token was stored
    expect(tokenStore.setToken).toHaveBeenCalledWith('new-access-token');
    
    // Check retry call used new token
    expect(fetch).toHaveBeenNthCalledWith(3, 'http://localhost:8000/api/products/', {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer new-access-token',
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    expect(data).toEqual({ data: 'success after refresh' });
  });

  it('should include CSRF token for unsafe methods', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    });

    await apiFetch('/api/products/', { 
      method: 'POST', 
      body: JSON.stringify({ naziv: 'Test Product' })
    });

    expect(fetch).toHaveBeenCalledWith('http://localhost:8000/api/products/', {
      method: 'POST',
      body: '{"naziv":"Test Product"}',
      headers: {
        'Authorization': 'Bearer valid-access-token',
        'Content-Type': 'application/json',
        'X-CSRFToken': 'mock-csrf-token',
      },
      credentials: 'include',
    });
  });

  it('should not auto-refresh for auth endpoints', async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
    });

    const response = await apiFetch('/api/auth/login/', { method: 'POST' });

    // Should only make 1 call (no refresh attempt)
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(response.status).toBe(401);
  });
});
