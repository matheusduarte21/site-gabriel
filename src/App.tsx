import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Services from './components/Services';
import About from './components/About';
import Clients from './components/Clients';
import Contact from './components/Contact';
import AdminLayout from './components/admin/AdminLayout';
import AdminHome from './components/admin/AdminHome';
import Chamados from './components/admin/ChamadosTemp.';
import Clientes from './components/admin/Clientes';
import Tecnicos from './components/admin/Tecnicos';
import Usuarios from './components/admin/Usuarios';
import LoginAdmin from './components/admin/LoginAdmin';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { Toaster } from 'react-hot-toast';
import Perfil from './components/admin/Perfil';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Toaster />
        <Routes>
          <Route
            path="/"
            element={
              <div className="min-h-screen bg-white">
                <Navbar />
                <Hero />
                <Services />
                <About />
                <Clients />
                <Contact />
              </div>
            }
          />
          
          <Route path="/admin/login" element={<LoginAdmin />} />
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminHome />} />
            <Route path="clientes" element={<Clientes />} />
            <Route path="tecnicos" element={<Tecnicos />} />
            <Route path="chamados" element={<Chamados />} />
            <Route path="usuarios" element={<Usuarios />} />
            <Route path="perfil" element={<Perfil />} />
          </Route>
          
          <Route path="*" element={<div className="p-10 text-center">Página não encontrada (404)</div>} />

        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;