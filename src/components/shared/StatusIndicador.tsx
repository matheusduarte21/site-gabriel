import React from 'react';
import { ServiceCall } from '../../lib/mockData';

const statusStyles = {
  'Pendente': 'bg-yellow-50 text-yellow-800 border-yellow-200',
  'Em Andamento': 'bg-blue-50 text-blue-800 border-blue-200',
  'Concluído': 'bg-green-50 text-green-800 border-green-200',
  'Cancelado': 'bg-gray-50 text-gray-800 border-gray-200'
} as const;

interface StatusIndicatorProps {
  status: ServiceCall['status'];
  className?: string;
}

const StatusIndicator = ({ status, className = '' }: StatusIndicatorProps) => (
  <span className={`px-3 py-1 rounded-full text-sm font-medium border ${statusStyles[status]} ${className}`}>
    {status}
  </span>
);

export default StatusIndicator;