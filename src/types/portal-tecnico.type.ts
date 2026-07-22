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
    confirmacao_tecnico:
        ConfirmacaoAdiantamentoTecnico;
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