import './App.css';                                                                       // Uvoz stilova iz App.css
import { useState, useEffect } from 'react';                                               // React hookovi za stanje i efekte
import { Link, useNavigate } from 'react-router-dom';                                      // Link za navigaciju, useNavigate za preusmeravanje

function App() {                                                                           // Komponenta App (pocetni ekran aplikacije)
  const [grupe, setGrupe] = useState([]);                                                  // State koji čuva niz grupa iz backenda
  const [greska, setGreska] = useState("");                                                // State za prikaz poruke o grešci
  const navigate = useNavigate();                                                          // Hook za programsku navigaciju (npr. nakon greške)

  useEffect(() => {                                                                        // useEffect se pokreće kada se komponenta učita
    const token = localStorage.getItem('jwt');                                             // Dohvati JWT token iz localStorage

    // Definiši početni headers objekat
    const headers = {
      'Content-Type': 'application/json',
    };

    // Ako postoji token, dodaj Authorization header
    if (token) {
      headers.Authorization = `Bearer ${token}`;                                           // Backend proverava da li je korisnik u JWT grupi
    }

    // Fetch ka backendu (Django REST API) da dobije sve grupe
    fetch('http://127.0.0.1:8000/api/grupe/', { headers })                                 // API endpoint za grupe proizvoda
      .then((res) => {
        if (!res.ok) {                                                                     // Ako server vrati status koji nije OK
          throw new Error("Greška prilikom učitavanja");                                   // Baci grešku
        }
        return res.json();                                                                 // Inače, parsiraj odgovor kao JSON
      })
      .then((data) => {
        if (Array.isArray(data)) {                                                         // Proveri da li je dobijen niz (array)
          setGrupe(data);                                                                  // Ako jeste, postavi grupe
        } else {
          setGreska("Neočekivan odgovor sa servera.");                                     // Ako nije array, postavi poruku o grešci
        }
      })
      .catch((err) => {                                                                    // Hvatamo bilo koju grešku tokom fetch-a
        console.error('Greška prilikom učitavanja grupa:', err);                           // Ispisi grešku u konzolu
        setGreska("Neuspešno učitavanje. Možda je istekao token.");                        // Prikaz korisniku
        navigate('/login');                                                                // Vrati korisnika na login stranicu
      });
  }, []);                                                                                  // useEffect se pokreće samo jednom, pri učitavanju

  return (                                                                                 // JSX koji se prikazuje na početnoj stranici
    <div className="app-container">                                                        {/* Glavni wrapper */}
      <h2>Grupe proizvoda</h2>                                                             {/* Naslov stranice */}

      {greska && <p style={{ color: "red" }}>{greska}</p>}                                 {/* Ako postoji greška, prikaži je */}

      <main className="product-grid">                                                      {/* Glavna mreža proizvoda */}
        {grupe.map((grupa) => (                                                            // Iteriraj kroz sve grupe
          <div key={grupa.id} className="product-card">                                    {/* Kartica za svaku grupu */}
            <div className="product-img" />                                                {/* Placeholder za sliku */}
            <div className="product-info">                                                 {/* Informacije o grupi */}
              <h3>{grupa.naziv}</h3>                                                       {/* Naziv grupe */}
              <p>{grupa.opis}</p>                                                          {/* Opis grupe (ako postoji) */}
              <Link to={`/grupa/${grupa.id}`}>                                            {/* Link ka detaljima grupe */}
                <button>Prikaži proizvode</button>                                         {/* Dugme */}
              </Link>
            </div>
          </div>
        ))}
      </main>

      {/* <KorisniciCRUD /> ← uključi po potrebi ako želiš da prikažeš administraciju ovde */}
    </div>
  );
}

export default App;                                                                         // Eksport komponente da bi mogla da se koristi u drugim delovima aplikacije
