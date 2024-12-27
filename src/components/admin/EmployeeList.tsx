import React from 'react';
import { UserCircle } from 'lucide-react';
import { Employee } from '../../lib/mockData';

interface EmployeeListProps {
  employees: Employee[];
}

const EmployeeList = ({ employees }: EmployeeListProps) => {
  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <ul className="divide-y divide-gray-200">
        {employees.map((employee) => (
          <li key={employee.id}>
            <div className="px-4 py-4 sm:px-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <UserCircle className="h-10 w-10 text-gray-500" />
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900">{employee.name}</div>
                    <div className="text-sm text-gray-600">{employee.email}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-900">{employee.role}</div>
                  <div className="text-sm text-gray-600">{employee.phone}</div>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default EmployeeList;