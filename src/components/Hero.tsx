import React from 'react';
import { Shield, Clock, Wrench } from 'lucide-react';
import FeatureCard from './shared/FeatureCard';

const Hero = () => {
  return (
    <section id="home" className="pt-20 bg-gradient-to-b from-blue-100 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
          A melhor solução em Field Service para resolver os problemas da sua empresa.
          </h1>
          <p className="text-xl text-gray-700 mb-8 max-w-2xl mx-auto">
            Serviços profissionais de manutenção e suporte técnico para manter seus equipamentos funcionando perfeitamente.
          </p>
          <a
            href="#contact"
            className="inline-block bg-blue-700 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-800 transition-colors"
          >
            Solicitar Orçamento
          </a>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mt-16">
          <FeatureCard
            icon={<Shield className="h-8 w-8 text-blue-700" />}
            title="Atendimento Garantido"
            description="Serviço com garantia e profissionais qualificados"
          />
          <FeatureCard
            icon={<Clock className="h-8 w-8 text-blue-700" />}
            title="Resposta Rápida"
            description="Atendimento ágil para minimizar seu tempo de espera"
          />
          <FeatureCard
            icon={<Wrench className="h-8 w-8 text-blue-700" />}
            title="Suporte Completo"
            description="Manutenção preventiva e corretiva para seu equipamento"
          />
        </div>
      </div>
    </section>
  );
};

export default Hero;