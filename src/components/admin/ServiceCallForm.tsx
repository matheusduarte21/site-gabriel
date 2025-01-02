import React, { useState } from 'react';
import { X } from 'lucide-react';
import { ServiceCall } from '../../lib/mockData';

interface ServiceCallFormProps {
  onClose: () => void;
  onSuccess: (serviceCall: Omit<ServiceCall, 'id'>) => void;
}

const ServiceCallForm = ({ onClose, onSuccess }: ServiceCallFormProps) => {
  const [formData, setFormData] = useState({
    datetime: new Date().toISOString().slice(0, 16),
    status: 'Pendente' as ServiceCall['status'],
    client: '',
    ticketNumber: `TK-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
    analyst: '',
    description: '',
    equipment: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSuccess(formData);
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Novo Chamado</h2>
            <button onClick={onClose}>
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Data/Hora
                </label>
                <input
                  type="datetime-local"
                  required
                  value={formData.datetime}
                  onChange={(e) => setFormData({ ...formData, datetime: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-800 focus:ring-blue-800"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Status
                </label>
                <select
                  required
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as ServiceCall['status'] })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-800 focus:ring-blue-800"
                >
                  <option value="Pendente">Pendente</option>
                  <option value="Em Andamento">Em Andamento</option>
                  <option value="Concluído">Concluído</option>
                  <option value="Cancelado">Cancelado</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Cliente
                </label>
                <input
                  type="text"
                  required
                  value={formData.client}
                  onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-800 focus:ring-blue-800"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Analista
                </label>
                <input
                  type="text"
                  required
                  value={formData.analyst}
                  onChange={(e) => setFormData({ ...formData, analyst: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-800 focus:ring-blue-800"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Equipamento
                </label>
                <input
                  type="text"
                  required
                  value={formData.equipment}
                  onChange={(e) => setFormData({ ...formData, equipment: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-800 focus:ring-blue-800"
                />
              </div>
  
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Descrição
              </label>
              <textarea
                required
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-800 focus:ring-blue-800"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-800 text-white px-4 py-2 rounded-md hover:bg-blue-900"
            >
              Salvar
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ServiceCallForm;