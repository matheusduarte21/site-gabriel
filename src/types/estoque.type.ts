export type CondicaoEquipamento =
    | "novo"
    | "recondicionado"
    | "ruim";

export type SituacaoEquipamento =
    | "disponivel"
    | "com_tecnico"
    | "manutencao"
    | "baixado";

export type TipoMovimentacaoEquipamento =
    | "cadastro"
    | "atribuicao"
    | "transferencia"
    | "devolucao"
    | "alteracao_empresa"
    | "entrada_manutencao"
    | "saida_manutencao"
    | "baixa"
    | "ajuste";

export interface TipoEquipamento {
    id: string;
    nome: string;
    descricao?: string | null;
    ativo: boolean;
    criado_em?: string | null;
    atualizado_em?: string | null;
}

export interface ClienteEstoque {
    id: string;
    nome: string;
}

export interface TecnicoEstoque {
    id: string;
    nome: string;
    telefone?: string | null;
    email_contato?: string | null;
}

export interface Equipamento {
    id: string;
    tipo_equipamento_id: string;
    cliente_id: string;
    tecnico_id?: string | null;
    modelo?: string | null;
    numero_serie?: string | null;
    patrimonio?: string | null;
    condicao: CondicaoEquipamento;
    situacao: SituacaoEquipamento;
    observacoes?: string | null;
    criado_por?: string | null;
    atualizado_por?: string | null;
    criado_em?: string | null;
    atualizado_em?: string | null;
    tipo_equipamento?: TipoEquipamento | null;
    cliente?: ClienteEstoque | null;
    tecnico?: TecnicoEstoque | null;
}

export interface EquipamentoMovimentacao {
    id: string;
    equipamento_id: string;
    tipo_movimentacao: TipoMovimentacaoEquipamento;
    cliente_origem_id?: string | null;
    cliente_destino_id?: string | null;
    tecnico_origem_id?: string | null;
    tecnico_destino_id?: string | null;
    condicao_anterior?: CondicaoEquipamento | null;
    condicao_nova?: CondicaoEquipamento | null;
    situacao_anterior?: SituacaoEquipamento | null;
    situacao_nova?: SituacaoEquipamento | null;
    chamado_id?: string | null;
    motivo?: string | null;
    observacoes?: string | null;
    dados_anteriores?: Record<
        string,
        unknown
    > | null;
    dados_novos?: Record<
        string,
        unknown
    > | null;
    movimentado_por?: string | null;
    criado_em: string;
    equipamento?: Equipamento | null;
    cliente_origem?: ClienteEstoque | null;
    cliente_destino?: ClienteEstoque | null;
    tecnico_origem?: TecnicoEstoque | null;
    tecnico_destino?: TecnicoEstoque | null;
}

export interface DashboardEstoque {
    total: number;
    novo: number;
    recondicionado: number;
    ruim: number;
    disponivel: number;
    com_tecnico: number;
    manutencao: number;
    baixado: number;
    por_empresa: {
        id: string;
        nome: string;
        quantidade: number;
    }[];
    por_tecnico: {
        id: string | null;
        nome: string;
        quantidade: number;
    }[];
}

export interface FiltrosEquipamento {
    busca?: string;
    clienteId?: string;
    tecnicoId?: string;
    tipoId?: string;
    condicao?:
        | CondicaoEquipamento
        | "todos";
    situacao?:
        | SituacaoEquipamento
        | "todos";
    pagina?: number;
    porPagina?: number;
}

export interface FiltrosMeuEstoqueTecnico {
    busca?: string;
    tipoId?: string;
    clienteId?: string;
    condicao?:
        | CondicaoEquipamento
        | "todos";
    pagina?: number;
    porPagina?: number;
}

export interface ResumoMeuEstoqueTecnico {
    total: number;
    novos: number;
    recondicionados: number;
    ruins: number;
}

export interface OpcaoFiltroEstoque {
    id: string;
    nome: string;
}

export interface ResultadoPaginado<T> {
    dados: T[];
    total: number;
    pagina: number;
    porPagina: number;
    totalPaginas: number;
}

export interface CriarEquipamentoPayload {
    tipoEquipamentoId: string;
    clienteId: string;
    tecnicoId?: string | null;
    modelo?: string | null;
    numeroSerie?: string | null;
    patrimonio?: string | null;
    condicao: CondicaoEquipamento;
    observacoes?: string | null;
}

export interface EditarEquipamentoPayload {
    equipamentoId: string;
    tipoEquipamentoId: string;
    modelo?: string | null;
    numeroSerie?: string | null;
    patrimonio?: string | null;
    condicao: CondicaoEquipamento;
    observacoes?: string | null;
}

export interface MovimentarEquipamentoPayload {
    equipamentoId: string;
    clienteDestinoId: string;
    tecnicoDestinoId?: string | null;
    motivo?: string | null;
    observacoes?: string | null;
}

export interface DevolverEquipamentoPayload {
    equipamentoId: string;
    motivo?: string | null;
    observacoes?: string | null;
}

export interface ManutencaoEquipamentoPayload {
    equipamentoId: string;
    motivo: string;
    observacoes?: string | null;
}

export interface RetornarManutencaoPayload {
    equipamentoId: string;
    clienteDestinoId: string;
    tecnicoDestinoId?: string | null;
    condicao: CondicaoEquipamento;
    observacoes?: string | null;
}

export interface BaixarEquipamentoPayload {
    equipamentoId: string;
    motivo: string;
    observacoes?: string | null;
}