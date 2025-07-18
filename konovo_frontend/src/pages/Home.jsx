import '../App.css';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

function Home() {
  const [grupe, setGrupe] = useState([]);
  const [greska, setGreska] = useState("");

  useEffect(() => {
  const token = localStorage.getItem('jwt');
  const headers = { 'Content-Type': 'application/json' };

  if (token && token !== "undefined") {
    headers.Authorization = `Bearer ${token}`;
}

    fetch('http://127.0.0.1:8000/api/grupe/', { headers })
      .then(res => res.json())
      .then(data => Array.isArray(data) ? setGrupe(data) : setGreska("Neočekivan odgovor."))
      .catch(() => setGreska("Greška pri učitavanju grupa."));
  }, []);

  return (
    <div className="app-container">
      <h2>Grupe proizvoda</h2>
      {greska && <p style={{ color: "red" }}>{greska}</p>}
      <main className="product-grid">
        {grupe.map(grupa => (
          <div key={grupa.id} className="product-card">
            <div className="product-img" />
            <div className="product-info">
              <h3>{grupa.naziv}</h3>
              <Link to={`/grupa/${grupa.id}`}>
                <button>Prikaži proizvode</button>
              </Link>
            </div>
          </div>
        ))}
      </main>
    </div>
  );
}

export default Home;
