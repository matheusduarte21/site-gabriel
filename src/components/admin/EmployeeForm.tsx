import React, { useState } from "react";
import Modal from "react-modal";
import { X } from "lucide-react";
import { ListClientes } from "../../helpers/ListClients";
import supabase from "../../lib/supabase";
import { InsertImageRat } from "../../lib/api/service-calls";
Modal.setAppElement("#root");

interface EmployeeFormProps {
  onClose: () => void;
}

const EmployeeForm = ({ onClose }: EmployeeFormProps) => {
  const [formData, setFormData] = useState({
    client: "",
    ticketNumber: "",
    returnVisit: "",
    exitTime: "",
    distance: "",
    address: "",
    status: "",
    technicians: "",
    notes: "",
    appointmentDate: "",
    HourAppointment: "",
    StartTime: "",
    arrivalTime: "",
    valueCall:"",
    expenses: "",
    solution: "",
    description: "",
    image: null as File | null
  });

  

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleInputFile = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, type, files } = e.target;
  
  
    if (type === "file" && files) {
      const file = files[0]; 
      setFormData((prev) => ({ ...prev, image: file })); 
    } else {
      const value = e.target.value;
      setFormData((prev) => ({ ...prev, [name]: value })); 
    }
  };

  const updateImage = async () =>{
    let filePath = null;
      
    if (formData.image) {
        const imageUploadResponse = await InsertImageRat(formData.image);
        filePath = imageUploadResponse?.path;
    }
    else{
      console.log('erro na inserção')
    }


    return filePath;
  }

  const handleSubmit =  async (e: React.FormEvent) => {
    e.preventDefault();

    const filePath = await updateImage();

    const { data, error } = await supabase
        .from('service_call')
        .insert([{
            status: formData.status,
            client: formData.client.trim(),
            ticket_number: formData.ticketNumber.trim(),
            description: formData.description.trim(),
            solution: formData.solution?.trim() || null,
            appointment_date: formData.appointmentDate,
            hour_appointment: formData.HourAppointment,
            arrival_time: formData.arrivalTime || null,
            start_time: formData.StartTime || null,
            exit_time: formData.exitTime || null,
            return_visit: formData.returnVisit || null,
            address: formData.address.trim(),
            distance: formData.distance || null,
            expenses: formData.expenses ? parseFloat(formData.expenses) : null,
            value_call: formData.valueCall ? parseFloat(formData.valueCall) : null,
            technicians: formData.technicians.trim(),
            notes: formData.notes || null,
            file_url: filePath,
        }]);

    if (error) {
      console.error(error);
      
    }else{
      console.log(data);
    }

    onClose();
  };



  return (
    <Modal
      isOpen={true}
      onRequestClose={onClose}
      overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
      className="bg-white rounded-lg shadow-lg w-full max-w-4xl p-5 overflow-y-scroll sm:overflow-y-scroll h-screen"
    >
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Novo Registro</h2>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-900">
          <X size={20} />
        </button>
      </div>
      <form onSubmit={handleSubmit} className="grid gap-6">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-900">Cliente</label>
            <select
              name="client"
              required
              value={formData.client}
              onChange={handleInputChange}
              className="mt-2 border-2 block w-full rounded-md min-w-0 py-1.5 pl-1 pr-3 text-base text-gray-900 border-gray-300 shadow-sm focus:border-indigo-600 focus:ring-indigo-600 sm:text-sm"
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
            <label className="block text-sm font-medium text-gray-900">Número do chamado</label>
            <input
              type="text"
              name="ticketNumber"
              value={formData.ticketNumber}
              onChange={handleInputChange}
              className="mt-2 border-2 block w-full rounded-md py-1.5 pl-1 pr-3 text-base text-gray-900 border-gray-300 shadow-sm focus:border-indigo-600 focus:ring-indigo-600 sm:text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900">Data agendada</label>
            <input
              type="date"
              required
              name="appointmentDate"
              value={formData.appointmentDate}
              onChange={handleInputChange}
              className="mt-2 border-2 block w-full rounded-md py-1.5 pl-1 pr-3 text-base text-gray-900 border-gray-300 shadow-sm focus:border-indigo-600 focus:ring-indigo-600 sm:text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900">Hora agendada</label>
            <input
              required
              type="time"
              name="HourAppointment"
              value={formData.HourAppointment}
              onChange={handleInputChange}
              className="mt-2 border-2 block w-full rounded-md py-1.5 pl-1 pr-3 text-base text-gray-900 border-gray-300 shadow-sm focus:border-indigo-600 focus:ring-indigo-600 sm:text-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-900">Chegada no local</label>
            <input
              type="time"
              name="arrivalTime"
              value={formData.arrivalTime}
              onChange={handleInputChange}
              className="mt-2 border-2 block w-full rounded-md py-1.5 pl-1 pr-3 text-base text-gray-900 border-gray-300 shadow-sm focus:border-indigo-600 focus:ring-indigo-600 sm:text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900">Início de atendimento</label>
            <input
              type="time"
              name="StartTime"
              value={formData.StartTime}
              onChange={handleInputChange}
              className="mt-2 border-2 block w-full rounded-md py-1.5 pl-1 pr-3 text-base text-gray-900 border-gray-300 shadow-sm focus:border-indigo-600 focus:ring-indigo-600 sm:text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900">Fim de atendimento</label>
            <input
              type="time"
              name="exitTime"
              value={formData.exitTime}
              onChange={handleInputChange}
              className="mt-2 border-2 block w-full rounded-md py-1.5 pl-1 pr-3 text-base text-gray-900 border-gray-300 shadow-sm focus:border-indigo-600 focus:ring-indigo-600 sm:text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900">Retorno</label>
            <select
              name="returnVisit"
              value={formData.returnVisit}
              onChange={handleInputChange}
              className="mt-2 border-2 block w-full rounded-md py-1.5 pl-1 pr-3 text-base text-gray-900 border-gray-300 shadow-sm focus:border-indigo-600 focus:ring-indigo-600 sm:text-sm"
            >
              <option value="">Selecione</option>
              <option value="Sim">Sim</option>
              <option value="Não">Não</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-900">Endereço (rua, n°, bairro)</label>
            <input
              required
              type="text"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              className="mt-2 border-2 block w-full rounded-md py-1.5 pl-1 pr-3 text-base text-gray-900 border-gray-300 shadow-sm focus:border-indigo-600 focus:ring-indigo-600 sm:text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900">Deslocamento</label>
            <input
              type="text"
              name="distance"
              value={formData.distance}
              onChange={handleInputChange}
              className="mt-2 border-2 block w-full rounded-md py-1.5 pl-1 pr-3 text-base text-gray-900 border-gray-300 shadow-sm focus:border-indigo-600 focus:ring-indigo-600 sm:text-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-900">Despesas</label>
            <input
              type="text"
              name="expenses"
              value={formData.expenses}
              onChange={handleInputChange}
              className="mt-2 border-2 block w-full rounded-md py-1.5 pl-1 pr-3 text-base text-gray-900 border-gray-300 shadow-sm focus:border-indigo-600 focus:ring-indigo-600 sm:text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900">Valor do chamado</label>
            <input
              type="text"
              name="valueCall"
              value={formData.valueCall}
              onChange={handleInputChange}
              className="mt-2 border-2 block w-full rounded-md py-1.5 pl-1 pr-3 text-base text-gray-900 border-gray-300 shadow-sm focus:border-indigo-600 focus:ring-indigo-600 sm:text-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-900">Status</label>
            <select
              name="status"
              required
              value={formData.status}
              onChange={handleInputChange}
              className="mt-2 border-2 block w-full rounded-md py-1.5 pl-1 pr-3 text-base text-gray-900 border-gray-300 shadow-sm focus:border-indigo-600 focus:ring-indigo-600 sm:text-sm"
            >
              <option value="">Selecione</option>
              <option value="Concluído">Concluído</option>
              <option value="Agendado">Agendado</option>
              <option value="Em Andamento">Em Andamento</option>
              <option value="Cancelado">Cancelado</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900">Técnicos</label>
            <select
              name="technicians"
              value={formData.technicians}
              required
              onChange={handleInputChange}
              className="mt-2 border-2 block w-full rounded-md py-1.5 pl-1 pr-3 text-base text-gray-900 border-gray-300 shadow-sm focus:border-indigo-600 focus:ring-indigo-600 sm:text-sm"
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

        <div>
          <label className="block text-sm font-medium text-gray-900">Observações</label>
          <textarea
            name="notes"
            rows={4}
            value={formData.notes}
            onChange={handleInputChange}
            className="mt-2 border-2 block w-full rounded-md py-1.5 pl-1 pr-3 text-base text-gray-900 border-gray-300 shadow-sm focus:border-indigo-600 focus:ring-indigo-600 sm:text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-900">Anexar RAT</label>
          <input
            id="file"
            type="file"
            accept=".png,.jpg,.jpeg,.pdf"
            onChange={handleInputFile}
            className="mt-2 border-2 block w-full rounded-md py-1.5 pl-1 pr-3 text-base text-gray-900 border-gray-300 shadow-sm focus:border-indigo-600 focus:ring-indigo-600 sm:text-sm"
           />
        </div>

        <div className="mt-6">
          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50"
          >
            Adicionar
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default EmployeeForm;
