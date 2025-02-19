import {  useState } from "react";
import { Delete, Eye, FilePenLine, Trash, X } from "lucide-react";
import { ServiceCall } from "../../lib/mockData";
import StatusBadge from "./table/StatusBadge";
import TableWithStyledHeaders from "./table/TableHeader";
import { deleteItem, UpdateServiceCalls } from "../../lib/api/service-calls";
import supabase from "../../lib/supabase";
import ConfirmDeleteModal from "./ModalDelete";

interface ServiceCallTableProps {
  serviceCalls: any[];
  onViewDetails: (call: ServiceCall) => void;
}

const ServiceCallTable = ({ serviceCalls, onViewDetails}: ServiceCallTableProps) => {
  const headers = [
    "Data",
    "Hora agendada",
    "Status",
    "Cliente",
    "Nº Chamado",
    "Técnico",
    "Ações"
  ];

  const [selectedCall, setSelectedCall] = useState<any>();
  const [callDelete, setCallDelete] = useState<any | string>('')
  const [isModalOpenDelte, setIsModalOpenDelete] = useState(false);

  const openEditModal = (call: ServiceCall) => {
    setSelectedCall(call);
  };
  
  const openDeleteModal = (call: ServiceCall) =>{
    setCallDelete(call)
  }
  
  const closeEditModal = () => {
    setSelectedCall(false);
  };

  const handleDelete = async () => {
    const {id} = callDelete
    await deleteItem(id)
    setIsModalOpenDelete(false);
  };

  const handleUpdate = async () => {
    if (selectedCall) {
      const {  file_url } = selectedCall;
      const id = selectedCall?.id; 
      let fileUrl = file_url

      if (file_url instanceof File) {
       
        const sanitizedFileName = file_url.name
          .toLowerCase()
          .replace(/\s+/g, '-') 
          .replace(/[^\w.\-]+/g, '');
      
        const { data, error } = await supabase.storage
          .from('image_rat')  
          .upload(`files/${sanitizedFileName}`, file_url);
      
        if (error) {
          console.error('Erro ao fazer upload do arquivo:', error);
          return;
        }
      
        fileUrl = data?.path;
      
        console.log('Upload realizado com sucesso. Caminho do arquivo:', fileUrl);
      }
      
      const { data, error } = await supabase
        .from('service_call')
        .update({
          status: selectedCall.status,
          client: selectedCall.client,
          ticket_number: selectedCall.ticket_number,
          appointment_date: selectedCall.appointment_date,
          hour_appointment: selectedCall.hour_appointment,
          arrival_time: selectedCall.arrival_time ,
          start_time: selectedCall.start_time,
          exit_time: selectedCall.exit_time,
          return_visit: selectedCall.return_visit,
          address: selectedCall.address,
          distance: selectedCall.distance,
          expenses: selectedCall.expenses,
          value_call: selectedCall.value_call,
          technicians: selectedCall.technicians,
          notes: selectedCall.notes,
          file_url: fileUrl,
          company: selectedCall.company,
          total_value: selectedCall.total_value,
          hour_total: selectedCall.hour_total,
          overtime: selectedCall.overtime
          })
          .eq('id', id);

        if (error?.details) {
          console.error('Erro ao atualizar o registro:', error);
        } else {
          console.log('Registro atualizado com sucesso:', data);
        }
        

      closeEditModal();
    }
  };
  


  return (
    <div>
      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <TableWithStyledHeaders headers={headers} />
          <tbody className="bg-white divide-y divide-gray-200">
            {serviceCalls.map((call) => (
              <tr
                key={call.id}
                className="hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {new Date(call.appointment_date).toLocaleDateString('pt-BR')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {call.hour_appointment}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <StatusBadge status={call.status} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {call.client}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {call.ticket_number}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {call.technicians}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onViewDetails(call);
                      }}
                      className="text-blue-600 hover:text-blue-900 transition-colors"
                    >
                      <Eye className="h-5 w-5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openEditModal(call);
                      }}
                      className="text-blue-600 hover:text-blue-900 transition-colors"
                    >
                      <FilePenLine className="h-5 w-5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsModalOpenDelete(true)
                        openDeleteModal(call)
                      }}
                      className="text-blue-600 hover:text-blue-900 transition-colors"
                    >
                      <Trash className="h-5 w-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpenDelte && (
        <ConfirmDeleteModal
          itemName={`Chamado ${callDelete?.ticket_number || 'Ainda não existente'}`}
          onConfirm={handleDelete}
          onCancel={() => setIsModalOpenDelete(false)}
        />
      )}

{selectedCall && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
    <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Editar Chamado</h2>
          <button onClick={closeEditModal} className="text-gray-500 hover:text-gray-700">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="grid gap-6">
          <div className="">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 border border-black p-5 rounded-[10px]">
              <div>
                <label className="block text-sm font-medium text-gray-700">Número do Chamado</label>
                <input
                  type="text"
                  value={selectedCall?.ticket_number || ''}
                  onChange={(e) =>
                    setSelectedCall({ ...selectedCall, ticket_number: e.target.value })
                  }
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Status</label>
              <select
                value={selectedCall?.status || ''}
                onChange={(e) =>
                  setSelectedCall({
                    ...selectedCall,
                    status: e.target.value as "Agendado" | "Em Andamento" | "Concluído" | "Cancelado",
                  })
                }
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="Agendado">Agendado</option>
                <option value="Em Andamento">Em andamento</option>
                <option value="Concluído">Concluído</option>
                <option value="Cancelado">Cancelado</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Cliente</label>
              <input
                type="text"
                value={selectedCall?.client || ''}
                onChange={(e) =>
                  setSelectedCall({ ...selectedCall, client: e.target.value })
                }
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Empresa</label>
              <input
                type="text"
                value={selectedCall?.company || ''}
                onChange={(e) =>
                  setSelectedCall({ ...selectedCall, company: e.target.value })
                }
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Retorno</label>
              <select
                value={selectedCall?.return_visit || ''}
                onChange={(e) =>
                  setSelectedCall({ ...selectedCall, return_visit: e.target.value })
                }
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="">Selecione</option>
                <option value="Sim">Sim</option>
                <option value="Não">Não</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Técnico</label>
              <select
                value={selectedCall?.technicians || ''}
                onChange={(e) =>
                  setSelectedCall({ ...selectedCall, technicians: e.target.value })
                }
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="">Selecione</option>
                <option value="ELISSAMA">ELISSAMA</option>
                <option value="GABRIEL">GABRIEL</option>
                <option value="LEONARDO">LEONARDO</option>
                <option value="MARCUS">MARCUS</option>
                <option value="DIOGO">DIOGO</option>
                <option value="JUAN">JUAN</option>
                <option value="JEFERSON">JEFERSON</option>
                <option value="ROBSON">ROBSON</option>
                <option value="THIAGO">THIAGO</option>
              </select>
            </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 mt-2 gap-6 border border-black p-5 rounded-[10px]">
              <div>
                <label className="block text-sm font-medium text-gray-700">Hora Agendada</label>
                <input
                  type="date"
                  value={selectedCall?.appointment_date}
                  onChange={(e) =>
                    setSelectedCall({ ...selectedCall, appointment_date: e.target.value })
                  }
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Hora de Chegada</label>
                <input
                  type="time"
                  value={selectedCall?.arrival_time}
                  onChange={(e) =>
                    setSelectedCall({ ...selectedCall, arrival_time: e.target.value })
                  }
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Hora de Início</label>
                <input
                  type="time"
                  value={selectedCall.start_time}
                  onChange={(e) =>
                    setSelectedCall({ ...selectedCall, start_time: e.target.value })
                  }
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Hora de Saída</label>
                <input
                  type="time"
                  value={selectedCall?.exit_time}
                  onChange={(e) =>
                    setSelectedCall({ ...selectedCall, exit_time: e.target.value })
                  }
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Horas totais</label>
                <input
                  type="time"
                  value={selectedCall?.hour_total}
                  onChange={(e) =>
                    setSelectedCall({ ...selectedCall, hour_total: e.target.value })
                  }
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Endereço</label>
                <input
                  type="text"
                  value={selectedCall?.address}
                  onChange={(e) =>
                    setSelectedCall({ ...selectedCall, address: e.target.value })
                  }
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
             </div>

            </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-1 mt-2 gap-6 border border-black p-5 rounded-[10px]">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div>
                  <label className="block text-sm font-medium text-gray-700">Distância</label>
                  <input
                    type="text"
                    value={selectedCall?.distance}
                    onChange={(e) =>
                      setSelectedCall({ ...selectedCall, distance: e.target.value })
                    }
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Despesas</label>
                    <input
                      type="number"
                      value={selectedCall?.expenses}
                      onChange={(e) =>
                        setSelectedCall({ ...selectedCall, expenses: e.target.value })
                      }
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Valor do Chamado</label>
                  <input
                    type="number"
                    value={selectedCall?.value_call}
                    onChange={(e) =>
                      setSelectedCall({ ...selectedCall, value_call: e.target.value })
                    }
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
            </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Valores totais</label>
                  <input
                    type="text"
                    value={selectedCall?.total_value}
                    onChange={(e) =>
                      setSelectedCall({ ...selectedCall, total_value: e.target.value })
                    }
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Hora extra</label>
                  <input
                    type="text"
                    value={selectedCall?.overtime}
                    onChange={(e) =>
                      setSelectedCall({ ...selectedCall, overtime: e.target.value })
                    }
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-1 mt-2 gap-6 border border-black p-5 rounded-[10px]">
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Descrição</h3>
                <textarea
                  value={selectedCall?.notes}
                  onChange={(e) =>
                    setSelectedCall({ ...selectedCall, notes: e.target.value })
                  }
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-medium text-gray-900 mb-2">Anexar RAT</h3>
            <input
            id="file"
            type="file"
            accept=".png,.jpg,.jpeg,.pdf"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                setSelectedCall({ ...selectedCall, file_url: file });
              }
            }}
            className="mt-2 border-2 block w-full rounded-md py-1.5 pl-1 pr-3 text-base text-gray-900 border-gray-300 shadow-sm focus:border-indigo-600 focus:ring-indigo-600 sm:text-sm"
           />
          </div>
        </div>

        <div className="flex justify-end space-x-2 mt-6">
              <button
                onClick={closeEditModal}
                className="bg-gray-200 px-4 py-2 rounded text-gray-700 hover:bg-gray-300"
              >
                Cancelar
              </button>
              <button
                onClick={handleUpdate}
                className="bg-blue-600 px-4 py-2 rounded text-white hover:bg-blue-700"
              >
                Salvar
              </button>
        </div>
      </div>
    </div>
  </div>
)}
    </div>
  );
};

export default ServiceCallTable;
