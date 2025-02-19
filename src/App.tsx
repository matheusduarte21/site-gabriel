import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Services from './components/Services';
import About from './components/About';
import Clients from './components/Clients';
import Contact from './components/Contact';
import AdminLogin from './components/admin/AdminLogin';
import AdminDashboard from './components/admin/AdminDashboard';
import StaffDashboard from './components/staff/StaffDaschboard';
import StaffLogin from './components/staff/StaffLogin';
import ProtectedRoute from './components/auth/ProtectedRoute';

function App() {
  return (
    <Router>
      <Routes>
        {/* Rota de login do administrador */}
        <Route path="/admin/login" element={<AdminLogin />} />
        
        <Route
          path="/admin"
          element={
            <ProtectedRoute requireAdmin>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        
        <Route path="/staff/login" element={<StaffLogin />} />
        
        <Route
          path="/staff/dashboard"
          element={
            <ProtectedRoute requireStaff>
              <StaffDashboard />
            </ProtectedRoute>
          }
        />
        
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
