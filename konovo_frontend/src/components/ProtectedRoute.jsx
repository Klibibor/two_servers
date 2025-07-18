import { Navigate } from 'react-router-dom';
import { getUserFromToken } from '../utils/auth';

function ProtectedRoute({ children, allowedRoles = [] }) {
  const user = getUserFromToken();

  if (!user) return <Navigate to="/login" />;

  if (user.is_superuser) return children;

  const role = user.role || user.groups?.[0];
  if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    return <Navigate to="/" />;
  }

  return children;
}

export default ProtectedRoute;
