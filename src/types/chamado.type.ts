export interface Chamado {
    id?: string;
    tecnico_id: string;
    cliente_id: string;
    status_id: string;
    numero_chamado: string;
    retorno: boolean;
    endereco: string;
    observacoes: string;
    url_arquivo: string;
    data_agendamento: string;
    hora_agendamento: string;
    hora_chegada: string;
    hora_inicio: string;
    hora_fim: string;
    hora_total: string | null;
    hora_extra: string | null;
    empresa: string;
    data_criacao?: string;
    hora_total_str?: string;
    valor_chamado_cliente?: number | string;
    hora_extra_cliente?: number | string;
    deslocamento_cliente?: number | string;
    reembolso_cliente?: number | string;
    valor_total_cliente?: number | string;
    valor_chamado_tecnico?: number | string;
    hora_extra_tecnico?: number | string;
    deslocamento_tecnico?: number | string;
    reembolso_tecnico?: number | string;
    valor_total_tecnico?: number | string;
}

export const emptyChamado: Chamado = {
    tecnico_id: "",
    cliente_id: "",
    status_id: "",
    numero_chamado: "",
    retorno: false,
    endereco: "",
    observacoes: "",
    url_arquivo: "",
    data_agendamento: "",
    hora_agendamento: "",
    hora_chegada: "",
    hora_inicio: "",
    hora_fim: "",
    hora_total: null,
    hora_extra: null,
    empresa: "",
    hora_total_str: "",
    valor_chamado_cliente: "",
    hora_extra_cliente: "",
    deslocamento_cliente: "",
    reembolso_cliente: "",
    valor_total_cliente: "",
    valor_chamado_tecnico: "",
    hora_extra_tecnico: "",
    deslocamento_tecnico: "",
    reembolso_tecnico: "",
    valor_total_tecnico: "",
};