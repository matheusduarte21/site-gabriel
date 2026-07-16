import supabase from "../../lib/supabase";
import {
    AcompanhamentoTecnico,
    StatusTecnicoCodigo,
} from "../../types/portal-tecnico.type";
import {
    getOuCriarAcompanhamento,
    getStatusTecnicoPorCodigo,
} from "./acompanhamento-tecnico.service";

const obterCampoHorario = (
    codigo: StatusTecnicoCodigo
):
    | "deslocamento_em"
    | "chegada_em"
    | "inicio_em"
    | "finalizacao_em"
    | null => {
    if (codigo === "em_deslocamento") {
        return "deslocamento_em";
    }

    if (codigo === "chegou_local") {
        return "chegada_em";
    }

    if (
        codigo ===
        "atendimento_iniciado"
    ) {
        return "inicio_em";
    }

    if (
        codigo ===
        "atendimento_finalizado"
    ) {
        return "finalizacao_em";
    }

    return null;
};

export async function atualizarStatusTecnico(
    chamadoId: string,
    novoCodigo: StatusTecnicoCodigo
): Promise<AcompanhamentoTecnico> {
    const acompanhamento =
        await getOuCriarAcompanhamento(
            chamadoId
        );

    if (
        acompanhamento.validacao !==
        "aprovado"
    ) {
        throw new Error(
            "O atendimento deve ser aprovado antes de atualizar o andamento."
        );
    }

    const statusAtual =
        acompanhamento.status_tecnico;

    if (!statusAtual) {
        throw new Error(
            "O status atual do técnico não foi encontrado."
        );
    }

    const novoStatus =
        await getStatusTecnicoPorCodigo(
            novoCodigo
        );

    if (
        novoStatus.ordem !==
        statusAtual.ordem + 1
    ) {
        throw new Error(
            "O andamento deve seguir a ordem correta das etapas."
        );
    }

    const agora = new Date().toISOString();

    const atualizacao: Record<
        string,
        string | number
    > = {
        status_tecnico_id:
            novoStatus.id,
        status_atualizado_em: agora,
    };

    const campoHorario =
        obterCampoHorario(novoCodigo);

    if (campoHorario) {
        atualizacao[campoHorario] = agora;
    }

    const { data, error } = await supabase
        .from(
            "chamado_acompanhamento_tecnico"
        )
        .update(atualizacao)
        .eq("id", acompanhamento.id)
        .select(`
            *,
            status_tecnico (*)
        `)
        .single();

    if (error) {
        console.error(
            "Erro ao atualizar status do técnico:",
            error.message
        );

        throw new Error(error.message);
    }

    return data as AcompanhamentoTecnico;
}