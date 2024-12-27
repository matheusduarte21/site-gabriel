import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';
import logo from '../assests/TECCORP LOGO/4.png'

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className=" bg-blue-100 shadow-md fixed w-full z-50 ">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <span className="ml-2 text-xl font-bold text-gray-900">
              <img className="h-[72px] mt-[18px] w-[250px] object-cover" src={logo} alt="" />
            </span>
          </div>
          
          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <NavLink href="#home">Início</NavLink>
            <NavLink href="#services">Serviços</NavLink>
            <NavLink href="#about">Sobre Nós</NavLink>
            <NavLink href="#clients">Clientes</NavLink>
            <NavLink href="#contact">Contato</NavLink>
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