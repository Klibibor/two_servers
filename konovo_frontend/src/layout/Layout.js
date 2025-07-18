import { Outlet, Link, useNavigate } from 'react-router-dom';   //uvoz biblioteka, outlet za prikazivanje "/" + <outlet> (/url), Link za hyperlinkovanje  
import { useEffect, useState } from 'react';                    //useNavigate objekat za prusmeravnanje na /url kada se ispune uslovi 
                                                                //getter i setter za react

function Layout() {
  const [user, setUser] = useState(null);                       //gleda da li user prava na null, da bi ih kasnije menjao
  const [role, setRole] = useState("anonymous")                 //setuje prava-role na anonimus isprva, kao i za one koji nemaju JWT ili admin
  const [showDropdown, setShowDropdown] = useState(false);     //kontrola prikaza hamburger menija
  const navigate = useNavigate();                               //pravi objekat ot navigate

const handleLogout = () => {
  localStorage.removeItem("jwt");

  // 🔁 PRISILNI RELOAD → da se Layout resetuje na anonymous stanje
  window.location.href = "/";
};

  useEffect(() => {
    const token = localStorage.getItem("jwt");
    if (!token) return;

    fetch("http://localhost:8000/api/me/", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => {
        if (!res.ok) throw new Error("Unauthorized");
        return res.json();
      })
      .then(data => {
        setUser(data);
        if (data.is_superuser) {
          setRole("admin");
        } else if (data.groups.includes("JWT")) {
          setRole("jwt");
        } else {
          setRole("client");
        }
      })
      .catch(err => {
        console.error("Greška:", err);
        setRole("anonymous");
      });
  }, []);

  useEffect(() => {
    if (user) {
      console.log("Grupe:", user.groups);
      console.log("Dodeljena uloga:", role);
    }
  }, [user, role]);

  return (
    <>
      <header className="navbar">
        <div className="left-side">
          <Link className="logo" to="/">SHOP</Link>

          {["admin", "jwt"].includes(role) && (
            <div className="dropdown">
              <button
                onClick={() => setShowDropdown(prev => !prev)}
                className="hamburger-btn"
              >
                ☰ Administracija
              </button>

              {showDropdown && (
                <div className="dropdown-content">
                  <Link to="/proizvodi-crud" onClick={() => setShowDropdown(false)}>Proizvodi CRUD</Link>
                  {role === "admin" && (
                    <Link to="/korisnici" onClick={() => setShowDropdown(false)}>Korisnici CRUD</Link>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="search-container">
          <input type="text" className="search-bar" placeholder="Pretraga proizvoda" />
        </div>

        <nav className="menu">
          <Link to="/proizvodi">Proizvodi</Link>
          <Link to="/akcije">Akcije</Link>
          <Link to="/kontakt">Kontakt</Link>
          <Link to="/blog">Blog</Link>
        </nav>

        <div className="icons">
          <Link to="/korpa">🛒</Link>
          <Link to="/login">👤</Link>
          {user && (
            <button onClick={handleLogout} style={{ marginLeft: '10px' }}>🚪 Odjava</button>
          )}
        </div>
      </header>

      <main>
        <Outlet />
      </main>

      <footer className="footer">
        <p>&copy; zadatak @ KONOVO</p>
      </footer>

      <style>
        {`
          .dropdown {
            position: relative;
            background-color: #f1f1f1;
            display: inline-block;
            margin-left: 15px;
          }

          .hamburger-btn {
            background: none;
            border: none;
            font-size: 16px;
            cursor: pointer;
          }

          .dropdown-content {
            display: block;
            position: absolute;
            background-color: #f1f1f1;
            min-width: 160px;
            z-index: 1;
            box-shadow: 0px 8px 16px 0px rgba(0,0,0,0.2);
          }

          .dropdown-content a {
            display: block;
            padding: 10px;
            text-decoration: none;
            color: black;
          }

          .dropdown-content a:hover {
            background-color: #ddd;
          }

          .left-side {
            display: flex;
            align-items: center;
          }
        `}
      </style>
    </>
  );
}

export default Layout;
