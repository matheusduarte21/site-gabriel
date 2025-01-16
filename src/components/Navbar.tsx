import React, { useState } from 'react';
import { Menu, X, Laptop } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const handleLoginChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const route = e.target.value;
    if (route) {
      navigate(route);
    }
  };

  return (
    <nav className="bg-white shadow-md fixed w-full z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Laptop className="h-8 w-8 text-blue-700" />
            <span className="ml-2 text-xl font-bold text-gray-900">TechService</span>
          </div>
          
          <div className="hidden md:flex items-center space-x-8">
            <NavLink href="#home">Início</NavLink>
            <NavLink href="#services">Serviços</NavLink>
            <NavLink href="#about">Sobre Nós</NavLink>
            <NavLink href="#clients">Clientes</NavLink>
            <NavLink href="#contact">Contato</NavLink>
            
            <select
              onChange={handleLoginChange}
              className="px-4 py-2 text-sm bg-blue-50 text-blue-700 border-0 rounded-full 
                        hover:bg-blue-100 transition-colors duration-200 cursor-pointer 
                        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              defaultValue=""
            >
              <option value="" disabled>Área de login</option>
              <option value="/admin/login">Admin</option>
              <option value="/staff/login">Funcionário</option>
            </select>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-700 hover:text-gray-900"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white">
            <MobileNavLink href="#home">Início</MobileNavLink>
            <MobileNavLink href="#services">Serviços</MobileNavLink>
            <MobileNavLink href="#about">Sobre Nós</MobileNavLink>
            <MobileNavLink href="#clients">Clientes</MobileNavLink>
            <MobileNavLink href="#contact">Contato</MobileNavLink>
            
            {/* Mobile Login Selection */}
            <div className="px-3 py-2">
              <select
                onChange={handleLoginChange}
                className="w-full px-4 py-2 text-sm bg-blue-50 text-blue-700 border-0 
                          rounded-full hover:bg-blue-100 transition-colors duration-200 
                          cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
                defaultValue=""
              >
                <option value="" disabled>Área Restrita</option>
                <option value="/admin/login">Admin</option>
                <option value="/staff/login">Funcionário</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

const NavLink = ({ href, children }: { href: string; children: React.ReactNode }) => (
  <a
    href={href}
    className="text-gray-700 hover:text-blue-700 px-3 py-2 text-sm font-medium transition-colors"
  >
    {children}
  </a>
);

const MobileNavLink = ({ href, children }: { href: string; children: React.ReactNode }) => (
  <a
    href={href}
    className="block text-gray-700 hover:text-blue-700 px-3 py-2 text-base font-medium"
  >
    {children}
  </a>
);

export default Navbar;