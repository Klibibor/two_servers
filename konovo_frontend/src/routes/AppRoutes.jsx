import { Routes, Route } from 'react-router-dom';
import Layout from '../layout/Layout';
import Home from '../pages/Home';
import GrupaDetalji from '../pages/GrupaDetalji';
import Proizvodi from '../pages/Proizvodi';
import ProizvodiCRUD from '../pages/ProizvodiCRUD';
import KorisniciCRUD from '../pages/KorisniciCRUD';
import Login from '../pages/Login';
import ProtectedRoute from '../components/ProtectedRoute';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="grupa/:id" element={<GrupaDetalji />} />
        <Route path="proizvodi" element={<Proizvodi />} />
        <Route path="login" element={<Login />} />
        <Route path="proizvodi-crud" element={
          <ProtectedRoute allowedRoles={['JWT']}>
            <ProizvodiCRUD />
          </ProtectedRoute>
        } />
        <Route path="korisnici" element={
          <ProtectedRoute allowedRoles={['JWT']}>
            <KorisniciCRUD />
          </ProtectedRoute>
        } />
      </Route>
    </Routes>
  );
}
