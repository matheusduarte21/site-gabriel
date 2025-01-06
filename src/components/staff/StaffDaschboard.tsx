import React, { useEffect,useState } from 'react';
import ServiceCallList from './ServiceCallList';
import { getServiceCalls } from '../../lib/api/service-calls';
import { ServiceCall } from '../../lib/mockData';

const StaffDashboard = () => {

  const [serviceCalls, setServiceCalls] = useState<ServiceCall[]>([]);

  useEffect(() => {
      const fetchServiceCalls = async () => {
        try {
          const calls = await getServiceCalls();
          setServiceCalls(calls);
        } catch (error) {
          console.error('Erro ao buscar chamados:', error);
        }
      };
    
      fetchServiceCalls();
    }, [serviceCalls]);

    
  const inProgressCalls = serviceCalls.filter(call => call.status === 'Em Andamento');
  const pendingCalls = serviceCalls.filter(call => call.status === 'Agendado');
  const completedCalls = serviceCalls.filter(call => call.status === 'Concluído');

  return (
    <div className="min-h-screen bg-gray-100 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Painel de Chamados</h1>
        
        <div className="space-y-6">
          <ServiceCallList
            title="Em Andamento"
            calls={inProgressCalls}
            badgeColor="bg-blue-100 text-blue-800"
          />
          
          <ServiceCallList
            title="Agendados"
            calls={pendingCalls}
            badgeColor="bg-yellow-100 text-yellow-800"
          />
          
          <ServiceCallList
            title="Concluídos"
            calls={completedCalls}
            badgeColor="bg-green-100 text-green-800"
          />
        </div>
      </div>
    </div>
  );
};

export default StaffDashboard;