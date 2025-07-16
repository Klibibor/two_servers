import { useEffect, useState } from "react";

function ProizvodiCRUD() {
  const [proizvodi, setProizvodi] = useState([]);
  const [novi, setNovi] = useState({ naziv: "", opis: "", cena: "", grupa: "" });
  const [slika, setSlika] = useState(null);
  const [editId, setEditId] = useState(null);
  const [novaCena, setNovaCena] = useState("");
  const [grupe, setGrupe] = useState([]);
  const [user, setUser] = useState(null);

  const token = localStorage.getItem("jwt");

  const authHeader = {
    Authorization: `Bearer ${token}`,
  };

  useEffect(() => {
    fetch("http://localhost:8000/api/proizvodi/", { headers: authHeader })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setProizvodi(data);
        } else {
          setProizvodi([]);
        }
      })
      .catch(() => setProizvodi([]));

    fetch("http://localhost:8000/api/grupe/", { headers: authHeader })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setGrupe(data);
        } else {
          setGrupe([]);
        }
      })
      .catch(() => setGrupe([]));

    fetch("http://localhost:8000/api/me/", { headers: authHeader })
      .then(res => res.json())
      .then(data => setUser(data))
      .catch(() => setUser(null));
  }, []);

  const dodajProizvod = async () => {
    const formData = new FormData();
    formData.append("naziv", novi.naziv);
    formData.append("opis", novi.opis);
    formData.append("cena", novi.cena);
    formData.append("grupa", novi.grupa);
    if (slika) formData.append("slika", slika);

    const res = await fetch("http://localhost:8000/api/proizvodi/", {
      method: "POST",
      headers: authHeader,
      body: formData,
    });

    if (res.ok) {
      const data = await res.json();
      setProizvodi(prev => [...prev, data]);
      setNovi({ naziv: "", opis: "", cena: "", grupa: "" });
      setSlika(null);
    }
  };

  const obrisiProizvod = async (id) => {
    await fetch(`http://localhost:8000/api/proizvodi/${id}/`, {
      method: "DELETE",
      headers: authHeader,
    });
    setProizvodi(prev => prev.filter(p => p.id !== id));
  };

  const sacuvajCenu = async (id) => {
    const res = await fetch(`http://localhost:8000/api/proizvodi/${id}/`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ cena: novaCena }),
    });

    if (res.ok) {
      const updated = await res.json();
      setProizvodi(prev => prev.map(p => (p.id === id ? updated : p)));
      setEditId(null);
      setNovaCena("");
    }
  };

  return (
    <div>
      <h2>Proizvodi</h2>
      <ul>
        {proizvodi.map(p => (
          <li key={p.id}>
            {p.naziv} - {p.opis} - {p.grupa_naziv || "Bez grupe"} -{" "}
            {editId === p.id ? (
              <>
                <input
                  type="number"
                  value={novaCena}
                  onChange={e => setNovaCena(e.target.value)}
                  style={{ width: "80px" }}
                />
                <button onClick={() => sacuvajCenu(p.id)}>Sačuvaj</button>
                <button onClick={() => setEditId(null)}>Otkaži</button>
              </>
            ) : (
              <>
                {p.cena} RSD{" "}
                <button onClick={() => {
                  setEditId(p.id);
                  setNovaCena(p.cena);
                }}>Izmeni cenu</button>
              </>
            )}
            <button onClick={() => obrisiProizvod(p.id)}>Obriši</button>
          </li>
        ))}
      </ul>

      {user && ((user.groups?.includes("JWT")) || user.is_superuser) ? (
        <>
          <h3>Dodaj proizvod</h3>
          <input
            placeholder="Naziv"
            value={novi.naziv}
            onChange={e => setNovi({ ...novi, naziv: e.target.value })}
          /><br />
          <select
            value={novi.grupa}
            onChange={e => setNovi({ ...novi, grupa: e.target.value })}
          >
            <option value="">-- Izaberi grupu --</option>
            {grupe.map(g => (
              <option key={g.id} value={g.id}>{g.naziv}</option>
            ))}
          </select><br />
          <input
            placeholder="Opis"
            value={novi.opis}
            onChange={e => setNovi({ ...novi, opis: e.target.value })}
          /><br />
          <input
            placeholder="Cena"
            type="number"
            value={novi.cena}
            onChange={e => setNovi({ ...novi, cena: e.target.value })}
          /><br />
          <input
            type="file"
            accept="image/*"
            onChange={e => setSlika(e.target.files[0])}
          /><br />
          <button onClick={dodajProizvod}>Dodaj</button>
        </>
      ) : (
        user && <p style={{ color: "gray" }}>Nemate dozvolu za dodavanje proizvoda.</p>
      )}
    </div>
  );
}

export default ProizvodiCRUD;
