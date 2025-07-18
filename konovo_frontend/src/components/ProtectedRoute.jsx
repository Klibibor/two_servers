import { Navigate } from 'react-router-dom';
import { getUserFromToken } from '../utils/auth';

function ProtectedRoute({ children, allowedRoles = [] }) {
  const user = getUserFromToken();

  if (!user) return <Navigate to="/login" />;

  if (user.is_superuser) return children;

  // normalizuj grupu
  const role = (user.role || user.groups?.[0] || "").toLowerCase();
  const normalizedAllowed = allowedRoles.map(r => r.toLowerCase());

  if (normalizedAllowed.length > 0 && !normalizedAllowed.includes(role)) {
    return <Navigate to="/" />;
  }

  return children;
}

export default ProtectedRoute;
