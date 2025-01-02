import React, { useState } from "react";
import { Eye, FilePenLine, X } from "lucide-react";
import { ServiceCall } from "../../lib/mockData";
import StatusBadge from "./table/StatusBadge";
import TableWithStyledHeaders from "./table/TableHeader";
import { ListClientes } from "../../helpers/ListClients";

interface ServiceCallTableProps {
  serviceCalls: ServiceCall[];
  onViewDetails: (call: ServiceCall) => void;
  onUpdateCall: (updatedCall: ServiceCall) => void;
}

const ServiceCallTable = ({ serviceCalls, onViewDetails, onUpdateCall }: ServiceCallTableProps) => {
  const headers = [
    "Data/Hora",
    "Status",
    "Cliente",
    "Nº Chamado",
    "Analista",
    "Ações",
  ];

  const [selectedCall, setSelectedCall] = useState<ServiceCall | null>(null);

  const openEditModal = (call: ServiceCall) => {
    setSelectedCall(call);
  };

  const closeEditModal = () => {
    setSelectedCall(null);
  };

  const handleUpdate = () => {
    if (selectedCall) {
      onUpdateCall(selectedCall);
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
                  {new Date(call.datetime).toLocaleString("pt-BR")}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <StatusBadge status={call.status} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {call.client}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {call.ticketNumber}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {call.analyst}
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
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

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

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Número do Chamado</label>
              <input
                type="text"
                value={selectedCall?.ticketNumber}
                onChange={(e) =>
                  setSelectedCall({ ...selectedCall, ticketNumber: e.target.value })
                }
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Status</label>
              <select
                value={selectedCall?.status}
                onChange={(e) =>
                  setSelectedCall({
                    ...selectedCall,
                    status: e.target.value as "Pendente" | "Em Andamento" | "Concluído" | "Cancelado",
                  })
                }
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="Pendente">Pendente</option>
                <option value="Em andamento">Em andamento</option>
                <option value="Concluído">Concluído</option>
                <option value="Cancelado">Cancelado</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Cliente</label>
              <select
                value={selectedCall?.client}
                onChange={(e) =>
                  setSelectedCall({ ...selectedCall, client: e.target.value })
                }
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="">Selecione</option>
                {ListClientes.map((client) => (
                  <option key={client.value} value={client.value}>
                    {client.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Analista</label>
              <select
                value={selectedCall?.analyst}
                onChange={(e) =>
                  setSelectedCall({ ...selectedCall, analyst: e.target.value })
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

            <div>
              <label className="block text-sm font-medium text-gray-700">Data/Hora do Chamado</label>
              <input
                type="datetime-local"
                value={new Date(selectedCall?.datetime).toISOString().slice(0, 16)}
                onChange={(e) =>
                  setSelectedCall({ ...selectedCall, datetime: e.target.value })
                }
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Data/Hora Agendada</label>
              <input
                type="datetime-local"
                value={new Date(selectedCall?.appointmentDate).toISOString().slice(0, 16)}
                onChange={(e) =>
                  setSelectedCall({ ...selectedCall, appointmentDate: e.target.value })
                }
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Hora de Chegada</label>
              <input
                type="time"
                value={selectedCall?.arrivalTime}
                onChange={(e) =>
                  setSelectedCall({ ...selectedCall, arrivalTime: e.target.value })
                }
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Hora de Início</label>
              <input
                type="time"
                value={selectedCall?.StartTime}
                onChange={(e) =>
                  setSelectedCall({ ...selectedCall, StartTime: e.target.value })
                }
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Hora de Saída</label>
              <input
                type="time"
                value={selectedCall?.exitTime}
                onChange={(e) =>
                  setSelectedCall({ ...selectedCall, exitTime: e.target.value })
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
                type="text"
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
                type="text"
                value={selectedCall?.valueCall}
                onChange={(e) =>
                  setSelectedCall({ ...selectedCall, valueCall: e.target.value })
                }
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
          </div>

          <div>
            <h3 className="font-medium text-gray-900 mb-2">Descrição</h3>
            <textarea
              value={selectedCall?.description}
              onChange={(e) =>
                setSelectedCall({ ...selectedCall, description: e.target.value })
              }
              className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
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
