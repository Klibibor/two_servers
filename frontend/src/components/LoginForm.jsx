// LoginForm.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import apiFetch from "../utils/api";
import { useAuth } from "../contexts/AuthContext";

function LoginForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const { login } = useAuth();
    
    try {
      const res = await apiFetch('/api/auth/login/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      if (res.ok) {
        // If server returned tokens, use login to store them in memory
        if (data.access || data.refresh) {
          await login({ access: data.access, refresh: data.refresh });
        }
        navigate('/');
      } else {
        setError(data.detail || data.error || "Login error.");
      }
    } catch (err) {
      setError("Communication error with server.");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Login</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        required
      /><br />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      /><br />
      <button type="submit">Login</button>
    </form>
  );
}
// output login form for rendering

export default LoginForm;
