import supabase from "../../lib/supabase";
import { AdiantamentoTecnico } from "../../types/portal-tecnico.type";

interface ResponderValorAdiantamentoParams {
    adiantamentoId: string;
    aprovado: boolean;
    observacao?: string;
}

export async function responderValorAdiantamentoTecnico({
    adiantamentoId,
    aprovado,
    observacao,
}: ResponderValorAdiantamentoParams): Promise<AdiantamentoTecnico> {
    if (!adiantamentoId) {
        throw new Error(
            "Adiantamento não informado."
        );
    }

    if (
        !aprovado &&
        !observacao?.trim()
    ) {
        throw new Error(
            "Informe o motivo da reprovação."
        );
    }

    const { data, error } =
        await supabase.rpc(
            "responder_valor_adiantamento_tecnico",
            {
                p_adiantamento_id:
                    adiantamentoId,
                p_aprovado: aprovado,
                p_observacao:
                    observacao?.trim() ||
                    null,
            }
        );

    if (error) {
        console.error(
            "Erro ao responder valor do adiantamento:",
            error.message
        );

        throw new Error(error.message);
    }

    return data as AdiantamentoTecnico;
}