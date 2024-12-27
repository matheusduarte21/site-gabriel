import React, { useState } from 'react';
import { PlusCircle } from 'lucide-react';
import EmployeeList from './EmployeeList';
import { mockEmployees, Employee } from '../../lib/mockData';
import EmployeeForm from './EmployeeForm';


const AdminDashboard = () => {
  const [showForm, setShowForm] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>(mockEmployees);

  const handleAddEmployee = (newEmployee: Omit<Employee, 'id'>) => {
    const employee = {
      ...newEmployee,
      id: Date.now().toString()
    };
    setEmployees([...employees, employee]);
  };

  return (
    <div className="min-h-screen bg-gray-100 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Painel Administrativo</h1>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center px-4 py-2 bg-blue-800 text-white rounded-md hover:bg-blue-900"
          >
            <PlusCircle className="w-5 h-5 mr-2" />
            Nova Chamada
          </button>
        </div>

        {showForm && (
          <EmployeeForm
            onClose={() => setShowForm(false)}
            // onSuccess={(employee: Omit<Employee, "id">) => {
            //   handleAddEmployee(employee);
            //   setShowForm(false);
            // }}
          />
        )}

        <EmployeeList employees={employees} />
      </div>
    </div>
  );
}

export default AdminDashboard;