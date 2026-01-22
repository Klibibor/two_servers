import { Routes, Route } from 'react-router-dom';
import Layout from './layout/Layout';
import ProductsCRUD from './components/ProductsCRUD';
import UsersCRUD from './components/UsersCRUD';
import Home from './pages/Home';
import Products from './pages/Products';
import Login from './pages/Login';
import Administration from './pages/Administration';
import ProtectedRoute from './components/ProtectedRoute';

// input routes from components
export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
  <Route index element={<Home />} />
  <Route path="products" element={<Products />} />
  <Route path="login" element={<Login />} />
  <Route path="administration" element={<Administration />} />
  <Route path="products-crud" element={
    <ProtectedRoute allowedGroups={["JWT"]}>
      <ProductsCRUD />
    </ProtectedRoute>
  } />
  <Route path="users" element={
    <ProtectedRoute allowedGroups={["JWT"]}>
      <UsersCRUD />
    </ProtectedRoute>
  } />
      </Route>
    </Routes>
  );
}
// output calling routes when of the chosen component
