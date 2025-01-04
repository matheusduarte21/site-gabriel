export interface ServiceCall {
  id: string;
  datetime: string;
  status: 'Agendado' | 'Em Andamento' | 'Concluído' | 'Cancelado';
  client: string;
  ticketNumber: string;
  description: string;
  solution?: string;
  appointmentDate: string;
  HourAppointment: string;
  arrivalTime?: string;
  StartTime?: string;
  exitTime?: string;
  returnVisit?: string
  address: string;
  distance?: string;
  expenses?: string;
  valueCall?: string;
  technicians: string;
  notes?: string;
}


