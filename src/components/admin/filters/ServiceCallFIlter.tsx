import React from 'react';
import { Filter } from 'lucide-react';

interface ServiceCallFiltersProps {
  selectedMonth: string;
  selectedAnalyst: string;
  selectedStatus: string;
  analysts: string[];
  onMonthChange: (month: string) => void;
  onAnalystChange: (analyst: string) => void;
  onStatusChange: (status: string) => void;
}

const ServiceCallFilters = ({
  selectedMonth,
  selectedAnalyst,
  selectedStatus,
  analysts,
  onMonthChange,
  onAnalystChange,
  onStatusChange
}: ServiceCallFiltersProps) => {
  const months = [
    { value: '', label: 'Todos os meses' },
    { value: '01', label: 'Janeiro' },
    { value: '02', label: 'Fevereiro' },
    { value: '03', label: 'Março' },
    { value: '04', label: 'Abril' },
    { value: '05', label: 'Maio' },
    { value: '06', label: 'Junho' },
    { value: '07', label: 'Julho' },
    { value: '08', label: 'Agosto' },
    { value: '09', label: 'Setembro' },
    { value: '10', label: 'Outubro' },
    { value: '11', label: 'Novembro' },
    { value: '12', label: 'Dezembro' },
  ];

  const status = [
    { value: '', label: 'Todos os status' },
    { value: '01', label: 'Agendado' },
    { value: '02', label: 'Em Andamento' },
    { value: '03', label: 'Cancelado' },
    { value: '04', label: 'Concluído' },
  ];

  return (
    <div className="bg-white p-4 rounded-lg shadow mb-6 overflow-x-auto">
      <div className="flex items-center space-x-4">
        <Filter className="h-5 w-5 text-gray-500" />
        <div className="flex flex-1 space-x-4">
          <div className="w-48">
            <select
              value={selectedMonth}
              onChange={(e) => onMonthChange(e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-800 focus:ring-blue-800"
            >
              {months.map((month) => (
                <option key={month.value} value={month.value}>
                  {month.label}
                </option>
              ))}
            </select>
          </div>
          <div className="w-48">
            <select
              value={selectedAnalyst}
              onChange={(e) => onAnalystChange(e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-800 focus:ring-blue-800"
            >
              <option value="">Todos os técnicos</option>
              {analysts.map((analyst) => (
                <option key={analyst} value={analyst}>
                  {analyst}
                </option>
              ))}
            </select>
          </div>

          <div className="w-48">
            <select
              value={selectedStatus}
              onChange={(e) => onStatusChange(e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-800 focus:ring-blue-800"
            >
              {status.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceCallFilters;