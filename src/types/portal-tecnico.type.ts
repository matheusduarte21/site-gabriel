export type ValidacaoAtendimentoTecnico =
    | "pendente"
    | "aprovado"
    | "reprovado";

export type StatusTecnicoCodigo =
    | "aguardando_inicio"
    | "em_deslocamento"
    | "chegou_local"
    | "atendimento_iniciado"
    | "atendimento_finalizado";

export interface StatusTecnicoPortal {
    id: number;
    codigo: StatusTecnicoCodigo;
    descricao: string;
}

export interface AcompanhamentoTecnicoPortal {
    id?: string;
    chamado_id: string;
    tecnico_id: string;
    status_tecnico_id?: number | null;
    validacao: ValidacaoAtendimentoTecnico;
    observacao_validacao?: string | null;
    validado_em?: string | null;
    criado_em?: string | null;
    atualizado_em?: string | null;
    status_tecnico?: StatusTecnicoPortal | null;
}

export interface ClienteChamadoPortal {
    id: string;
    nome: string;
}

export interface StatusChamadoPortal {
    id: number;
    descricao: string;
}

export interface TecnicoResumoPortal {
    id: string;
    nome: string;
}

export interface ChamadoTecnicoPortal {
    id: string;
    tecnico_id: string;
    cliente_id: string;
    status_id: string | number;
    numero_chamado: string;
    retorno: boolean;
    endereco: string;
    distancia?: string | null;
    observacoes?: string | null;
    url_arquivo?: string | null;
    data_agendamento?: string | null;
    hora_agendamento?: string | null;
    hora_chegada?: string | null;
    hora_inicio?: string | null;
    hora_fim?: string | null;
    hora_total?: string | null;
    hora_extra?: string | null;
    data_criacao?: string | null;
    empresa?: string | null;
    valor_chamado_cliente?: number | string | null;
    hora_extra_cliente?: number | string | null;
    deslocamento_cliente?: number | string | null;
    reembolso_cliente?: number | string | null;
    valor_total_cliente?: number | string | null;
    valor_chamado_tecnico?: number | string | null;
    hora_extra_tecnico?: number | string | null;
    deslocamento_tecnico?: number | string | null;
    reembolso_tecnico?: number | string | null;
    valor_total_tecnico?: number | string | null;
    hora_total_str?: string | null;
    cliente?: ClienteChamadoPortal | null;
    tecnico?: TecnicoResumoPortal | null;
    status?: StatusChamadoPortal | null;
    acompanhamento?: AcompanhamentoTecnicoPortal | null;
}

export interface FiltroChamadosTecnico {
    busca?: string;
    statusId?: string | number;
    status_id?: string | number;
    validacao?: ValidacaoAtendimentoTecnico;
    statusTecnico?: StatusTecnicoCodigo;
    status_tecnico?: StatusTecnicoCodigo;
    dataInicio?: string;
    dataFim?: string;
}

export interface TecnicoLogado {
    id: string;
    usuario_id: string;
    nome: string;
    telefone?: string | null;
    endereco?: string | null;
    cpf?: string | null;
    rg?: string | null;
    email_contato?: string | null;
    data_nascimento?: string | null;
    estado_id?: number | null;
    municipio_id?: number | null;
    criado_em?: string | null;
    municipio?: {
        id?: number;
        nome: string;
    } | null;
    estado?: {
        id?: number;
        sigla: string;
        nome: string;
    } | null;
}

export type StatusAdiantamento =
    | "pendente"
    | "aprovado"
    | "reprovado"
    | "pago"
    | "cancelado";

export type ConfirmacaoAdiantamentoTecnico =
    | "pendente"
    | "confirmado"
    | "divergencia";

export interface AdiantamentoChamado {
    id: string;
    numero_chamado: string;
    empresa?: string | null;
    data_agendamento?: string | null;
}

export interface AdiantamentoTecnico {
    id: string;
    tecnico_id: string;
    chamado_id?: string | null;
    valor: number | string;
    descricao: string;
    status: StatusAdiantamento;
    confirmacao_tecnico: ConfirmacaoAdiantamentoTecnico;
    observacao_tecnico?: string | null;
    comprovante_url?: string | null;
    solicitado_em?: string | null;
    aprovado_em?: string | null;
    pago_em?: string | null;
    confirmado_em?: string | null;
    criado_em?: string | null;
    atualizado_em?: string | null;
    chamado?: AdiantamentoChamado | null;
}