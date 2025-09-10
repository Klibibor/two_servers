import { Outlet, Link } from 'react-router-dom';   //uvoz biblioteka, outlet za prikazivanje "/" + <outlet> (/url), Link za hyperlinkovanje  
import { useEffect, useState } from 'react';                    //useNavigate objekat za prusmeravnanje na /url kada se ispune uslovi 
import { useAuth } from '../contexts/AuthContext';
import './Layout.css';
import LoginInfo from '../components/LoginInfo';
                                                                //getter i setter za react
 // input store for user, role, dropdown, logout
function Layout() {
  const [showDropdown, setShowDropdown] = useState(false);      // dropdown menu is object of setShowDropdown method if not false
  const { user: authUser, token } = useAuth();
  const [role, setRole] = useState('anonymous');

  // starting role if not token and authUser
  useEffect(() => {
    if (!authUser && !token) {
      setRole('anonymous');
      return;
    }

    // checking if user logged in
    if (authUser) {
      if (authUser.is_superuser) setRole('admin');
      else if (Array.isArray(authUser.groups) && authUser.groups.includes('JWT')) setRole('jwt');
      else if (authUser.role === 'no_jwt') setRole('no_jwt');
      else setRole('client');
    } else if (token) {
      // token present but authUser not yet loaded
      setRole('jwt');
    }
  }, [authUser, token]);
// output placeholders filled with backend user data

// logger 
  useEffect(() => {
    if (authUser) {
      console.log('user grp:', authUser.groups);
      console.log('user role:', role);
    }
  }, [authUser, role]);
// info about user and role

  return (
    <>
      <header className="navbar">  {/* component for navigation bar */}
        <div className="left-side"> {/* container for left side of the navbar */}
          <div className="left-column">
            <Link to="/login">LOGIN</Link>
            <div>
              <LoginInfo />
            </div>
          </div>

          {/* if user is admin or jwt, container of dropdown menu */}
          {["admin", "jwt"].includes(role) && (
            <div className="dropdown">
              <button
                className="hamburger-btn"
                onClick={() => setShowDropdown(prev => !prev)}
              >
                {/* look of a dropdown button */}
                ☰ Administration
              </button>

              {showDropdown && (
                  <div className="dropdown-content"> {/* container for dropdown content */}
                    <Link to="/products-crud" onClick={() => setShowDropdown(false)}>Products CRUD</Link>
                    {role === "admin" && (
                      <Link to="/users" onClick={() => setShowDropdown(false)}>Users CRUD</Link>
                    )}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="center"> {/* center area with logo and products */}
          <Link className="logo" to="/">SHOP</Link>
          <Link to="/products">Products</Link>
        </div>

  {/* login info moved to left-side */}
      </header>

      <main> {/* main content area where the Outlet will render the matched route component */}
        <Outlet />
      </main>

    <footer className="footer"> {/* container for footer of the layout page */}
  <p>&copy; project @ SHOP</p>
    </footer>
    </>
  );
}

export default Layout;
