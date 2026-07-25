import supabase from "../../../lib/supabase";
import { EditarAdiantamentoAdminPayload, AdiantamentoAdmin } from "../../../types/diantamento-admin.type";
import { obterRegistroRpcAdiantamento } from "../adiantamento-admin.utils";
import { getAdiantamentoAdminById } from "./get-adiantamento-admin-by-id.service";

export async function atualizarAdiantamentoAdmin(
    payload: EditarAdiantamentoAdminPayload
): Promise<AdiantamentoAdmin> {
    if (!payload.adiantamentoId) {
        throw new Error(
            "Adiantamento não informado."
        );
    }

    if (
        !Number.isFinite(payload.valor) ||
        payload.valor <= 0
    ) {
        throw new Error(
            "Informe um valor maior que zero."
        );
    }

    if (
        payload.descricao.trim().length <
        3
    ) {
        throw new Error(
            "Informe uma descrição válida."
        );
    }

    const { data, error } =
        await supabase.rpc(
            "editar_adiantamento_admin",
            {
                p_adiantamento_id:
                    payload.adiantamentoId,
                p_valor: payload.valor,
                p_descricao:
                    payload.descricao.trim(),
                p_chamado_id:
                    payload.chamadoId ||
                    null,
            }
        );

    if (error) {
        console.error(
            "Erro ao editar adiantamento:",
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