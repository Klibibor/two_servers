import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import apiFetch from '../utils/api';

// input placeholders for login request username, password, error
export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();
  const { loginSession } = useAuth();

  // input request from client from the form in rendered page
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await apiFetch('/api/auth/login/', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.detail || data.error || 'Login failed');
        return;
      }
      // output returned data
      console.log('Login successful:', data);

      // if data has access token
      if (data.access) {
        await login({ access: data.access, refresh: data.refresh });
        navigate('/');
        return;
      }
      // output login context from AuthContext
      

      // if data doesn't have access token
      if (data.username) {
        await loginSession(data);
        navigate('/');
        return;
      }
      // output loginSession context from AuthContext
      

      setError('No access token returned');
    } catch (err) {
      setError('Network error');
    }
  };

  // input placeholder for client request
  return (
    <form onSubmit={handleSubmit}>
      <h2>Login</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <input placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} required />
      <br />
      <input placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
      <br />
      <button type="submit">Login</button>
    </form>
  );
}
// output username and password ready to use in handleSubmit
