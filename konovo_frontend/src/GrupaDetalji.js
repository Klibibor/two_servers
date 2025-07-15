  import './App.css';                                                                     //uvodi css
  import { useState, useEffect } from 'react';                                            //state effect, kao getter setter
  import { useParams, useNavigate } from 'react-router-dom';                               //funkcija za resavanje url-ova
  import { isAuthenticated } from './utils/auth';                                         //provera autentifikacije iza baze djanga
import './App.css';

function GrupaDetalji() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [proizvodi, setProizvodi] = useState([]);

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login');
      return;
    }

    const token = localStorage.getItem('jwt');

    fetch(`http://127.0.0.1:8000/api/proizvodi/?grupa=${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => setProizvodi(data))
      .catch((err) => console.error('Greška pri učitavanju proizvoda:', err));
  }, [id, navigate]);

  return (
    <div className="app-container">
      <main className="product-grid">
        {proizvodi.map((proizvod) => (
          <div key={proizvod.id} className="product-card">
            <img className="product-img" src={proizvod.slika} alt={proizvod.naziv} />
            <div className="product-info">
              <h3>{proizvod.naziv}</h3>
              {proizvod.stara_cena && (
                <p className="old-price">{proizvod.stara_cena} RSD</p>
              )}
              <p className="new-price">{proizvod.cena} RSD</p>
              <button>Dodaj u korpu</button>
              <small>Šifra: KNV-{proizvod.id}</small>
            </div>
          </div>
        ))}
      </main>
    </div>
  );
}

export default GrupaDetalji;
