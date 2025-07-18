import '../App.css';
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

function GrupaDetalji() {
  const { id } = useParams();
  const [proizvodi, setProizvodi] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('jwt');
    const headers = {};
    if (token) headers.Authorization = `Bearer ${token}`;

    fetch(`http://127.0.0.1:8000/api/proizvodi/?grupa=${id}`, { headers })
      .then(res => res.json())
      .then(setProizvodi)
      .catch(err => console.error('Greška:', err));
  }, [id]);

  return (
    <div className="app-container">
      <main className="product-grid">
        {proizvodi.map(p => (
          <div key={p.id} className="product-card">
            <img className="product-img" src={p.slika} alt={p.naziv} />
            <div className="product-info">
              <h3>{p.naziv}</h3>
              <p className="new-price">{p.cena} RSD</p>
              <button>Dodaj u korpu</button>
            </div>
          </div>
        ))}
      </main>
    </div>
  );
}

export default GrupaDetalji;
