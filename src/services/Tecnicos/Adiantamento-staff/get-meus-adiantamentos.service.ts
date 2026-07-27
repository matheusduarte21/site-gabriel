import supabase from "../../lib/supabase";
import { AdiantamentoTecnico } from "../../types/portal-tecnico.type";
import { getTecnicoLogado } from "./get-tecnico-logado.service";

interface AdiantamentoResposta
    extends Omit<
        AdiantamentoTecnico,
        "chamado"
    > {
    chamado?:
        | AdiantamentoTecnico["chamado"]
        | AdiantamentoTecnico["chamado"][]
        | null;
}

const obterRelacaoUnica = <T>(
    valor: T | T[] | null | undefined
): T | null => {
    if (Array.isArray(valor)) {
        return valor[0] ?? null;
    }

    return valor ?? null;
};

export async function getMeusAdiantamentos(): Promise<
    AdiantamentoTecnico[]
> {
    const tecnico =
        await getTecnicoLogado();

    const { data, error } = await supabase
        .from("adiantamento")
        .select(`
            id,
            tecnico_id,
            chamado_id,
            valor,
            descricao,
            status,
            confirmacao_tecnico,
            observacao_tecnico,
            comprovante_url,
            solicitado_em,
            aprovado_em,
            pago_em,
            confirmado_em,
            criado_em,
            atualizado_em,
            validacao_valor_tecnico,
            observacao_validacao,
            enviado_validacao_em,
            validado_em,
            status_pagamento,
            confirmacao_recebimento,
            observacao_recebimento,
            recebimento_respondido_em,
            status_compensacao,
            valor_compensado,
            compensado_em,
            cancelado_em,
            motivo_cancelamento,
            chamado (
                id,
                numero_chamado,
                empresa,
                data_agendamento
            )
        `)
        .eq("tecnico_id", tecnico.id)
        .order("criado_em", {
            ascending: false,
        });

    if (error) {
        console.error(
            "Erro ao buscar adiantamentos:",
            error.message
        );

        throw new Error(error.message);
    }

    return (
        (data || []) as unknown as AdiantamentoResposta[]
    ).map((registro) => ({
        ...registro,
        chamado: obterRelacaoUnica(
            registro.chamado
        ),
    }));
}