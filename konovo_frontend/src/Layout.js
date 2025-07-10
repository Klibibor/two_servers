import { Outlet, useNavigate } from 'react-router-dom';

function Layout() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('jwt');
    navigate('/login');
  };

  return (
    <>
      <header className="navbar">
        <a className="logo" href="/">KONOVO</a>
        <div className="search-container">
          <input type="text" className="search-bar" placeholder="Pretraga proizvoda" />
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
  );
}

export default Layout;
