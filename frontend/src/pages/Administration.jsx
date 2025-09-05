import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Administration() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // input user data from AuthContext
  useEffect(() => {
    if (!user) return; // still loading or not logged in
    if (!user.is_superuser && !user.groups?.includes('JWT')) {
      navigate('/');
    }
  }, [user, navigate]);

  if (!user) return <p>Loading...</p>;
  // output navigate to "/" if user is not in JWT or superuser group.

  // input rendered administration UI
  return (
    <div>
      <h2>Administration</h2>
      <ul>
        <li><Link to="/products-crud">Products CRUD</Link></li>
        {user.is_superuser && <li><Link to="/users">Users CRUD</Link></li>}
      </ul>
    </div>
  );
}
// output request from client
