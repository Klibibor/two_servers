import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import GrupaDetalji from './GrupaDetalji';
import Layout from './Layout';
import LoginForm from './components/LoginForm';
import Proizvodi from './components/Proizvodi';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css';
import KorisniciCRUD from "./components/KorisniciCRUD";
import ProizvodiCRUD from "./components/ProizvodiCRUD";

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<App />} />
          <Route path="grupa/:id" element={<GrupaDetalji />} />
          <Route path="login" element={<LoginForm />} />
          <Route path="proizvodi" element={<Proizvodi />} />
          <Route path="korisnici" element={<KorisniciCRUD />} />
          <Route path="proizvodi-crud" element={<ProizvodiCRUD />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
