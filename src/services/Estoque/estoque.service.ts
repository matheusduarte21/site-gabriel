import supabase from "../../lib/supabase";
import {
    ClienteEstoque,
    CondicaoEquipamento,
    DashboardEstoque,
    Equipamento,
    EquipamentoMovimentacao,
    ResultadoPaginado,
    SituacaoEquipamento,
    TecnicoEstoque,
    TipoEquipamento,
} from "../../types/estoque.type";

const EQUIPAMENTO_SELECT = `
    *,
    tipo_equipamento:tipo_equipamento!equipamento_tipo_fk (
        id,
        nome,
        descricao,
        ativo
    ),
    cliente:cliente!equipamento_cliente_fk (
        id,
        nome
    ),
    tecnico:tecnico!equipamento_tecnico_fk (
        id,
        nome,
        telefone,
        email_contato
    )
`;

const relacaoUnica = <T>(
    valor: T | T[] | null | undefined
): T | null => {
    if (Array.isArray(valor)) {
        return valor[0] ?? null;
    }

    return valor ?? null;
};

const normalizarEquipamento = (
    registro: Record<string, unknown>
): Equipamento => ({
    ...(registro as unknown as Equipamento),
    tipo_equipamento: relacaoUnica(
        registro.tipo_equipamento as
            | TipoEquipamento
            | TipoEquipamento[]
            | null
    ),
    cliente: relacaoUnica(
        registro.cliente as
            | ClienteEstoque
            | ClienteEstoque[]
            | null
    ),
    tecnico: relacaoUnica(
        registro.tecnico as
            | TecnicoEstoque
            | TecnicoEstoque[]
            | null
    ),
});

export async function getTiposEquipamento(
    incluirInativos = false
): Promise<TipoEquipamento[]> {
    let query = supabase
        .from("tipo_equipamento")
        .select("*")
        .order("nome");

    if (!incluirInativos) {
        query = query.eq("ativo", true);
    }

    const { data, error } = await query;

    if (error) {
        throw new Error(error.message);
    }

    return (data || []) as TipoEquipamento[];
}

export async function criarTipoEquipamento(
    nome: string,
    descricao?: string
): Promise<void> {
    const { error } = await supabase.rpc(
        "estoque_cadastrar_tipo_admin",
        {
            p_nome: nome.trim(),
            p_descricao:
                descricao?.trim() || null,
        }
    );

    if (error) {
        throw new Error(error.message);
    }
}

export async function editarTipoEquipamento(
    id: string,
    nome: string,
    descricao?: string
): Promise<void> {
    const { error } = await supabase.rpc(
        "estoque_editar_tipo_admin",
        {
            p_id: id,
            p_nome: nome.trim(),
            p_descricao:
                descricao?.trim() || null,
        }
    );

    if (error) {
        throw new Error(error.message);
    }
}

export async function alterarStatusTipoEquipamento(
    id: string,
    ativo: boolean
): Promise<void> {
    const { error } = await supabase.rpc(
        "estoque_alterar_status_tipo_admin",
        {
            p_id: id,
            p_ativo: ativo,
        }
    );

    if (error) {
        throw new Error(error.message);
    }
}

export async function getClientesEstoque(): Promise<
    ClienteEstoque[]
> {
    const { data, error } = await supabase
        .from("cliente")
        .select("id, nome")
        .order("nome");

    if (error) {
        throw new Error(error.message);
    }

    return (data || []) as ClienteEstoque[];
}

export async function getTecnicosEstoque(): Promise<
    TecnicoEstoque[]
> {
    const { data, error } = await supabase
        .from("tecnico")
        .select(
            "id, nome, telefone, email_contato"
        )
        .order("nome");

    if (error) {
        throw new Error(error.message);
    }

    return (data || []) as TecnicoEstoque[];
}

export async function getDashboardEstoque(): Promise<DashboardEstoque> {
    const { data, error } = await supabase.rpc(
        "estoque_dashboard_admin"
    );

    if (error) {
        throw new Error(error.message);
    }

    return data as DashboardEstoque;
}

export async function getEquipamentos(
    filtros: {
        busca?: string;
        clienteId?: string;
        tecnicoId?: string;
        tipoId?: string;
        condicao?: CondicaoEquipamento | "todos";
        situacao?: SituacaoEquipamento | "todos";
        pagina?: number;
        porPagina?: number;
    } = {}
): Promise<ResultadoPaginado<Equipamento>> {
    const pagina = Math.max(
        1,
        filtros.pagina || 1
    );

    const porPagina = Math.max(
        1,
        filtros.porPagina || 9
    );

    const inicio =
        (pagina - 1) * porPagina;

    let query = supabase
        .from("equipamento")
        .select(EQUIPAMENTO_SELECT, {
            count: "exact",
        });

    if (filtros.clienteId) {
        query = query.eq(
            "cliente_id",
            filtros.clienteId
        );
    }

    if (filtros.tecnicoId) {
        query = query.eq(
            "tecnico_id",
            filtros.tecnicoId
        );
    }

    if (filtros.tipoId) {
        query = query.eq(
            "tipo_equipamento_id",
            filtros.tipoId
        );
    }

    if (
        filtros.condicao &&
        filtros.condicao !== "todos"
    ) {
        query = query.eq(
            "condicao",
            filtros.condicao
        );
    }

    if (
        filtros.situacao &&
        filtros.situacao !== "todos"
    ) {
        query = query.eq(
            "situacao",
            filtros.situacao
        );
    }

    if (filtros.busca?.trim()) {
        const busca = filtros.busca
            .trim()
            .replaceAll(",", " ");

        query = query.or(
            `patrimonio.ilike.%${busca}%,numero_serie.ilike.%${busca}%,modelo.ilike.%${busca}%`
        );
    }

    const { data, error, count } =
        await query
            .order("criado_em", {
                ascending: false,
            })
            .range(
                inicio,
                inicio + porPagina - 1
            );

    if (error) {
        throw new Error(error.message);
    }

    const total = count || 0;

    return {
        dados: (data || []).map(
            (registro) =>
                normalizarEquipamento(
                    registro as unknown as Record<
                        string,
                        unknown
                    >
                )
        ),
        total,
        pagina,
        porPagina,
        totalPaginas: Math.max(
            1,
            Math.ceil(total / porPagina)
        ),
    };
}

export async function criarEquipamento(
    payload: {
        tipoEquipamentoId: string;
        clienteId: string;
        tecnicoId?: string | null;
        modelo?: string | null;
        numeroSerie?: string | null;
        patrimonio?: string | null;
        condicao: CondicaoEquipamento;
        observacoes?: string | null;
    }
): Promise<void> {
    const { error } = await supabase.rpc(
        "estoque_cadastrar_equipamento_admin",
        {
            p_tipo_equipamento_id:
                payload.tipoEquipamentoId,
            p_cliente_id:
                payload.clienteId,
            p_tecnico_id:
                payload.tecnicoId || null,
            p_modelo:
                payload.modelo || null,
            p_numero_serie:
                payload.numeroSerie || null,
            p_patrimonio:
                payload.patrimonio || null,
            p_condicao:
                payload.condicao,
            p_observacoes:
                payload.observacoes || null,
        }
    );

    if (error) {
        throw new Error(error.message);
    }
}

export async function editarEquipamento(
    payload: {
        equipamentoId: string;
        tipoEquipamentoId: string;
        modelo?: string | null;
        numeroSerie?: string | null;
        patrimonio?: string | null;
        condicao: CondicaoEquipamento;
        observacoes?: string | null;
    }
): Promise<void> {
    const { error } = await supabase.rpc(
        "estoque_editar_equipamento_admin",
        {
            p_equipamento_id:
                payload.equipamentoId,
            p_tipo_equipamento_id:
                payload.tipoEquipamentoId,
            p_modelo:
                payload.modelo || null,
            p_numero_serie:
                payload.numeroSerie || null,
            p_patrimonio:
                payload.patrimonio || null,
            p_condicao:
                payload.condicao,
            p_observacoes:
                payload.observacoes || null,
        }
    );

    if (error) {
        throw new Error(error.message);
    }
}

export async function movimentarEquipamento(
    payload: {
        equipamentoId: string;
        clienteDestinoId: string;
        tecnicoDestinoId?: string | null;
        motivo?: string | null;
        observacoes?: string | null;
    }
): Promise<void> {
    const { error } = await supabase.rpc(
        "estoque_movimentar_equipamento_admin",
        {
            p_equipamento_id:
                payload.equipamentoId,
            p_cliente_destino_id:
                payload.clienteDestinoId,
            p_tecnico_destino_id:
                payload.tecnicoDestinoId ||
                null,
            p_motivo:
                payload.motivo || null,
            p_observacoes:
                payload.observacoes || null,
        }
    );

    if (error) {
        throw new Error(error.message);
    }
}

export async function devolverEquipamento(
    equipamentoId: string
): Promise<void> {
    const { error } = await supabase.rpc(
        "estoque_devolver_equipamento_admin",
        {
            p_equipamento_id:
                equipamentoId,
            p_motivo:
                "Devolução registrada pelo administrador",
            p_observacoes: null,
        }
    );

    if (error) {
        throw new Error(error.message);
    }
}

export async function getDevolucoes(
    pagina = 1,
    porPagina = 10
): Promise<
    ResultadoPaginado<EquipamentoMovimentacao>
> {
    const inicio =
        (pagina - 1) * porPagina;

    const { data, error, count } =
        await supabase
            .from(
                "equipamento_movimentacao"
            )
            .select(
                `
                *,
                equipamento:equipamento!equipamento_movimentacao_equipamento_fk (
                    *,
                    tipo_equipamento:tipo_equipamento!equipamento_tipo_fk (
                        id,
                        nome
                    ),
                    cliente:cliente!equipamento_cliente_fk (
                        id,
                        nome
                    ),
                    tecnico:tecnico!equipamento_tecnico_fk (
                        id,
                        nome
                    )
                ),
                cliente_origem:cliente!equipamento_movimentacao_cliente_origem_fk (
                    id,
                    nome
                ),
                tecnico_origem:tecnico!equipamento_movimentacao_tecnico_origem_fk (
                    id,
                    nome
                )
            `,
                {
                    count: "exact",
                }
            )
            .eq(
                "tipo_movimentacao",
                "devolucao"
            )
            .order("criado_em", {
                ascending: false,
            })
            .range(
                inicio,
                inicio + porPagina - 1
            );

    if (error) {
        throw new Error(error.message);
    }

    const total = count || 0;

    return {
        dados:
            (data ||
                []) as unknown as EquipamentoMovimentacao[],
        total,
        pagina,
        porPagina,
        totalPaginas: Math.max(
            1,
            Math.ceil(total / porPagina)
        ),
    };
}
