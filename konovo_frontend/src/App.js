import './App.css';
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { isAuthenticated } from './utils/auth';
// import KorisniciCRUD from "./components/KorisniciCRUD"; // ← uključi po potrebi

function App() {
  const [grupe, setGrupe] = useState([]);
  const [greska, setGreska] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login');
      return;
    }

    const token = localStorage.getItem('jwt');

    fetch('http://127.0.0.1:8000/api/grupe/', {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("Neautorizovan pristup");
        }
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data)) {
          setGrupe(data);
        } else {
          setGreska("Neočekivan odgovor sa servera.");
        }
      })
      .catch((err) => {
        console.error('Greška prilikom učitavanja grupa:', err);
        setGreska("Neuspešno učitavanje. Možda je istekao token.");
        navigate('/login');
      });
  }, [navigate]);

  return (
    <div className="app-container">
      <h2>Grupe proizvoda</h2>
      {greska && <p style={{ color: "red" }}>{greska}</p>}
      <main className="product-grid">
        {grupe.map((grupa) => (
          <div key={grupa.id} className="product-card">
            <div className="product-img" />
            <div className="product-info">
              <h3>{grupa.naziv}</h3>
              <p>{grupa.opis}</p>
              <Link to={`/grupa/${grupa.id}`}>
                <button>Prikaži proizvode</button>
              </Link>
            </div>
          </div>
        ))}
      </main>

      {/* <KorisniciCRUD /> ← uključi po potrebi */}
    </div>
  );
}

export default App;
