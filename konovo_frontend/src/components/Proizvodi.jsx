import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { isAuthenticated } from "../utils/auth";

function Proizvodi() {
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate("/login");
    }
  }, [navigate]);

  return (
    <div>
      <h2>Dobrodošli na stranicu sa proizvodima!</h2>
      <p>Ovde će biti prikaz proizvoda...</p>
    </div>
  );
}

export default Proizvodi;
