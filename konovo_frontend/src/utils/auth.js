import { jwtDecode } from "jwt-decode";

export function isAuthenticated() {
  return !!localStorage.getItem("jwt");
}

export function getUserFromToken() {
  const token = localStorage.getItem("jwt");
  if (!token) return null;

  try {
    const decoded = jwtDecode(token);
    return {
      username: decoded.username,
      is_superuser: decoded.is_superuser,
      role: decoded.role,
      groups: decoded.groups || [],
    };
  } catch (err) {
    console.error("Nevalidan token:", err);
    return null;
  }
}
