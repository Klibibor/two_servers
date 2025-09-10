// Tiny in-memory token store. Keeps JWT in JS memory (not persisted).
// input initial state
let _token = null;

export function setToken(token) {
  _token = token;
}

// input function for getting token
export function getToken() {
  return _token;
}

// input function for clearing token
export function clearToken() {
  _token = null;
}

const tokenStore = { setToken, getToken, clearToken };
export default tokenStore;

// output callable functions