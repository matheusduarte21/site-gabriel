import React, { useState } from "react";
import Modal from "react-modal";
import { X } from "lucide-react";
import { ListClientes } from "../../helpers/ListClients";
Modal.setAppElement("#root");

interface EmployeeFormProps {
  onClose: () => void;
  // onSuccess: (employeeData: Record<string, string>) => void;
}

const EmployeeForm = ({ onClose}: EmployeeFormProps) => {
  const [formData, setFormData] = useState({
    clientName: "",
    callNumber: "",
    returnVisit: "",
    exitTime: "",
    entryTime: "",
    distance: "",
    address: "",
    status: "",
    technicians: "",
    notes: "",
    appointmentDate: "",
    HourAppointment:"",
    StartTime:"",
    arrivalTime:"",
    expenses:"",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onClose();
  };

  return (
    <Modal
      isOpen={true}
      onRequestClose={onClose}
      overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
      className="bg-white rounded-lg shadow-lg w-full max-w-4xl p-6 overflow-auto sm:overflow-hidden h-screen"
    >
      <div  className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Novo Registro</h2>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-900"
        >
          <X size={20} />
        </button>
      </div>
      <form onSubmit={handleSubmit} className="grid gap-6">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-900">
             Cliente
            </label>
            <select
              name="returnVisit"
              value={formData.clientName}
              onChange={handleInputChange}
              className="mt-2 border-2 block w-full rounded-md block min-w-0 grow py-1.5 pl-1 pr-3 text-base text-gray-900 border-gray-300 shadow-sm focus:border-indigo-600 focus:ring-indigo-600 sm:text-sm"
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
            <label className="block text-sm font-medium text-gray-900">
              Número do chamado
            </label>
            <input
              type="text"
              name="callNumber"
              value={formData.callNumber}
              onChange={handleInputChange}
              className="mt-2 border-2 block w-full  block min-w-0 grow py-1.5 pl-1 pr-3 text-base text-gray-900 rounded-md border-gray-300 shadow-sm focus:border-indigo-600 focus:ring-indigo-600 sm:text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900">
              Data agendada
            </label>
            <input
              type="date"
              name="callNumber"
              value={formData.appointmentDate}
              onChange={handleInputChange}
              className="mt-2 border-2 block w-full  block min-w-0 grow py-1.5 pl-1 pr-3 text-base text-gray-900 rounded-md border-gray-300 shadow-sm focus:border-indigo-600 focus:ring-indigo-600 sm:text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900">
              Hora agendada
            </label>
            <input
              type="time"
              name="callNumber"
              value={formData.HourAppointment}
              onChange={handleInputChange}
              className="mt-2 border-2 block w-full  block min-w-0 grow py-1.5 pl-1 pr-3 text-base text-gray-900 rounded-md border-gray-300 shadow-sm focus:border-indigo-600 focus:ring-indigo-600 sm:text-sm"
            />
          </div>

        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-900">
              Chegada no local
            </label>
            <input
              type="time"
              name="exitTime"
              value={formData.arrivalTime}
              onChange={handleInputChange}
              className="mt-2 block border-2 w-full block min-w-0 grow py-1.5 pl-1 pr-3 text-base text-gray-900 rounded-md border-gray-300 shadow-sm focus:border-indigo-600 focus:ring-indigo-600 sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900">
              Inicio de atendimento
            </label>
            <input
              type="time"
              name="entryTime"
              value={formData.StartTime}
              onChange={handleInputChange}
              className="mt-2 block border-2 w-full block min-w-0 grow py-1.5 pl-1 pr-3 text-base text-gray-900 rounded-md border-gray-300 shadow-sm focus:border-indigo-600 focus:ring-indigo-600 sm:text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900">
              Fim de atendimento
            </label>
            <input
              type="time"
              name="entryTime"
              value={formData.exitTime}
              onChange={handleInputChange}
              className="mt-2 block border-2 w-full block min-w-0 grow py-1.5 pl-1 pr-3 text-base text-gray-900 rounded-md border-gray-300 shadow-sm focus:border-indigo-600 focus:ring-indigo-600 sm:text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900">
              Retorno
            </label>
            <select
              name="returnVisit"
              value={formData.returnVisit}
              onChange={handleInputChange}
              className="mt-2 border-2 block w-full rounded-md block min-w-0 grow py-1.5 pl-1 pr-3 text-base text-gray-900 border-gray-300 shadow-sm focus:border-indigo-600 focus:ring-indigo-600 sm:text-sm"
            >
              <option value="">Selecione</option>
              <option value="Sim">Sim</option>
              <option value="Não">Não</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-900">
              Endereço (rua, n°, bairro )
            </label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              className="mt-2 block border-2 w-full block min-w-0 grow py-1.5 pl-1 pr-3 text-base text-gray-900 rounded-md border-gray-300 shadow-sm focus:border-indigo-600 focus:ring-indigo-600 sm:text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900">
            Deslocamento
            </label>
            <input
              type="text"
              name="distance"
              value={formData.distance}
              onChange={handleInputChange}
              className="mt-2 block border-2 w-full block min-w-0 grow py-1.5 pl-1 pr-3 text-base text-gray-900 rounded-md border-gray-300 shadow-sm focus:border-indigo-600 focus:ring-indigo-600 sm:text-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-900">
              Despesas
            </label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              className="mt-2 block border-2 w-full block min-w-0 grow py-1.5 pl-1 pr-3 text-base text-gray-900 rounded-md border-gray-300 shadow-sm focus:border-indigo-600 focus:ring-indigo-600 sm:text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900">
            Valor do chamado
            </label>
            <input
              type="number"
              name="distance"
              value={formData.expenses}
              onChange={handleInputChange}
              className="mt-2 block border-2 w-full block min-w-0 grow py-1.5 pl-1 pr-3 text-base text-gray-900 rounded-md border-gray-300 shadow-sm focus:border-indigo-600 focus:ring-indigo-600 sm:text-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-900">
              Status
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              className="mt-2 border-2 block w-full block min-w-0 grow py-1.5 pl-1 pr-3 text-base text-gray-900 rounded-md border-gray-300 shadow-sm focus:border-indigo-600 focus:ring-indigo-600 sm:text-sm"
            >
              <option value="">Selecione</option>
              <option value="Concluído">Finalizado</option>
              <option value="Concluído">Agendado</option>
              <option value="Cancelado">Em atendimento</option>
              <option value="Em andamento">Encerrado</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900">
              Técnicos
            </label>
            <select
              name="technicians"
              value={formData.technicians}
              onChange={handleInputChange}
              className="mt-2 border-2 block w-full block min-w-0 grow py-1.5 pl-1 pr-3 text-base text-gray-900 rounded-md border-gray-300 shadow-sm focus:border-indigo-600 focus:ring-indigo-600 sm:text-sm"
            >
              <option value="">Selecione</option>
              <option value="Fulano 1">ELISSAMA</option>
              <option value="Fulano 2">GABRIEL</option>
              <option value="Fulano 3">LEONARDO</option>
              <option value="Fulano 3">MARCUS</option>
              <option value="Fulano 3">DIOGO</option>
              <option value="Fulano 3">JUAN</option>
              <option value="Fulano 3">JEFERSON</option>
              <option value="Fulano 3">ROBSON</option>
              <option value="Fulano 3">THIAGO</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-900">
            Observações
          </label>
          <textarea
            name="notes"
            rows={4}
            value={formData.notes}
            onChange={handleInputChange}
            className="mt-2 border-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-600 focus:ring-indigo-600 sm:text-sm"
            placeholder="Digite suas observações aqui"
          />
        </div>
        <div className="flex justify-end">
          <button
            type="submit"
            className="px-4 py-2 bg-blue-800 text-white rounded-md hover:bg-blue-900"
          >
            Salvar
          </button>
        </div>
      </form>
    </Modal>
  );
};


export default EmployeeForm;
