  import './App.css';                                                                     //uvodi css
  import { useState, useEffect } from 'react';                                            //state effect, kao getter setter
  import { Link, useNavigate } from 'react-router-dom';                                   //funkcija za resavanje url-ova
  import { isAuthenticated } from './utils/auth';                                         //provera autentifikacije iza baze djanga
  // import KorisniciCRUD from "./components/KorisniciCRUD"; // ← uključi po potrebi
                                                                                          //varijable
  function App() {                                                                        //backend frontenda za prikaz stranice
    const [grupe, setGrupe] = useState([]);                                               //grupe postavlja da ce biti array
    const [greska, setGreska] = useState("");                                             //greska postavlja da ce biti string
    const navigate = useNavigate();                                                       //navigate pozivanje objekta

    useEffect(() => {                                                                     //useEffect ovo ce se ucitavati iz backenda
      if (!isAuthenticated()) {                                                           //pruzima da li je autenitfikovan korisnik
        navigate('/login');
        return;
      }

      const token = localStorage.getItem('jwt');                                          //preuzima token iz lokalno storrage
                                                                                          //uporedjuje ga sa backand
      fetch('http://127.0.0.1:8000/api/grupe/', {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => {                                                                  //mogucnosti prema onoga sto procita iz tokena
          if (!res.ok) {                                                                  //nije dobar
            throw new Error("Neautorizovan pristup");
          }
          return res.json();                                                              //vraca render
        })
        .then((data) => {                                                                 //preuzima iz backend
          if (Array.isArray(data)) {                                                      //grupe
            setGrupe(data); 
          } else {
            setGreska("Neočekivan odgovor sa servera.");                                  //ako nema grupe
          }
        })
        .catch((err) => {                                                                 //hvatanje greski
          console.error('Greška prilikom učitavanja grupa:', err);                        //ispis + greska koju daje program
          setGreska("Neuspešno učitavanje. Možda je istekao token.");                     //ako nije jedna od sistemskih mozda je token
          navigate('/login');                                                             //vraca na login
        });
    }, [navigate]);

    return (                                                                              //vracanje HTML-a
      <div className="app-container">
        <h2>Grupe proizvoda</h2>                                                          {/* header */}
        {greska && <p style={{ color: "red" }}>{greska}</p>}                              {/* stilizacija slova greske */}
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
