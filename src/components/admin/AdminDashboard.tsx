import { useEffect, useState } from 'react';
import { PlusCircle } from 'lucide-react';
import { useMemo } from 'react';
import ServiceCallTable from './ServiceCallTable';
import ServiceCallModal from './ServiceCallModal';
import ServiceCallFilters from './filters/ServiceCallFIlter';
import { ServiceCall } from '../../lib/mockData';
import EmployeeForm from './EmployeeForm';
import AdminHeader from './AdminHeader';
import { getServiceCalls } from '../../lib/api/service-calls';

const AdminDashboard = () => {
  const [showForm, setShowForm] = useState(false);
  const [selectedCall, setSelectedCall] = useState<ServiceCall | null>();
  const [serviceCalls, setServiceCalls] = useState<any[]>([]);

  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedAnalyst, setSelectedAnalyst] = useState('');

  const analysts = useMemo(() => {
    const uniqueAnalysts = new Set(serviceCalls.map((call) => call.technicians));
    return Array.from(uniqueAnalysts);
  }, [serviceCalls]);

  const filteredCalls = useMemo(() => {
    return serviceCalls.filter((call) => {
      const date = call.appointment_date || '';  
      const month = date.split('-')[1];  
  
      const monthMatch = selectedMonth 
        ? month === selectedMonth.padStart(2, '0') 
        : true;
  
      const analystMatch = selectedAnalyst 
        ? call.technicians === selectedAnalyst 
        : true;
  
      return monthMatch && analystMatch;
    });
  }, [serviceCalls, selectedMonth, selectedAnalyst]);
  
  

  useEffect(() => {
    const fetchServiceCalls = async () => {
      try {
        const calls = await getServiceCalls();
        setServiceCalls(calls)
      } catch (error) {
        console.error('Erro ao buscar chamados:', error);
      }
    };
  
    fetchServiceCalls();
  }, []);


  return (
    <div className="min-h-screen bg-gray-100 py-6">
      <AdminHeader />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Chamados Técnicos</h1>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center px-4 py-2 bg-blue-800 text-white rounded-md hover:bg-blue-900"
          >
            <PlusCircle className="w-5 h-5 mr-2" />
            Novo Chamado
          </button>
        </div>

        <ServiceCallFilters
          selectedMonth={selectedMonth}
          selectedAnalyst={selectedAnalyst}
          analysts={analysts}
          onMonthChange={setSelectedMonth}
          onAnalystChange={setSelectedAnalyst}
        />

        <ServiceCallTable
          serviceCalls={filteredCalls}
          onViewDetails={(call) => setSelectedCall(call)}      />

        {showForm && (
          <EmployeeForm
            onClose={() => setShowForm(false)}
          />
        )}

        {selectedCall && (
          <ServiceCallModal
            serviceCall={selectedCall}
            onClose={() => setSelectedCall(null)}
          />
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
