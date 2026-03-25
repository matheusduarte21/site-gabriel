export interface Chamado {
    id?: string;
    tecnico_id: string;
    cliente_id: string;
    status_id: string;
    numero_chamado: string;
    retorno: boolean;
    endereco: string;
    descricao: string;
    observacoes: string;
    url_arquivo: string;
    data_agendamento: string;
    hora_agendamento: string;
    hora_chegada: string;
    hora_inicio: string;
    hora_fim: string;
    hora_total: string;
    hora_extra: string;
    despesas: string;
    valor_chamado: number | string;
    valor_total: number | string;
    data_criacao?: string;
    valor_faturado: number | string;
    valor_pago: number | string;
    valor_ganho: number | string;
    empresa: string;
}

export const emptyChamado: Chamado = {
    tecnico_id: "",
    cliente_id: "",
    status_id: "",
    numero_chamado: "",
    retorno: false,
    endereco: "",
    descricao: "",
    observacoes: "",
    url_arquivo: "",
    data_agendamento: "",
    hora_agendamento: "",
    hora_chegada: "",
    hora_inicio: "",
    hora_fim: "",
    hora_total: "",
    hora_extra: "",
    despesas: "",
    valor_chamado: "",
    valor_total: "",
    valor_faturado: "",
    valor_pago: "",
    valor_ganho: "",
    empresa: "",
};
