export interface Employee {
  id: string;
  name: string;
  email: string;
  role: string;
  phone: string;
}

export const mockEmployees: Employee[] = [
  {
    id: '1',
    name: 'João Silva',
    email: 'joao@techservice.com.br',
    role: 'Técnico de Manutenção',
    phone: '(11) 98765-4321'
  },
  {
    id: '2',
    name: 'Maria Santos',
    email: 'maria@techservice.com.br',
    role: 'Suporte Técnico',
    phone: '(11) 98765-4322'
  }
];