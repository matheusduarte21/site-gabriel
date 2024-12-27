import React, { useState } from "react";
import Modal from "react-modal";
import { X } from "lucide-react";
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
    city: "",
    status: "",
    state: "",
    technicians: "",
    notes: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // onSuccess(formData);
    onClose();
  };

  return (
    <Modal
      isOpen={true}
      onRequestClose={onClose}
      overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
      className="bg-white rounded-lg shadow-lg w-full max-w-4xl p-6"
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
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-900">
              Nome do Cliente
            </label>
            <input
              type="text"
              name="clientName"
              value={formData.clientName}
              onChange={handleInputChange}
              className="mt-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-600 focus:ring-indigo-600 sm:text-sm"
            />
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
              className="mt-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-600 focus:ring-indigo-600 sm:text-sm"
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
              className="mt-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-600 focus:ring-indigo-600 sm:text-sm"
            >
              <option value="">Selecione</option>
              <option value="Sim">Sim</option>
              <option value="Não">Não</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-900">
              Hora de Saída
            </label>
            <input
              type="text"
              name="exitTime"
              value={formData.exitTime}
              onChange={handleInputChange}
              className="mt-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-600 focus:ring-indigo-600 sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900">
              Hora de Entrada
            </label>
            <input
              type="text"
              name="entryTime"
              value={formData.entryTime}
              onChange={handleInputChange}
              className="mt-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-600 focus:ring-indigo-600 sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900">
              Km de deslocamento
            </label>
            <input
              type="text"
              name="distance"
              value={formData.distance}
              onChange={handleInputChange}
              className="mt-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-600 focus:ring-indigo-600 sm:text-sm"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-900">
            Endereço
          </label>
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleInputChange}
            className="mt-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-600 focus:ring-indigo-600 sm:text-sm"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-900">
              Cidade
            </label>
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleInputChange}
              className="mt-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-600 focus:ring-indigo-600 sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900">
              Status
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              className="mt-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-600 focus:ring-indigo-600 sm:text-sm"
            >
              <option value="">Selecione</option>
              <option value="Concluído">Concluído</option>
              <option value="Cancelado">Cancelado</option>
              <option value="Em andamento">Em andamento</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900">
              UF
            </label>
            <input
              type="text"
              name="state"
              value={formData.state}
              onChange={handleInputChange}
              className="mt-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-600 focus:ring-indigo-600 sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900">
              Técnicos
            </label>
            <select
              name="technicians"
              value={formData.technicians}
              onChange={handleInputChange}
              className="mt-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-600 focus:ring-indigo-600 sm:text-sm"
            >
              <option value="">Selecione</option>
              <option value="Fulano 1">Fulano 1</option>
              <option value="Fulano 2">Fulano 2</option>
              <option value="Fulano 3">Fulano 3</option>
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
            className="mt-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-600 focus:ring-indigo-600 sm:text-sm"
            placeholder="Digite suas observações aqui"
          />
        </div>
        <div className="flex justify-end">
          <button
            type="submit"
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Salvar
          </button>
        </div>
      </form>
    </Modal>
  );
};


export default EmployeeForm;
