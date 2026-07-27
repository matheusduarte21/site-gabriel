import supabase from "../../../lib/supabase";
import { CancelarAdiantamentoAdminPayload, AdiantamentoAdmin } from "../../../types/diantamento-admin.type";
import { obterRegistroRpcAdiantamento } from "../adiantamento-admin.utils";
import { getAdiantamentoAdminById } from "./get-adiantamento-admin-by-id.service";

export async function cancelarAdiantamentoAdmin(
    payload: CancelarAdiantamentoAdminPayload
): Promise<AdiantamentoAdmin> {
    if (!payload.adiantamentoId) {
        throw new Error(
            "Adiantamento não informado."
        );
    }

    if (
        payload.motivo.trim().length < 3
    ) {
        throw new Error(
            "Informe o motivo do cancelamento."
        );
    }

    const { data, error } =
        await supabase.rpc(
            "cancelar_adiantamento_admin",
            {
                p_adiantamento_id:
                    payload.adiantamentoId,
                p_motivo:
                    payload.motivo.trim(),
            }
        );

    if (error) {
        console.error(
            "Erro ao cancelar adiantamento:",
            error.message
        );

        throw new Error(error.message);
    }

    const registro =
        obterRegistroRpcAdiantamento(
            data
        );

    return getAdiantamentoAdminById(
        registro.id
    );
}