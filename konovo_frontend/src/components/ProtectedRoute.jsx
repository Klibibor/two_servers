import { Navigate } from 'react-router-dom';
import { getUserFromToken } from '../utils/auth';

function ProtectedRoute({ children, allowedRoles = [] }) {
  const user = getUserFromToken();

  if (!user) {
    return <Navigate to="/login" />;
  }

  // Proveri da li korisnik ima jednu od dozvoljenih rola
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" />;
  }

  return children;
}

export default ProtectedRoute;
