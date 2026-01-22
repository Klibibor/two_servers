// input files that will be tested
import apiFetch from '../utils/api';
import tokenStore from '../utils/tokenStore';

// input Mock function for fetch, imitate backend responses
global.fetch = jest.fn();

// input Mock tokenStore.js, imitate getting and setting token
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

// input function that will set up tokenStore.getToken to return specific token value
describe('apiFetch with cookie-based refresh', () => {//describe api that all other tests will use + "it"
  beforeEach(() => {                                  // loop before each test
    jest.clearAllMocks();                             // 1. clear all mocks
    fetch.mockClear();                                // 2. clear fetch mock
    tokenStore.getToken.mockReturnValue('valid-access-token'); // 3. set token to "valid-access-token"
  });

  // input test cases for apiFetch for product
  it('should make successful request with JWT token', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: 'success' }), // mock backed response for successful call
    });
//  input apiFetch call to backend api/products 
    const response = await apiFetch('/api/products/', { method: 'GET' });
    const data = await response.json(); // expects data from above mock

    expect(fetch).toHaveBeenCalledWith('http://localhost:8000/api/products/', {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer valid-access-token',
        'Content-Type': 'application/json',
      },
      credentials: 'include', // include cookies
    });
    expect(data).toEqual({ data: 'success' });
  });
  // output should call fetch with correct URL, method, headers, and credentials + return success data

// input response with 401 
  it('should refresh token on 401 and retry request', async () => {
    // First call returns 401
    fetch
      .mockResolvedValueOnce({
        ok: false, // fetch function translates response 401 ==> not authorized
        status: 401, // real backend would return 401 status code
      })
      // Refresh call succeeds
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ access: 'new-access-token' }),// mocks data payload acess: 'new-access-token'
      })                                                    
      // Retry call succeeds
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: 'success after refresh' }),// mocks data payload data: "success after..."
      });

    const response = await apiFetch('/api/products/', { method: 'GET' });
    const data = await response.json();

    // Should have made 3 calls: original, refresh, retry
    expect(fetch).toHaveBeenCalledTimes(3);
  // output should call fetch 3 times: original, refresh, retry

    // input Check refresh call was made correctly (cookie-based)
    expect(fetch).toHaveBeenNthCalledWith(2, 'http://localhost:8000/api/auth/token/refresh/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': 'mock-csrf-token',
      },
      credentials: 'include', // include cookies
    });
    // Check that new token was stored
    expect(tokenStore.setToken).toHaveBeenCalledWith('new-access-token'); // should return new token
                                               // from mocked refresh call access: 'new-access-token'
    // Check retry call used new token
    expect(fetch).toHaveBeenNthCalledWith(3, 'http://localhost:8000/api/products/', {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer new-access-token',
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    expect(data).toEqual({ data: 'success after refresh' }); // should return data
  });                                             // mocked in retry call data: "success after..."
  // output should return data after successful retry and refresh
 
// input mock backend response
  it('should include CSRF token for unsafe methods', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    });
    // if apiFetch is called with POST method returns name "Test Product"
    await apiFetch('/api/products/', { 
      method: 'POST', 
      body: JSON.stringify({ name: 'Test Product' })
    });

    expect(fetch).toHaveBeenCalledWith('http://localhost:8000/api/products/', {
      method: 'POST',
      body: '{"name":"Test Product"}',
      headers: {
        'Authorization': 'Bearer valid-access-token',
        'Content-Type': 'application/json',
        'X-CSRFToken': 'mock-csrf-token',
      },
      credentials: 'include',
    });
  });
// output should be headers with CSRF token for unsafe methods

// input test 
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
