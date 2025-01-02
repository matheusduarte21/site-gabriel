export interface ServiceCall {
  clientName: string;
  callNumber: string;
  id: string;
  datetime: string;
  status: 'Pendente' | 'Em Andamento' | 'Concluído' | 'Cancelado';
  client: string;
  ticketNumber: string;
  analyst: string;
  description: string;
  solution?: string;
  appointmentDate: string;
  HourAppointment: string;
  arrivalTime?: string;
  StartTime?: string;
  exitTime?: string;
  returnVisit: 'Sim' | 'Não';
  address: string;
  distance?: string;
  expenses?: string;
  valueCall?: string;
  technicians: string;
  notes?: string;
}

export const mockServiceCalls: ServiceCall[] = [
  {
    clientName: "Empresa ABC Ltda",
    callNumber: "TK-2024-001",
    id: "1",
    datetime: "2024-03-15T09:30:00",
    status: "Em Andamento",
    client: "Empresa ABC Ltda",
    ticketNumber: "TK-2024-001",
    analyst: "JOÃO SILVA DUARTE",
    description: "Cliente relatou que o computador não liga após queda de energia.",
    solution: "Foi realizado o teste de energia, e a fonte foi substituída.",
    appointmentDate: "2024-03-15",
    HourAppointment: "09:30",
    arrivalTime: "09:45",
    StartTime: "10:00",
    exitTime: "12:00",
    returnVisit: "Não",
    address: "Rua das Flores, 123, Centro",
    distance: "10 km",
    expenses: "R$ 50,00",
    valueCall: "R$ 200,00",
    technicians: "JOÃO SILVA",
    notes: "Cliente relatou que o computador não liga após queda de energia."
  },
  {
    clientName: "Empresa ABC Ltda",
    callNumber: "TK-2024-001",
    id: "1",
    datetime: "2024-03-15T09:30:00",
    status: "Em Andamento",
    client: "Empresa ABC Ltda",
    ticketNumber: "TK-2024-001",
    analyst: "JOÃO SILVA DUARTE",
    description: "Cliente relatou que o computador não liga após queda de energia.",
    solution: "Foi realizado o teste de energia, e a fonte foi substituída.",
    appointmentDate: "2024-03-15",
    HourAppointment: "09:30",
    arrivalTime: "09:45",
    StartTime: "10:00",
    exitTime: "12:00",
    returnVisit: "Não",
    address: "Rua das Flores, 123, Centro",
    distance: "10 km",
    expenses: "R$ 50,00",
    valueCall: "R$ 200,00",
    technicians: "JOÃO SILVA",
    notes: "Cliente relatou que o computador não liga após queda de energia."
  },
  {
    clientName: "Empresa ABC Ltda",
    callNumber: "TK-2024-001",
    id: "1",
    datetime: "2024-03-15T09:30:00",
    status: "Em Andamento",
    client: "Empresa ABC Ltda",
    ticketNumber: "TK-2024-001",
    analyst: "JOÃO SILVA DUARTE",
    description: "Cliente relatou que o computador não liga após queda de energia.",
    solution: "Foi realizado o teste de energia, e a fonte foi substituída.",
    appointmentDate: "2024-03-15",
    HourAppointment: "09:30",
    arrivalTime: "09:45",
    StartTime: "10:00",
    exitTime: "12:00",
    returnVisit: "Não",
    address: "Rua das Flores, 123, Centro",
    distance: "10 km",
    expenses: "R$ 50,00",
    valueCall: "R$ 200,00",
    technicians: "JOÃO SILVA",
    notes: "Cliente relatou que o computador não liga após queda de energia."
  },
  {
    clientName: "Empresa ABC Ltda",
    callNumber: "TK-2024-001",
    id: "1",
    datetime: "2024-03-15T09:30:00",
    status: "Em Andamento",
    client: "Empresa ABC Ltda",
    ticketNumber: "TK-2024-001",
    analyst: "JOÃO SILVA DUARTE",
    description: "Cliente relatou que o computador não liga após queda de energia.",
    solution: "Foi realizado o teste de energia, e a fonte foi substituída.",
    appointmentDate: "2024-03-15",
    HourAppointment: "09:30",
    arrivalTime: "09:45",
    StartTime: "10:00",
    exitTime: "12:00",
    returnVisit: "Não",
    address: "Rua das Flores, 123, Centro",
    distance: "10 km",
    expenses: "R$ 50,00",
    valueCall: "R$ 200,00",
    technicians: "JOÃO SILVA",
    notes: "Cliente relatou que o computador não liga após queda de energia."
  },
  {
    clientName: "Consultoria XYZ",
    callNumber: "TK-2024-002",
    id: "2",
    datetime: "2024-03-15T10:15:00",
    status: "Pendente",
    client: "Consultoria XYZ",
    ticketNumber: "TK-2024-002",
    analyst: "MARIA SANTOS",
    description: "Instalação de novo software de gestão para o cliente.",
    solution: "Software de gestão instalado com sucesso.",
    appointmentDate: "2024-03-15",
    HourAppointment: "10:15",
    arrivalTime: "10:30",
    StartTime: "10:45",
    exitTime: "13:00",
    returnVisit: "Sim",
    address: "Avenida Paulista, 456, Bela Vista",
    distance: "15 km",
    expenses: "R$ 80,00",
    valueCall: "R$ 300,00",
    technicians: "MARIA SANTOS",
    notes: "Instalação de novo software de gestão para o cliente."
  },
  {
    clientName: "Indústria Beta",
    callNumber: "TK-2024-003",
    id: "3",
    datetime: "2024-03-15T11:00:00",
    status: "Concluído",
    client: "Indústria Beta",
    ticketNumber: "TK-2024-003",
    analyst: "PEDRO COSTA",
    description: "Configuração de rede para o novo departamento da indústria.",
    solution: "Rede configurada com sucesso e switch instalado.",
    appointmentDate: "2024-03-15",
    HourAppointment: "11:00",
    arrivalTime: "11:15",
    StartTime: "11:30",
    exitTime: "14:00",
    returnVisit: "Não",
    address: "Rua Industrial, 789, Distrito Industrial",
    distance: "20 km",
    expenses: "R$ 120,00",
    valueCall: "R$ 500,00",
    technicians: "PEDRO COSTA",
    notes: "Configuração de rede para o novo departamento da indústria, com switch instalado e conectividade testada."
  }
];

