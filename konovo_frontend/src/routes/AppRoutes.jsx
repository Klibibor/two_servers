import { Routes, Route } from 'react-router-dom';
import Layout from '../layout/Layout';
import Home from '../pages/Home';
import GrupaDetalji from '../pages/GrupaDetalji';
import Proizvodi from '../components/Proizvodi';
import ProizvodiCRUD from '../components/ProizvodiCRUD';
import KorisniciCRUD from '../components/KorisniciCRUD';
import LoginForm from '../components/LoginForm';
import ProtectedRoute from '../components/ProtectedRoute';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="grupa/:id" element={<GrupaDetalji />} />
        <Route path="proizvodi" element={<Proizvodi />} />
        <Route path="login" element={<LoginForm />} />

        <Route path="proizvodi-crud" element={
          <ProtectedRoute allowedRoles={['JWT', 'jwt', 'admin']}>
            <ProizvodiCRUD />
          </ProtectedRoute>
        } />

        <Route path="korisnici" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <KorisniciCRUD />
          </ProtectedRoute>
        } />
      </Route>
    </Routes>
  );
}
