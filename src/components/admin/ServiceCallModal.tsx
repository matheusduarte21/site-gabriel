
import { X } from 'lucide-react';


interface ServiceCallModalProps {
  serviceCall: any;
  onClose: () => void;
}

const ServiceCallModal = ({ serviceCall, onClose }: ServiceCallModalProps) => {

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-lg p-5">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Chamado {serviceCall.ticket_number || 'Não atribuído'}
            </h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-900">
              <X size={20} />
            </button>
          </div>
  
          <div className="grid gap-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 border border-black p-5 rounded-[10px]">
              <InfoItem label="Status" value={serviceCall.status} />
              <InfoItem label="Número do Chamado" value={serviceCall.ticket_number || 'Não atribuído'} />
              <InfoItem label="Empresa" value={serviceCall.company || 'Não atribuído'} />
              <InfoItem label="Técnico" value={serviceCall.technicians || 'Não atribuído'} />
              <InfoItem label="Hora Agendada" value={serviceCall.hour_appointment || 'Não atribuído'} />
              <InfoItem label="Endereço" value={serviceCall.address || 'Não atribuído'} />
            </div>
  
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 border border-black p-5 rounded-[10px]">
              <InfoItem label="Hora de Chegada" value={serviceCall.arrival_time || 'Não atribuído'} />
              <InfoItem label="Hora de Início" value={serviceCall.start_time || 'Não atribuído'} />
              <InfoItem label="Hora de Saída" value={serviceCall.exit_time || 'Não atribuído'} />
              <InfoItem label="Horas Totais" value={serviceCall.hour_total || 'Não atribuído'} />
            </div>
  
            <div className="grid grid-cols-1 border border-black p-5 rounded-[10px]">
              <h3 className="font-medium text-gray-900 mb-2">Descrição</h3>
              <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
                {serviceCall.notes || 'Nenhuma descrição disponível'}
              </p>
            </div>
  
            <div className="grid grid-cols-1 border border-black p-5 rounded-[10px]">
              <h3 className="font-medium text-gray-900 mb-2">Imagem RAT</h3>
              {serviceCall.imageUrl ? (
                serviceCall.imageUrl.endsWith('pdf') ? (
                  <iframe
                    src={serviceCall.imageUrl}
                    title="Documento relacionado à chamada de serviço"
                    className="w-full h-96 rounded-lg"
                  />
                ) : (
                  <img
                    src={serviceCall.imageUrl}
                    alt="Imagem relacionada ao chamado"
                    className="w-full h-auto rounded-lg"
                  />
                )
              ) : (
                <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">Nenhuma imagem disponível</p>
              )}
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
