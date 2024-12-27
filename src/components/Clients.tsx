import React from 'react';

import logoBatata from '../assests/logosClientes/batata.png'
import bK from '../assests/logosClientes/BK.png'
import itau from '../assests/logosClientes/Itau-logo.png'
import kfc from '../assests/logosClientes/KFC.png'
import mc from '../assests/logosClientes/MC.png'
import micrsoft from '../assests/logosClientes/Microsoft_Logo_128px.png'
import brasil from '../assests/logosClientes/brasil.png'
import pizza from '../assests/logosClientes/pizzahut.png'
import santander from '../assests/logosClientes/santander.png'
import smart from '../assests/logosClientes/smartit.png'


const Clients = () => {
  const testimonials = [
    {
      ImageSrc: logoBatata
    },
    {
      ImageSrc: bK
    }
    ,
    {
      ImageSrc: itau
    },
    {
      ImageSrc: kfc
    },
    {
      ImageSrc: mc
    },
    ,
    {
      ImageSrc: micrsoft
    },
    {
      ImageSrc: brasil
    },
    {
      ImageSrc: pizza
    },
    {
      ImageSrc: santander
    },,
    {
      ImageSrc: smart
    }
  ];

  return (
    <section id="clients" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900">Nossos Clientes</h2>
          <p className="mt-4 text-xl text-gray-600">
          Abaixo, apresentamos os clientes que já foram atendidos por nossa equipe
          </p>
        </div>

        <div className="grid md:grid-cols-5 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-gray-50 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow flex items-center justify-center"
            >
              <p className="text-gray-600 italic mb-4"></p>
                <div>
                  <div>
                    <img width='250px' src={testimonial!.ImageSrc} />
                  </div>
                </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Clients;