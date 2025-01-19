
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
              Chamado {serviceCall.ticket_number}
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
              <InfoItem label="Número do Chamado" value={`${serviceCall.ticket_number ? serviceCall.ticket_number : 'Não atribuido'}`} />
              <InfoItem label="Empresa" value={`${serviceCall.company ?  serviceCall.company : 'Não atribuido'}`} />
              <InfoItem label="técnico" value={serviceCall.technicians} />
              <InfoItem label="Hora Agendada" value={serviceCall.hour_appointment} />
              <InfoItem label="Hora de Chegada" value={`${serviceCall.arrival_time ? serviceCall.arrival_time!: 'Não atruibuido'}`} />
              <InfoItem label="Hora de Início" value={`${serviceCall.start_time ? serviceCall.start_time : 'Não atribuido' }`} />
              <InfoItem label="Hora de Saída" value={`${serviceCall.exit_time ? serviceCall.exit_time : 'Não atribuido'}`} />
              <InfoItem label="Horas totais" value={`${serviceCall.hour_total ? serviceCall.hour_total : 'Não atribuido'}`} />
              <InfoItem label="Retorno" value={`${serviceCall.return_visit ? serviceCall.return_visit : 'Não atribuido'}`} />
              <InfoItem label="Endereço" value={serviceCall.address} />
              <InfoItem label="Distância" value={`${serviceCall.distance ? serviceCall.distance : 'Não atribuido'}`} />
              <InfoItem label="Despesas" value={`R$ ${serviceCall.expenses ? serviceCall.expenses : 'R$ 0,00'}`} />
              <InfoItem label="Valor do Chamado" value={` R$ ${serviceCall.value_call ? serviceCall.value_call : 'R$ 0,00'}`} />
              <InfoItem label="Valor total" value={serviceCall.total_value!} />
              <InfoItem label="Hora extra" value={serviceCall.overtime!} />
            </div>
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Descrição</h3>
              <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
                {serviceCall.notes}
              </p>
            </div>

            <div>
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
                      className="w-full h-auto rounded-lg"
                    />
                  )
                ) : (
                  <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
                    Nenhuma imagem disponível
                  </p>
                )}
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
