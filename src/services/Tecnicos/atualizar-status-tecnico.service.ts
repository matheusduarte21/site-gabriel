import supabase from "../../lib/supabase";
import {
    AcompanhamentoTecnicoPortal,
    StatusTecnicoCodigo,
} from "../../types/portal-tecnico.type";

const CAMPOS_DATA_STATUS: Partial<
    Record<StatusTecnicoCodigo, string>
> = {
    em_deslocamento: "deslocamento_em",
    chegou_local: "chegada_em",
    atendimento_iniciado: "inicio_em",
    atendimento_finalizado: "finalizacao_em",
};

export async function atualizarStatusTecnico(
    chamadoId: string,
    statusCodigo: StatusTecnicoCodigo
): Promise<AcompanhamentoTecnicoPortal> {
    if (!chamadoId) {
        throw new Error(
            "Chamado não informado."
        );
    }

    const {
        data: statusTecnico,
        error: statusError,
    } = await supabase
        .from("status_tecnico")
        .select(
            "id, codigo, descricao, ordem, ativo"
        )
        .eq("codigo", statusCodigo)
        .eq("ativo", true)
        .single();

    if (statusError) {
        console.error(
            "Erro ao buscar status do técnico:",
            statusError.message
        );

        throw new Error(
            "Status do técnico não encontrado."
        );
    }

    const agora =
        new Date().toISOString();

    const dadosAtualizacao: Record<
        string,
        string | number
    > = {
        status_tecnico_id:
            statusTecnico.id,
        status_atualizado_em: agora,
        atualizado_em: agora,
    };

    const campoData =
        CAMPOS_DATA_STATUS[
            statusCodigo
        ];

    if (campoData) {
        dadosAtualizacao[campoData] =
            agora;
    }

    const {
        data: acompanhamento,
        error: updateError,
    } = await supabase
        .from(
            "chamado_acompanhamento_tecnico"
        )
        .update(dadosAtualizacao)
        .eq("chamado_id", chamadoId)
        .select(`
            *,
            status_tecnico (
                id,
                codigo,
                descricao,
                ordem,
                ativo
            )
        `)
        .single();

    if (updateError) {
        console.error(
            "Erro ao atualizar status do técnico:",
            updateError.message
        );

        throw new Error(
            updateError.message
        );
    }

    if (!acompanhamento) {
        throw new Error(
            "Acompanhamento do chamado não encontrado."
        );
    }

    return acompanhamento as AcompanhamentoTecnicoPortal;
}