import React from 'react';
import { useAuth } from '../contexts/AuthContext';

export default function LoginInfo() {
  const { user, loading, logout, token } = useAuth();
  const tokenPresent = Boolean(token);
  const displayName = user?.username || '-';
  const role = user ? (user.is_superuser ? 'admin' : (user.groups?.includes('JWT') ? 'jwt' : 'client')) : (tokenPresent ? 'unknown' : 'anonymous');

  // JWT status: 'yes' if token present, 'available' if user can obtain one, otherwise 'no'
  const jwtStatus = tokenPresent ? 'yes' : (user?.can_get_jwt ? 'available' : 'no');

  // input placeholders for displaying user information
  return (
    <div className="login-info">
      <div className="login-info-column">
        <strong className="login-info-label">User</strong>
        {loading ? <span className="login-info-value">Loading...</span> : <span className="login-info-value">{displayName}</span>}
      </div>

      <div className="login-info-column">
        <strong className="login-info-label">Role</strong>
        <span className="login-info-value">{role}</span>
      </div>

      <div className="login-info-column">
        <strong className="login-info-label">JWT</strong>
        <span className="login-info-value">{jwtStatus}</span>
      </div>

      {(tokenPresent || user?.username) && (
        <button onClick={logout} style={{ marginLeft: 8, height: 28 }}>Logout</button>
      )}
    </div>
  );
}
// output rendered user info from AuthContext
