import supabase from "../../../lib/supabase";
import { EquipamentoMovimentacao } from "../../../types/estoque.type";

const MOVIMENTACAO_SELECT = `
    id,
    equipamento_id,
    tipo_movimentacao,
    cliente_origem_id,
    cliente_destino_id,
    tecnico_origem_id,
    tecnico_destino_id,
    condicao_anterior,
    condicao_nova,
    situacao_anterior,
    situacao_nova,
    motivo,
    observacoes,
    criado_em,
    cliente_origem:cliente!equipamento_movimentacao_cliente_origem_fk (
        id,
        nome
    ),
    cliente_destino:cliente!equipamento_movimentacao_cliente_destino_fk (
        id,
        nome
    ),
    tecnico_origem:tecnico!equipamento_movimentacao_tecnico_origem_fk (
        id,
        nome
    ),
    tecnico_destino:tecnico!equipamento_movimentacao_tecnico_destino_fk (
        id,
        nome
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

export async function getHistoricoEquipamentoTecnico(
    equipamentoId: string
): Promise<
    EquipamentoMovimentacao[]
> {
    const { data, error } =
        await supabase
            .from(
                "equipamento_movimentacao"
            )
            .select(
                MOVIMENTACAO_SELECT
            )
            .eq(
                "equipamento_id",
                equipamentoId
            )
            .order("criado_em", {
                ascending: false,
            });

    if (error) {
        console.error(
            "Erro ao buscar histórico:",
            error.message
        );

        throw new Error(error.message);
    }

    return (data || []).map(
        (registro) => ({
            ...(registro as unknown as EquipamentoMovimentacao),
            cliente_origem:
                obterRelacaoUnica(
                    registro.cliente_origem
                ),
            cliente_destino:
                obterRelacaoUnica(
                    registro.cliente_destino
                ),
            tecnico_origem:
                obterRelacaoUnica(
                    registro.tecnico_origem
                ),
            tecnico_destino:
                obterRelacaoUnica(
                    registro.tecnico_destino
                ),
        })
    );
}