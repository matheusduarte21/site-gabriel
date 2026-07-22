import supabase from "../../lib/supabase";
import { AdiantamentoTecnico } from "../../types/portal-tecnico.type";

interface ConfirmarAdiantamentoParams {
    adiantamentoId: string;
    confirmado: boolean;
    observacao?: string;
}

export async function confirmarAdiantamentoTecnico({
    adiantamentoId,
    confirmado,
    observacao,
}: ConfirmarAdiantamentoParams): Promise<AdiantamentoTecnico> {
    if (!adiantamentoId) {
        throw new Error(
            "Adiantamento não informado."
        );
    }

    if (
        !confirmado &&
        !observacao?.trim()
    ) {
        throw new Error(
            "Informe o motivo da divergência."
        );
    }

    const { data, error } =
        await supabase.rpc(
            "confirmar_adiantamento_tecnico",
            {
                p_adiantamento_id:
                    adiantamentoId,
                p_confirmado:
                    confirmado,
                p_observacao:
                    observacao?.trim() ||
                    null,
            }
        );

    if (error) {
        console.error(
            "Erro ao confirmar adiantamento:",
            error.message
        );

        throw new Error(error.message);
    }

    return data as AdiantamentoTecnico;
}