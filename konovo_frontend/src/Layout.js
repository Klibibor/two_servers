import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from "react";


function Layout() {
  const [isStaff, setIsStaff] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('jwt');
    navigate('/login');
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
        setIsStaff(data.is_staff);
      })
      .catch(err => {
        console.error("Greška:", err);
        setIsStaff(false);
      });
  }, []);

  return (
  <>
    <header className="navbar">
      <a className="logo" href="/">SHOP</a>
      <div className="search-container">
        <input type="text" className="search-bar" placeholder="Pretraga proizvoda" />
      </div>
      <div style={{ display: "flex" }}>
        <nav style={{ width: "200px", padding: "1rem", background: "#eee" }}>
          <Link to="/">Početna</Link><br />
          <Link to="/proizvodi">Proizvodi</Link><br />
          {isStaff && (
            <>
              <Link to="/proizvodi-crud">Dodaj proizvode</Link><br />
              <Link to="/korisnici">Dodaj korisnike</Link><br />
            </>
          )}
          <Link to="/login">Prijava</Link>
        </nav>

        <main style={{ padding: "1rem", flex: 1 }}>
          <Outlet />
        </main>
      </div>
      <nav className="menu">
        <a href="/proizvodi">Proizvodi</a>
        <a href="/akcije">Akcije</a>
        <a href="/kontakt">Kontakt</a>
        <a href="/blog">Blog</a>
      </nav>
      <div className="icons">
        <a href="/korpa">🛒</a>
        <a href="/profil">👤</a>
        <button onClick={handleLogout} style={{ marginLeft: '10px' }}>🚪 Odjava</button>
      </div>
    </header>

    <main>
      <Outlet />
    </main>

    <footer className="footer">
      <p>&copy; zadatak @ KONOVO</p>
    </footer>
  </>
)};

export default Layout;
