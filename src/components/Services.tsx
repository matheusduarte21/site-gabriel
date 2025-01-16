import React from 'react';
import { Monitor, Cpu, Wifi, Settings } from 'lucide-react';

const Services = () => {
  const services = [
    {
      icon: <Monitor />,
      title: 'Manutenção de Computadores',
      description: 'Realizamos manutenção, configuração e instalação de equipamentos de telefonia e internet'
    },
    {
      icon: <Cpu />,
      title: 'Rack e Servidores',
      description: 'Realizamos instalações, manutenção e substituições de rack e servidores.'
    },
    {
      icon: <Settings />,
      title: 'Micro Informática',
      description: 'Realizamos formatação, configuração e instalação de  computadores e periféricos.'
    },
    {
      icon:  <Wifi />,
      title: 'Cabeamento Estruturado',
      description: 'Realizamos passagem e testes de cabeamento UTP / Fibra Optica.'
    },
  ];

  return (
    <section id="services" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900">Nossos Serviços</h2>
          <p className="mt-4 text-xl text-gray-700">
            Oferecemos uma ampla gama de serviços para atender todas as suas necessidades
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
          {services.map((service, index) => (
            <div
              key={index}
              className="p-6 border border-gray-200 rounded-lg hover:shadow-lg transition-shadow"
            >
              <div className="text-blue-700 mb-4">
                {React.cloneElement(service.icon as React.ReactElement, { className: 'h-8 w-8' })}
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{service.title}</h3>
              <p className="text-gray-700">{service.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;