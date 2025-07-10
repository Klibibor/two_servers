import './App.css';
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { isAuthenticated } from './utils/auth';

function App() {
  const [grupe, setGrupe] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login');
      return;
    }

    const token = localStorage.getItem('jwt');
    fetch('http://127.0.0.1:8000/api/grupe/', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => setGrupe(data))
      .catch((err) => console.error('Greška prilikom učitavanja grupa:', err));
  }, [navigate]);

  return (
    <div className="app-container">
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
    </div>
  );
}

export default App;
