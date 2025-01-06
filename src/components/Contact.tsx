import React from 'react';
import { Phone, Mail, MapPin } from 'lucide-react';

import iconLinkedln from '../assests/socialIcons/icons8-linkedin-48.png'
import iconInsta from '../assests/socialIcons/icons8-instagram-48.png'
import iconWpp from '../assests/socialIcons/icons8-whatsapp-48.png'

const Contact = () => {

  const redirectLink = () => {
    window.open('https://www.linkedin.com/company/teccorp-field-service/posts/?feedView=all', '_blank');
  }
  const redirectInsta = () => {
    window.open('https://www.instagram.com/teccorp.tec/', '_blank');
  }
  const redirecWpp = () => {
    window.open('https://api.whatsapp.com/send/?phone=5521983736130&text&type=phone_number&app_absent=0', '_blank');
  }
  return (
    <section id="contact" className="py-20 bg-blue-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900">Entre em Contato</h2>
          <p className="mt-4 text-xl text-gray-700">
            Estamos prontos para atender suas necessidades
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12">
          <div className="bg-white p-8 rounded-lg shadow-md">
            <form className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Nome
                </label>
                <input
                  type="text"
                  id="name"
                  className="mt-1 border-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-700 focus:ring-blue-700"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  className="mt-1 border-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-700 focus:ring-blue-700"
                />
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700">
                  Mensagem
                </label>
                <textarea
                  id="message"
                  rows={4}
                  className="mt-1 border-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-700 focus:ring-blue-700"
                ></textarea>
              </div>
              <button
                type="submit"
                className="w-full bg-blue-700 text-white px-4 py-2 rounded-md hover:bg-blue-800 transition-colors"
              >
                Enviar Mensagem
              </button>
            </form>
          </div>

          <div className="space-y-8">
            <ContactInfo
              icon={<Phone />}
              title="Telefone"
              content=" (21) 98373-6130 ou (21) 98376-7040"
            />
            <ContactInfo
              icon={<Mail />}
              title="Email"
              content="contato@teccorp.tec.br"
            />
            <ContactInfo
              icon={<MapPin />}
              title="Endereço"
              content="Av. São Francisco Xavier 899 Rio de Janeiro, RJ."
            />

            <div>
              <h4 className='text-3xl font-bold text-gray-900 text-center'>
                Nossas redes socias
              </h4>
              <div>
                <div className='flex justify-center space-x-4 mt-3'>
                <span>
                  <img onClick={redirectLink} src={iconLinkedln} alt="Link para o LinkedIn" />
                </span>
                <span>
                  <img onClick={redirectInsta} src={iconInsta} alt="Link para o Instagram" />
                </span>
                <span>
                  <img onClick={redirecWpp} src={iconWpp} alt="Link para o WhatsApp" />
                </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const ContactInfo = ({ icon, title, content }: { icon: React.ReactNode; title: string; content: string }) => (
  <div className="flex items-start space-x-4">
    <div className="text-blue-700">
      {React.cloneElement(icon as React.ReactElement, { className: 'h-6 w-6' })}
    </div>
    <div>
      <h3 className="font-semibold text-gray-900">{title}</h3>
      <p className="text-gray-700">{content}</p>
    </div>
  </div>
);

export default Contact;