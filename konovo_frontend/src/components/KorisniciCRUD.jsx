// src/components/KorisniciCRUD.jsx

import { useEffect, useState } from "react";

function KorisniciCRUD() {
  const [korisnici, setKorisnici] = useState([]);
  const [novi, setNovi] = useState({ username: "", email: "", password: "" });
  const token = localStorage.getItem("jwt");

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

useEffect(() => {
  const fetchKorisnici = async () => {
    const token = localStorage.getItem("jwt");

    const res = await fetch("http://localhost:8000/api/korisnici/", {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (res.status === 401) {
      console.error("Unauthorized – token nije validan ili nedostaje.");
    }

    const data = await res.json();
    console.log("Korisnici:", data);
    setKorisnici(data);
  };

  fetchKorisnici();
}, []);

  const dodajKorisnika = async () => {
    const res = await fetch("http://localhost:8000/api/korisnici/", {
      method: "POST",
      headers,
      body: JSON.stringify(novi),
    });
    if (res.ok) {
      const data = await res.json();
      setKorisnici(prev => [...prev, data]);
      setNovi({ username: "", email: "", password: "" });
    }
  };

  const obrisiKorisnika = async (id) => {
    await fetch(`http://localhost:8000/api/korisnici/${id}/`, {
      method: "DELETE",
      headers,
    });
    setKorisnici(prev => prev.filter(k => k.id !== id));
  };

if (!Array.isArray(korisnici)) {
return <div>Greška: {korisnici.detail || "Nepoznata greška."}</div>;
}

  return (
    <div>
      <h2>Korisnici</h2>

      <ul>
        {korisnici.map(k => (
          <li key={k.id}>
            {k.username} ({k.email})
            <button onClick={() => obrisiKorisnika(k.id)}>Obriši</button>
          </li>
        ))}
      </ul>

      <h3>Dodaj korisnika</h3>
      <input
        type="text"
        placeholder="Korisničko ime"
        value={novi.username}
        onChange={e => setNovi({ ...novi, username: e.target.value })}
      /><br />
      <input
        type="email"
        placeholder="Email"
        value={novi.email}
        onChange={e => setNovi({ ...novi, email: e.target.value })}
      /><br />
      <input
        type="password"
        placeholder="Lozinka"
        value={novi.password}
        onChange={e => setNovi({ ...novi, password: e.target.value })}
      /><br />
      <button onClick={dodajKorisnika}>Dodaj</button>
    </div>
  );
}

export default KorisniciCRUD;
