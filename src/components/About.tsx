import React from 'react';
import { CheckCircle } from 'lucide-react';
import photoTecnico from '../assests/uteis/tecnico.avif'

const About = () => {
  return (
    <section id="about" className="py-20 bg-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Sobre Nós</h2>
            <p className="text-gray-600 mb-6 text-justify" >
            Fundada em 2019, a Teccorp é reconhecida pela excelência em serviços técnicos, conquistando a confiança de clientes por sua eficiência, qualidade e segurança. Com uma equipe altamente capacitada, nossa missão é superar expectativas, oferecendo soluções inovadoras que atendam às necessidades do mercado. Comprometida com a qualidade e a melhoria contínua, a Teccorp planeja expandir seus serviços, investindo em capacitação e tecnologias emergentes para fortalecer sua posição como referência no setor.
            </p>
            <div className="space-y-4">
              <Feature text="Técnicos altamente qualificados" />
              <Feature text="Atendimento rápido e eficiente" />
              <Feature text="Garantia em todos os serviços" />
              <Feature text="Preços competitivos" />
            </div>
          </div>
          <div className="relative">
            <img
              src={photoTecnico}
              alt="Técnico trabalhando"
              className="rounded-lg shadow-lg w-full"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

const Feature = ({ text }: { text: string }) => (
  <div className="flex items-center space-x-2">
    <CheckCircle className="h-5 w-5 text-blue-600" />
    <span className="text-gray-700">{text}</span>
  </div>
);

export default About;