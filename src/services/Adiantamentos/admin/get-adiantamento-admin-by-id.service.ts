import supabase from "../../../lib/supabase";
import { AdiantamentoAdmin, AdiantamentoAdminRespostaBanco } from "../../../types/diantamento-admin.type";
import { ADIANTAMENTO_ADMIN_SELECT, normalizarAdiantamentoAdmin } from "../adiantamento-admin.utils";

export async function getAdiantamentoAdminById(
    adiantamentoId: string
): Promise<AdiantamentoAdmin> {
    if (!adiantamentoId) {
        throw new Error(
            "Adiantamento não informado."
        );
    }

    const { data, error } = await supabase
        .from("adiantamento")
        .select(
            ADIANTAMENTO_ADMIN_SELECT
        )
        .eq("id", adiantamentoId)
        .maybeSingle();

    if (error) {
        console.error(
            "Erro ao buscar adiantamento:",
            error.message
        );

        throw new Error(error.message);
    }

    if (!data) {
        throw new Error(
            "Adiantamento não encontrado."
        );
    }

    return normalizarAdiantamentoAdmin(
        data as unknown as AdiantamentoAdminRespostaBanco
    );
}