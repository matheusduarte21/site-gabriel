import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Services from './components/Services';
import About from './components/About';
import Clients from './components/Clients';
import Contact from './components/Contact';
import StaffDashboard from './components/staff/StaffDaschboard';
import StaffLogin from './components/staff/StaffLogin';
import AdminLayout from './components/admin/AdminLayout';
import AdminHome from './components/admin/AdminHome';
import Clientes from './components/admin/Clientes';
import Tecnicos from './components/admin/Tecnicos';
import Empresas from './components/admin/Empresas';

function App() {
  return (
    <Router>
      <Routes>

        <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminHome />} />
            <Route path="empresas" element={<Empresas />} />
            <Route path="clientes" element={<Clientes />} />
            <Route path="tecnicos" element={<Tecnicos />} />
        </Route>
        
        {/* <Route path="/staff/login" element={<StaffLogin />} />
        
        <Route
          path="/staff/dashboard"
          element={
            <StaffDashboard />
          }
        /> */}
        
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
      </Routes>
    </Router>
  );
}

export default App;
