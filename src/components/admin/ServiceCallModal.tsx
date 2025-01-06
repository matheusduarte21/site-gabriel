
import { X } from 'lucide-react';


interface ServiceCallModalProps {
  serviceCall: any;
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
              <InfoItem label="Número do Chamado" value={serviceCall.ticket_number} />
              <InfoItem label="Cliente" value={serviceCall.client} />
              <InfoItem label="técnico" value={serviceCall.technicians} />
              <InfoItem
                label="Data/Hora Agendada"
                value={serviceCall.hour_appointment                }
              />
              <InfoItem label="Hora Agendada" value={serviceCall.hour_appointment} />
              <InfoItem label="Hora de Chegada" value={serviceCall.arrival_time!} />
              <InfoItem label="Hora de Início" value={serviceCall.start_time!} />
              <InfoItem label="Hora de Saída" value={serviceCall.exit_time!} />
              <InfoItem label="Retorno" value={serviceCall.return_visit!} />
              <InfoItem label="Endereço" value={serviceCall.address} />
              <InfoItem label="Distância" value={serviceCall.distance!} />
              <InfoItem label="Despesas" value={serviceCall.expenses!} />
              <InfoItem label="Valor do Chamado" value={serviceCall.value_call!} />
            </div>

            <div>
              <h3 className="font-medium text-gray-900 mb-2">Descrição</h3>
              <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
                {serviceCall.notes}
              </p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

const InfoItem = ({ label, value }: { label: string; value: any }) => (
  <div>
    <dt className="text-sm font-medium text-gray-500">{label}</dt>
    <dd className="mt-1 text-sm text-gray-900">{value}</dd>
  </div>
);

export default ServiceCallModal;
