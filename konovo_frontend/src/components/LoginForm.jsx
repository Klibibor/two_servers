// LoginForm.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";

function LoginForm() {
  const [username, setUsername] = useState(""); // <-- umesto email
  const [password, setPassword] = useState("");
  const [greska, setGreska] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGreska("");

    try {
      const res = await fetch("http://localhost:8000/api/token/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }), // <-- koristi username
      });

      const data = await res.json();
      if (res.ok) {
        localStorage.setItem("jwt", data.access); // ← koristi access token
        navigate("/proizvodi");
      } else {
        setGreska(data.error || "Greška pri prijavi.");
      }
    } catch (err) {
      setGreska("Greška u komunikaciji sa serverom.");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Prijava</h2>
      {greska && <p style={{ color: "red" }}>{greska}</p>}
      <input
        type="text"
        placeholder="Korisničko ime (ili email ako ti je username email)"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        required
      /><br />
      <input
        type="password"
        placeholder="Lozinka"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      /><br />
      <button type="submit">Prijavi se</button>
    </form>
  );
}

export default LoginForm;
