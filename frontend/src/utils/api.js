import tokenStore from './tokenStore'; 

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:8000'; // api base url

// input getCookie function
function getCookie(name) {
  if (typeof document === 'undefined') return null; // if document is not a type return null
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)')); // in document separate token from header
  return match ? decodeURIComponent(match[2]) : null; // if there is a token return it
}
// output found CSRF token in cookie

// input fetch call to backend for refreshing access token
async function refreshAccessToken() {
  const response = await fetch(`${API_BASE}/api/auth/token/refresh/`, { //url for refreshing token
    method: 'POST', 
    credentials: 'include', // include cookies in the request
    headers: {
      'Content-Type': 'application/json', 
      'X-CSRFToken': getCookie('csrftoken'), // add CSRF token to header 
    },
  });

  if (!response.ok) {   // if response is 401 or other error ==> not ok
    throw new Error('Refresh token invalid or expired');
  }
  const data = await response.json();
  if (data.access) { 
    tokenStore.setToken(data.access); // Update access token in memory
    return data.access;
  }
  // If no access token is received, throw an error
  throw new Error('No access token received');
}
// output wrapper function that returns new access token or throws error + sets token in tokenStore


// input apiFetch function that automatically adds JWT token and CSRF token to requests
export default async function apiFetch(url, options = {}) {  
  const fullUrl = url.startsWith('http') ? url : `${API_BASE}${url}`;
  
  // sets up variable that will later be used for preventing infinite loops
  const isAuthEndpoint = url.includes('/auth/token/') || url.includes('/auth/login/');
  
  // Default headers
  const headers = {
    ...options.headers,// with above payload ⬆️ make headers
  };

  // Add JWT token if available
  const token = tokenStore.getToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Add CSRF token for unsafe methods
  if (options.method && !['GET', 'HEAD', 'OPTIONS'].includes(options.method.toUpperCase())) {
    const csrfToken = getCookie('csrftoken');
    if (csrfToken) {
      headers['X-CSRFToken'] = csrfToken;
    }
  }

  // Don't set Content-Type for FormData (let browser set it with boundary)
  if (!(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  // Make the initial request
  let response = await fetch(fullUrl, {
    ...options,
    headers,
    credentials: 'include', // Important for HttpOnly cookies
  });

  // If we get 401 and it's not an auth endpoint, try to refresh token (cookie-based)
  if (response.status === 401 && !isAuthEndpoint) {
    try {
      console.log('Access token expired, attempting refresh...');
      const newAccessToken = await refreshAccessToken();
      
      // Retry the original request with new token
      headers['Authorization'] = `Bearer ${newAccessToken}`;
      response = await fetch(fullUrl, {
        ...options,
        headers,
        credentials: 'include',
      });
      
      console.log('Token refreshed successfully, request retried');
  } catch (refreshError) {
      console.warn('Token refresh failed:', refreshError.message);
      // Don't throw here - let the caller handle the 401 response
      // This allows logout/redirect logic to work properly
    }
  }

  return response; // return the final response (original or retried)
}

// input PublicApiFetch - for public endpoints without JWT authentication
export async function PublicApiFetch(url, options = {}) {
  const fullUrl = url.startsWith('http') ? url : `${API_BASE}${url}`;
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // Add CSRF token for unsafe methods (even for public endpoints)
  if (options.method && !['GET', 'HEAD', 'OPTIONS'].includes(options.method.toUpperCase())) {
    const csrfToken = getCookie('csrftoken');
    if (csrfToken) {
      headers['X-CSRFToken'] = csrfToken;
    }
  }

  // Don't set Content-Type for FormData, let browser set it with boundary if needed
  if (options.body instanceof FormData && headers['Content-Type'] === 'application/json') {
    delete headers['Content-Type'];
  }

  return fetch(fullUrl, {
    ...options,
    headers,
    credentials: 'include',
  });
}

// input ProtectedApiFetch - for protected endpoints with JWT authentication
export async function ProtectedApiFetch(url, options = {}) {
  const fullUrl = url.startsWith('http') ? url : `${API_BASE}${url}`;
  
  // Don't auto-refresh for auth endpoints to avoid infinite loops
  const isAuthEndpoint = url.includes('/auth/token/') || url.includes('/auth/login/');
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // Add JWT token (required for protected endpoints)
  const token = tokenStore.getToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Add CSRF token for unsafe methods
  if (options.method && !['GET', 'HEAD', 'OPTIONS'].includes(options.method.toUpperCase())) {
    const csrfToken = getCookie('csrftoken');
    if (csrfToken) {
      headers['X-CSRFToken'] = csrfToken;
    }
  }

  // Don't set Content-Type for FormData
  if (options.body instanceof FormData && headers['Content-Type'] === 'application/json') {
    delete headers['Content-Type'];
  }

  // Make the initial request
  let response = await fetch(fullUrl, {
    ...options,
    headers,
    credentials: 'include',
  });

  // Auto-refresh token on 401 (if not auth endpoint)
  if (response.status === 401 && !isAuthEndpoint && token) {
    try {
      console.log('Access token expired, attempting refresh...');
      const newAccessToken = await refreshAccessToken();
      
      // Retry the original request with new token
      headers['Authorization'] = `Bearer ${newAccessToken}`;
      response = await fetch(fullUrl, {
        ...options,
        headers,
        credentials: 'include',
      });
      
      console.log('Token refreshed successfully, request retried');
    } catch (refreshError) {
      console.warn('Token refresh failed:', refreshError.message);
      // Don't throw here - let the caller handle the 401 response
    }
  }

  return response;
}
