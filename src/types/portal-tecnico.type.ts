import { Chamado } from "./chamado.type";

export type ValidacaoAtendimento =
    | "pendente"
    | "aprovado"
    | "reprovado";

export type StatusTecnicoCodigo =
    | "aguardando"
    | "em_deslocamento"
    | "chegou_local"
    | "atendimento_iniciado"
    | "atendimento_finalizado";

export type StatusAdiantamento =
    | "pendente"
    | "aprovado"
    | "reprovado"
    | "pago"
    | "cancelado";

export type ConfirmacaoAdiantamento =
    | "pendente"
    | "confirmado"
    | "divergente";

export interface StatusTecnico {
    id: number;
    codigo: StatusTecnicoCodigo;
    descricao: string;
    ordem: number;
    ativo: boolean;
}

export interface AcompanhamentoTecnico {
    id: string;
    chamado_id: string;
    status_tecnico_id: number;
    validacao: ValidacaoAtendimento;
    observacao_validacao?: string | null;
    validado_em?: string | null;
    status_atualizado_em?: string | null;
    deslocamento_em?: string | null;
    chegada_em?: string | null;
    inicio_em?: string | null;
    finalizacao_em?: string | null;
    criado_em?: string | null;
    atualizado_em?: string | null;
    status_tecnico?: StatusTecnico | null;
}

export interface AdiantamentoTecnico {
    id: string;
    chamado_id: string;
    tecnico_id: string;
    valor: number;
    descricao: string;
    status: StatusAdiantamento;
    confirmacao_tecnico: ConfirmacaoAdiantamento;
    observacao_analise?: string | null;
    observacao_tecnico?: string | null;
    solicitado_em?: string | null;
    analisado_em?: string | null;
    pago_em?: string | null;
    confirmado_tecnico_em?: string | null;
    comprovante_url?: string | null;
    criado_em?: string | null;
    atualizado_em?: string | null;
    chamado?: {
        id: string;
        numero_chamado: string;
        empresa: string;
        data_agendamento?: string | null;
    } | null;
}

export interface TecnicoLogado {
    id: string;
    usuario_id: string;
    nome: string;
    telefone?: string | null;
    endereco?: string | null;
    cpf?: string | null;
    rg?: string | null;
    data_nascimento?: string | null;
    email_contato?: string | null;
    data_criacao?: string | null;
    estado_id?: number | null;
    municipio_id?: number | null;
    estado?: {
        id: number;
        nome: string;
        sigla?: string;
    } | null;
    municipio?: {
        id: number;
        nome: string;
    } | null;
}

export interface ChamadoTecnicoPortal extends Chamado {
    cliente?: {
        id: string;
        nome: string;
    } | null;
    status?: {
        id: number;
        descricao: string;
    } | null;
    tecnico?: TecnicoLogado | null;
    acompanhamento?: AcompanhamentoTecnico | null;
    adiantamentos?: AdiantamentoTecnico[];
}

export interface FiltroChamadosTecnico {
    mes?: string | "todos";
    validacao?: ValidacaoAtendimento | "todos";
    statusTecnico?: StatusTecnicoCodigo | "todos";
    statusOficialId?: string | number | "todos";
}