import supabase from "../../../lib/supabase";
import { CondicaoEquipamento, Equipamento, ResultadoPaginado } from "../../../types/estoque.type";

interface FiltrosMeuEstoque {
    busca?: string;
    tipoId?: string;
    clienteId?: string;
    condicao?:
        | CondicaoEquipamento
        | "todos";
    pagina?: number;
    porPagina?: number;
}

const EQUIPAMENTO_SELECT = `
    id,
    tipo_equipamento_id,
    cliente_id,
    tecnico_id,
    modelo,
    numero_serie,
    patrimonio,
    condicao,
    situacao,
    observacoes,
    criado_em,
    atualizado_em,
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

const obterRelacaoUnica = <T>(
    valor:
        | T
        | T[]
        | null
        | undefined
): T | null => {
    if (Array.isArray(valor)) {
        return valor[0] ?? null;
    }

    return valor ?? null;
};

const normalizarEquipamento = (
    registro: Record<string, unknown>
): Equipamento => {
    return {
        ...(registro as unknown as Equipamento),
        tipo_equipamento:
            obterRelacaoUnica(
                registro.tipo_equipamento as
                    | Equipamento["tipo_equipamento"]
                    | Equipamento["tipo_equipamento"][]
                    | null
            ),
        cliente: obterRelacaoUnica(
            registro.cliente as
                | Equipamento["cliente"]
                | Equipamento["cliente"][]
                | null
        ),
        tecnico: obterRelacaoUnica(
            registro.tecnico as
                | Equipamento["tecnico"]
                | Equipamento["tecnico"][]
                | null
        ),
    };
};

export async function getMeuEstoqueTecnico(
    filtros: FiltrosMeuEstoque = {}
): Promise<
    ResultadoPaginado<Equipamento>
> {
    const pagina = Math.max(
        1,
        filtros.pagina || 1
    );

    const porPagina = Math.max(
        1,
        filtros.porPagina || 6
    );

    const inicio =
        (pagina - 1) * porPagina;

    const fim =
        inicio + porPagina - 1;

    let query = supabase
        .from("equipamento")
        .select(EQUIPAMENTO_SELECT, {
            count: "exact",
        })
        .neq("situacao", "baixado");

    if (filtros.tipoId) {
        query = query.eq(
            "tipo_equipamento_id",
            filtros.tipoId
        );
    }

    if (filtros.clienteId) {
        query = query.eq(
            "cliente_id",
            filtros.clienteId
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

    const busca = filtros.busca
        ?.trim()
        .replace(",", " ");

    if (busca) {
        query = query.or(
            `patrimonio.ilike.%${busca}%,numero_serie.ilike.%${busca}%,modelo.ilike.%${busca}%`
        );
    }

    const {
        data,
        error,
        count,
    } = await query
        .order("atualizado_em", {
            ascending: false,
        })
        .range(inicio, fim);

    if (error) {
        console.error(
            "Erro ao buscar estoque do técnico:",
            error.message
        );

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
            Math.ceil(
                total / porPagina
            )
        ),
    };
}

export async function getResumoMeuEstoqueTecnico() {
    const { data, error } =
        await supabase
            .from("equipamento")
            .select(
                "id, condicao, situacao"
            )
            .neq(
                "situacao",
                "baixado"
            );

    if (error) {
        console.error(
            "Erro ao buscar resumo do estoque:",
            error.message
        );

        throw new Error(error.message);
    }

    const equipamentos = data || [];

    return {
        total: equipamentos.length,
        novos: equipamentos.filter(
            (item) =>
                item.condicao === "novo"
        ).length,
        recondicionados:
            equipamentos.filter(
                (item) =>
                    item.condicao ===
                    "recondicionado"
            ).length,
        ruins: equipamentos.filter(
            (item) =>
                item.condicao === "ruim"
        ).length,
    };
}