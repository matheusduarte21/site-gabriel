import supabase from "../../../lib/supabase";
import { RegistrarPagamentoAdiantamentoPayload, AdiantamentoAdmin } from "../../../types/diantamento-admin.type";
import { obterRegistroRpcAdiantamento } from "../adiantamento-admin.utils";
import { getAdiantamentoAdminById } from "./get-adiantamento-admin-by-id.service";

export async function registrarPagamentoAdiantamentoAdmin(
    payload: RegistrarPagamentoAdiantamentoPayload
): Promise<AdiantamentoAdmin> {
    if (!payload.adiantamentoId) {
        throw new Error(
            "Adiantamento não informado."
        );
    }

    const parametros: {
        p_adiantamento_id: string;
        p_comprovante_url: string | null;
        p_pago_em?: string;
    } = {
        p_adiantamento_id:
            payload.adiantamentoId,
        p_comprovante_url:
            payload.comprovanteUrl
                ?.trim() || null,
    };

    if (payload.pagoEm) {
        parametros.p_pago_em =
            payload.pagoEm;
    }

    const { data, error } =
        await supabase.rpc(
            "registrar_pagamento_adiantamento_admin",
            parametros
        );

    if (error) {
        console.error(
            "Erro ao registrar pagamento:",
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