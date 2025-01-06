import React from 'react';
import { ServiceCall } from '../../../lib/mockData';

interface StatusBadgeProps {
  status: ServiceCall['status'];
}

const statusColors = {
  'Agendado': 'bg-yellow-100 text-yellow-800',
  'Em Andamento': 'bg-blue-100 text-blue-800',
  'Concluído': 'bg-green-100 text-green-800',
  'Cancelado': 'bg-gray-100 text-gray-800'
} as const;

export const StatusBadge = ({ status }: StatusBadgeProps) => (
  <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[status]}`}>
    {status}
  </span>
);

export default StatusBadge;