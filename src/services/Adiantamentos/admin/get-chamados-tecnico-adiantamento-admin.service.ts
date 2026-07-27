import supabase from "../../../lib/supabase";
import { ChamadoOpcaoAdiantamento } from "../../../types/diantamento-admin.type";

interface ChamadoOpcaoResposta {
    id: string;
    tecnico_id: string;
    numero_chamado?: string | null;
    empresa?: string | null;
    endereco?: string | null;
    data_agendamento?: string | null;
    valor_total_tecnico?: number | string | null;
    status?:
        | {
              id: number;
              descricao: string;
          }
        | {
              id: number;
              descricao: string;
          }[]
        | null;
}

const obterStatusUnico = (
    status: ChamadoOpcaoResposta["status"]
): ChamadoOpcaoAdiantamento["status"] => {
    if (Array.isArray(status)) {
        return status[0] ?? null;
    }

    return status ?? null;
};

export async function getChamadosDoTecnicoParaAdiantamentoAdmin(
    tecnicoId: string
): Promise<ChamadoOpcaoAdiantamento[]> {
    if (!tecnicoId) {
        return [];
    }

    const { data, error } = await supabase
        .from("chamado")
        .select(`
            id,
            tecnico_id,
            numero_chamado,
            empresa,
            endereco,
            data_agendamento,
            valor_total_tecnico,
            status (
                id,
                descricao
            )
        `)
        .eq("tecnico_id", tecnicoId)
        .order("data_agendamento", {
            ascending: false,
            nullsFirst: false,
        })
        .order("data_criacao", {
            ascending: false,
        });

    if (error) {
        console.error(
            "Erro ao buscar chamados do técnico:",
            error.message
        );

        throw new Error(error.message);
    }

    return (
        (data || []) as unknown as ChamadoOpcaoResposta[]
    ).map((chamado) => ({
        ...chamado,
        status: obterStatusUnico(
            chamado.status
        ),
    }));
}