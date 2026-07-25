export type ValidacaoValorAdiantamento =
    | "pendente"
    | "aprovado"
    | "reprovado";

export type StatusPagamentoAdiantamento =
    | "pendente"
    | "pago"
    | "cancelado";

export type ConfirmacaoRecebimentoAdiantamento =
    | "pendente"
    | "confirmado"
    | "divergencia";

export type StatusCompensacaoAdiantamento =
    | "pendente"
    | "disponivel"
    | "parcial"
    | "compensado";

export type StatusAdiantamentoLegado =
    | "pendente"
    | "aprovado"
    | "reprovado"
    | "pago"
    | "cancelado";

export type ConfirmacaoTecnicoLegado =
    | "pendente"
    | "confirmado"
    | "divergencia";

export type EtapaAdiantamentoAdmin =
    | "aguardando_validacao"
    | "valor_reprovado"
    | "aguardando_pagamento"
    | "aguardando_confirmacao"
    | "divergencia_recebimento"
    | "disponivel_compensacao"
    | "parcialmente_compensado"
    | "compensado"
    | "cancelado";

export interface TecnicoAdiantamentoAdmin {
    id: string;
    usuario_id?: string | null;
    nome: string;
    telefone?: string | null;
    email_contato?: string | null;
    cpf?: string | null;
}

export interface ChamadoAdiantamentoAdmin {
    id: string;
    numero_chamado?: string | null;
    empresa?: string | null;
    data_agendamento?: string | null;
    valor_total_tecnico?: number | string | null;
    status_id?: number | string | null;
    status?: {
        id: number;
        descricao: string;
    } | null;
}

export interface UsuarioAdiantamentoAdmin {
    id: string;
    email: string;
}

export interface AdiantamentoAdminRegistro {
    id: string;
    tecnico_id: string;
    chamado_id?: string | null;
    valor: number | string;
    descricao: string;
    status?: StatusAdiantamentoLegado | null;
    confirmacao_tecnico?: ConfirmacaoTecnicoLegado | null;
    observacao_tecnico?: string | null;
    comprovante_url?: string | null;
    solicitado_em?: string | null;
    aprovado_em?: string | null;
    pago_em?: string | null;
    confirmado_em?: string | null;
    criado_em?: string | null;
    atualizado_em?: string | null;
    validacao_valor_tecnico: ValidacaoValorAdiantamento;
    observacao_validacao?: string | null;
    enviado_validacao_em?: string | null;
    validado_em?: string | null;
    status_pagamento: StatusPagamentoAdiantamento;
    confirmacao_recebimento: ConfirmacaoRecebimentoAdiantamento;
    observacao_recebimento?: string | null;
    recebimento_respondido_em?: string | null;
    status_compensacao: StatusCompensacaoAdiantamento;
    valor_compensado: number | string;
    compensado_em?: string | null;
    criado_por?: string | null;
    pagamento_registrado_por?: string | null;
    cancelado_por?: string | null;
    cancelado_em?: string | null;
    motivo_cancelamento?: string | null;
}

export interface AdiantamentoAdminRespostaBanco
    extends AdiantamentoAdminRegistro {
    tecnico?:
        | TecnicoAdiantamentoAdmin
        | TecnicoAdiantamentoAdmin[]
        | null;
    chamado?:
        | ChamadoAdiantamentoAdmin
        | ChamadoAdiantamentoAdmin[]
        | null;
    criado_por_usuario?:
        | UsuarioAdiantamentoAdmin
        | UsuarioAdiantamentoAdmin[]
        | null;
    pagamento_registrado_por_usuario?:
        | UsuarioAdiantamentoAdmin
        | UsuarioAdiantamentoAdmin[]
        | null;
    cancelado_por_usuario?:
        | UsuarioAdiantamentoAdmin
        | UsuarioAdiantamentoAdmin[]
        | null;
}

export interface AdiantamentoAdmin
    extends AdiantamentoAdminRegistro {
    valor_numero: number;
    valor_compensado_numero: number;
    saldo_compensar: number;
    etapa: EtapaAdiantamentoAdmin;
    tecnico?: TecnicoAdiantamentoAdmin | null;
    chamado?: ChamadoAdiantamentoAdmin | null;
    criado_por_usuario?: UsuarioAdiantamentoAdmin | null;
    pagamento_registrado_por_usuario?: UsuarioAdiantamentoAdmin | null;
    cancelado_por_usuario?: UsuarioAdiantamentoAdmin | null;
}

export interface FiltrosAdiantamentoAdmin {
    busca?: string;
    tecnicoId?: string;
    chamadoId?: string;
    validacao?:
        | ValidacaoValorAdiantamento
        | "todos";
    pagamento?:
        | StatusPagamentoAdiantamento
        | "todos";
    recebimento?:
        | ConfirmacaoRecebimentoAdiantamento
        | "todos";
    compensacao?:
        | StatusCompensacaoAdiantamento
        | "todos";
    dataInicio?: string;
    dataFim?: string;
}

export interface CriarAdiantamentoAdminPayload {
    tecnicoId: string;
    valor: number;
    descricao: string;
    chamadoId?: string | null;
}

export interface EditarAdiantamentoAdminPayload {
    adiantamentoId: string;
    valor: number;
    descricao: string;
    chamadoId?: string | null;
}

export interface RegistrarPagamentoAdiantamentoPayload {
    adiantamentoId: string;
    comprovanteUrl?: string | null;
    pagoEm?: string | null;
}

export interface ReenviarConfirmacaoAdiantamentoPayload {
    adiantamentoId: string;
    comprovanteUrl?: string | null;
}

export interface CancelarAdiantamentoAdminPayload {
    adiantamentoId: string;
    motivo: string;
}

export interface TecnicoOpcaoAdiantamento {
    id: string;
    usuario_id?: string | null;
    nome: string;
    telefone?: string | null;
    email_contato?: string | null;
    cpf?: string | null;
}

export interface ChamadoOpcaoAdiantamento {
    id: string;
    tecnico_id: string;
    numero_chamado?: string | null;
    empresa?: string | null;
    endereco?: string | null;
    data_agendamento?: string | null;
    valor_total_tecnico?: number | string | null;
    status?: {
        id: number;
        descricao: string;
    } | null;
}

export interface ResumoAdiantamentosAdmin {
    quantidade: number;
    valorTotal: number;
    quantidadeAguardandoValidacao: number;
    valorAguardandoValidacao: number;
    quantidadeAguardandoPagamento: number;
    valorAguardandoPagamento: number;
    quantidadeAguardandoConfirmacao: number;
    valorAguardandoConfirmacao: number;
    quantidadeDivergencias: number;
    valorDivergencias: number;
    quantidadeDisponiveisCompensacao: number;
    valorDisponivelCompensacao: number;
    valorCompensado: number;
    quantidadeCompensados: number;
    valorTotalCompensados: number;
}