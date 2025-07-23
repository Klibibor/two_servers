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
      try {
        const res = await fetch("http://localhost:8000/shop/korisnici/", {
          headers,
        });

        if (!res.ok) {
          console.error("Greška pri fetchovanju:", res.status);
          return;
        }

        const data = await res.json();
        console.log("Korisnici:", data);
        setKorisnici(data);
      } catch (err) {
        console.error("Greška u fetch:", err);
      }
    };

    fetchKorisnici();
  }, []);

  const dodajKorisnika = async () => {
    try {
      const res = await fetch("http://localhost:8000/shop/korisnici/", {
        method: "POST",
        headers,
        body: JSON.stringify(novi),
      });

      const data = await res.json();

      if (res.ok) {
        setKorisnici(prev => [...prev, data]);
        setNovi({ username: "", email: "", password: "" });
      } else {
        console.error("Greška pri dodavanju:", data);
      }
    } catch (err) {
      console.error("Greška:", err);
    }
  };

  const obrisiKorisnika = async (id) => {
    try {
      const res = await fetch(`http://localhost:8000/shop/korisnici/${id}/`, {
        method: "DELETE",
        headers,
      });

      if (res.ok) {
        setKorisnici(prev => prev.filter(k => k.id !== id));
      } else {
        console.error("Greška pri brisanju:", await res.json());
      }
    } catch (err) {
      console.error("Greška:", err);
    }
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
