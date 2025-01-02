import React from 'react';
import { X } from 'lucide-react';
import { ServiceCall } from '../../lib/mockData';

interface ServiceCallModalProps {
  serviceCall: ServiceCall;
  onClose: () => void;
}

const ServiceCallModal = ({ serviceCall, onClose }: ServiceCallModalProps) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Chamado {serviceCall.ticketNumber}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <InfoItem label="Status" value={serviceCall.status} />
              <InfoItem
                label="Data/Hora do Chamado"
                value={new Date(serviceCall.datetime).toLocaleString('pt-BR')}
              />
              <InfoItem label="Número do Chamado" value={serviceCall.callNumber} />
              <InfoItem label="Cliente" value={serviceCall.client} />
              <InfoItem label="Analista" value={serviceCall.analyst} />
              <InfoItem
                label="Data/Hora Agendada"
                value={new Date(serviceCall.appointmentDate).toLocaleString('pt-BR')}
              />
              <InfoItem label="Hora Agendada" value={serviceCall.HourAppointment} />
              <InfoItem label="Hora de Chegada" value={serviceCall.arrivalTime} />
              <InfoItem label="Hora de Início" value={serviceCall.StartTime} />
              <InfoItem label="Hora de Saída" value={serviceCall.exitTime} />
              <InfoItem label="Retorno" value={serviceCall.returnVisit} />
              <InfoItem label="Endereço" value={serviceCall.address} />
              <InfoItem label="Distância" value={serviceCall.distance} />
              <InfoItem label="Despesas" value={serviceCall.expenses} />
              <InfoItem label="Valor do Chamado" value={serviceCall.valueCall} />
            </div>

            <div>
              <h3 className="font-medium text-gray-900 mb-2">Descrição</h3>
              <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
                {serviceCall.description}
              </p>
            </div>

            {serviceCall.solution && (
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Solução</h3>
                <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
                  {serviceCall.solution}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const InfoItem = ({ label, value }: { label: string; value: string }) => (
  <div>
    <dt className="text-sm font-medium text-gray-500">{label}</dt>
    <dd className="mt-1 text-sm text-gray-900">{value}</dd>
  </div>
);

export default ServiceCallModal;
