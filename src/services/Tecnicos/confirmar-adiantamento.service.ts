import supabase from "../../lib/supabase";
import {
    AdiantamentoTecnico,
    ConfirmacaoAdiantamento,
} from "../../types/portal-tecnico.type";
import { getTecnicoLogado } from "./get-tecnico-logado.service";

interface ConfirmarAdiantamentoParams {
    adiantamentoId: string;
    confirmado: boolean;
    observacao?: string;
}

export async function confirmarAdiantamentoTecnico({
    adiantamentoId,
    confirmado,
    observacao = "",
}: ConfirmarAdiantamentoParams): Promise<AdiantamentoTecnico> {
    const tecnico = await getTecnicoLogado();

    const { data: adiantamento, error: erroBusca } =
        await supabase
            .from("adiantamento")
            .select("*")
            .eq("id", adiantamentoId)
            .eq("tecnico_id", tecnico.id)
            .maybeSingle();

    if (erroBusca) {
        throw new Error(erroBusca.message);
    }

    if (!adiantamento) {
        throw new Error(
            "Adiantamento não encontrado."
        );
    }

    if (adiantamento.status !== "pago") {
        throw new Error(
            "Somente adiantamentos pagos podem ser confirmados."
        );
    }

    const observacaoNormalizada =
        observacao.trim();

    if (
        !confirmado &&
        !observacaoNormalizada
    ) {
        throw new Error(
            "Informe o motivo da divergência."
        );
    }

    const confirmacao: ConfirmacaoAdiantamento =
        confirmado
            ? "confirmado"
            : "divergente";

    const { data, error } = await supabase
        .from("adiantamento")
        .update({
            confirmacao_tecnico:
                confirmacao,
            observacao_tecnico:
                confirmado
                    ? null
                    : observacaoNormalizada,
            confirmado_tecnico_em:
                new Date().toISOString(),
        })
        .eq("id", adiantamentoId)
        .eq("tecnico_id", tecnico.id)
        .select(`
            *,
            chamado (
                id,
                numero_chamado,
                empresa,
                data_agendamento
            )
        `)
        .single();

    if (error) {
        console.error(
            "Erro ao confirmar adiantamento:",
            error.message
        );

        throw new Error(error.message);
    }

    return data as AdiantamentoTecnico;
}