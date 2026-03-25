import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Services from './components/Services';
import About from './components/About';
import Clients from './components/Clients';
import Contact from './components/Contact';
import AdminLayout from './components/admin/AdminLayout';
import AdminHome from './components/admin/AdminHome';
import Clientes from './components/admin/Clientes';
import Tecnicos from './components/admin/Tecnicos';
import Chamados from './components/admin/chamados';
import Usuarios from './components/admin/Usuarios';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminHome />} />
            <Route path="clientes" element={<Clientes />} />
            <Route path="tecnicos" element={<Tecnicos />} />
            <Route path="chamados" element={<Chamados />} />
            <Route path="usuarios" element={<Usuarios />} />
        </Route>
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
        
        <Route path="*" element={<div className="p-10 text-center">Página não encontrada (404)</div>} />

      </Routes>
    </Router>
  );
}

export default App;