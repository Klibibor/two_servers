// src/components/UsersCRUD.jsx

import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import apiFetch from "../utils/api";

function UsersCRUD() {
  const [users, setUsers] = useState([]);
  const [newUser, setNewUser] = useState({ username: "", email: "", password: "" });
  const { token } = useAuth();
  const authHeader = token ? { Authorization: `Bearer ${token}` } : {};

  // Fetch users from backend
  const fetchUsers = async () => {
    try {
      const res = await apiFetch("/api/users/", {
        headers: authHeader,
      });

      if (!res.ok) {
        console.error("Error while fetching users:", res.status);
        return;
      }

      const data = await res.json();
      setUsers(data);
    } catch (err) {
      console.error("Error while fetching users:", err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Add a new user
  const addUser = async () => {
    // Basic validation
    if (!newUser.username.trim()) {
      alert("Username is required");
      return;
    }
    if (!newUser.password.trim()) {
      alert("Password is required");
      return;
    }
    if (newUser.email && !/\S+@\S+\.\S+/.test(newUser.email)) {
      alert("Please enter a valid email address");
      return;
    }

    try {
      console.log("DEBUG: Sending user data:", newUser);
      const res = await apiFetch("/api/users/", {
        method: "POST",
        headers: authHeader,
        body: JSON.stringify(newUser),
      });

      const data = await res.json();
      if (res.ok) {
        setUsers(prev => [...prev, data]);
        setNewUser({ username: "", email: "", password: "" });
        fetchUsers(); // refresh list
      } else {
        console.error("Error adding user:", data);
      }
    } catch (err) {
      console.error("Error:", err);
    }
  };

  // Delete a user
  const deleteUser = async (id) => {
    try {
      const res = await apiFetch(`/api/users/${id}/`, {
        method: "DELETE",
        headers: authHeader,
      });

      if (res.ok) {
        setUsers(prev => prev.filter(user => user.id !== id));
        fetchUsers();
      } else {
        console.error("Error deleting:", await res.json());
      }
    } catch (err) {
      console.error("Error:", err);
    }
  };

  if (!Array.isArray(users)) {
    return <div>Error: {users.detail || "Unknown error."}</div>;
  }

  return (
    <div>
      <h2>Users</h2>

      <ul>
        {users.map(user => (
          <li key={user.id}>
            {user.username} ({user.email})
            <button onClick={() => deleteUser(user.id)}>Delete</button>
          </li>
        ))}
      </ul>

      <h3>Add User</h3>
      <input
        type="text"
        placeholder="Username"
        value={newUser.username}
        onChange={e => setNewUser({ ...newUser, username: e.target.value })}
      /><br />
      <input
        type="email"
        placeholder="Email"
        value={newUser.email}
        onChange={e => setNewUser({ ...newUser, email: e.target.value })}
      /><br />
      <input
        type="password"
        placeholder="Password"
        value={newUser.password}
        onChange={e => setNewUser({ ...newUser, password: e.target.value })}
      /><br />
      <button onClick={addUser}>Add</button>
    </div>
  );
}

export default UsersCRUD;
