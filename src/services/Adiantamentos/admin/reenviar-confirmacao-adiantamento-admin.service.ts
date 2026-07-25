import supabase from "../../../lib/supabase";
import { ReenviarConfirmacaoAdiantamentoPayload, AdiantamentoAdmin } from "../../../types/diantamento-admin.type";
import { obterRegistroRpcAdiantamento } from "../adiantamento-admin.utils";
import { getAdiantamentoAdminById } from "./get-adiantamento-admin-by-id.service";

export async function reenviarConfirmacaoAdiantamentoAdmin(
    payload: ReenviarConfirmacaoAdiantamentoPayload
): Promise<AdiantamentoAdmin> {
    if (!payload.adiantamentoId) {
        throw new Error(
            "Adiantamento não informado."
        );
    }

    const { data, error } =
        await supabase.rpc(
            "reenviar_confirmacao_recebimento_admin",
            {
                p_adiantamento_id:
                    payload.adiantamentoId,
                p_comprovante_url:
                    payload.comprovanteUrl
                        ?.trim() ||
                    null,
            }
        );

    if (error) {
        console.error(
            "Erro ao reenviar confirmação:",
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