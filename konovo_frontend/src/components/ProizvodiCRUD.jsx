import { useEffect, useState } from "react";

function ProizvodiCRUD() {
  const [proizvodi, setProizvodi] = useState([]);
  const [novi, setNovi] = useState({ naziv: "", opis: "", cena: "" });
  const token = localStorage.getItem("jwt");
  const [slika, setSlika] = useState(null);

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  useEffect(() => {
    fetch("http://localhost:8000/api/proizvodi/", { headers })
      .then(res => res.json())
      .then(data => setProizvodi(data))
      .catch(err => console.error("Greška:", err));
  }, []);

const dodajProizvod = async () => {
  const formData = new FormData();
  formData.append("naziv", novi.naziv);
  formData.append("opis", novi.opis);
  formData.append("cena", novi.cena);
  if (slika) formData.append("slika", slika);

  const res = await fetch("http://localhost:8000/api/proizvodi/", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (res.ok) {
    const data = await res.json();
    setProizvodi(prev => [...prev, data]);
    setNovi({ naziv: "", opis: "", cena: "" });
    setSlika(null);
  }
};

  const obrisiProizvod = async (id) => {
    await fetch(`http://localhost:8000/api/proizvodi/${id}/`, {
      method: "DELETE",
      headers,
    });
    setProizvodi(prev => prev.filter(p => p.id !== id));
  };

  return (
    <div>
      <h2>Proizvodi</h2>
      <ul>
        {proizvodi.map(p => (
          <li key={p.id}>
            {p.naziv} - {p.opis} - {p.cena} RSD
            <button onClick={() => obrisiProizvod(p.id)}>Obriši</button>
          </li>
        ))}
      </ul>

      <h3>Dodaj proizvod</h3>
      <input
        placeholder="Naziv"
        value={novi.naziv}
        onChange={e => setNovi({ ...novi, naziv: e.target.value })}
      /><br />
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
      <button onClick={dodajProizvod}>Dodaj</button>
    </div>
  );
}

export default ProizvodiCRUD;
