import supabase from "../../../lib/supabase";
import { AdiantamentoAdmin, AdiantamentoAdminRespostaBanco, FiltrosAdiantamentoAdmin } from "../../../types/diantamento-admin.type";
import { ADIANTAMENTO_ADMIN_SELECT, criarFimDiaIso, criarInicioDiaIso, normalizarAdiantamentoAdmin } from "../adiantamento-admin.utils";


export async function getTodosAdiantamentosAdmin(
    filtros: FiltrosAdiantamentoAdmin = {}
): Promise<AdiantamentoAdmin[]> {
    let query = supabase
        .from("adiantamento")
        .select(
            ADIANTAMENTO_ADMIN_SELECT
        );

    if (filtros.tecnicoId) {
        query = query.eq(
            "tecnico_id",
            filtros.tecnicoId
        );
    }

    if (filtros.chamadoId) {
        query = query.eq(
            "chamado_id",
            filtros.chamadoId
        );
    }

    if (
        filtros.validacao &&
        filtros.validacao !== "todos"
    ) {
        query = query.eq(
            "validacao_valor_tecnico",
            filtros.validacao
        );
    }

    if (
        filtros.pagamento &&
        filtros.pagamento !== "todos"
    ) {
        query = query.eq(
            "status_pagamento",
            filtros.pagamento
        );
    }

    if (
        filtros.recebimento &&
        filtros.recebimento !== "todos"
    ) {
        query = query.eq(
            "confirmacao_recebimento",
            filtros.recebimento
        );
    }

    if (
        filtros.compensacao &&
        filtros.compensacao !== "todos"
    ) {
        query = query.eq(
            "status_compensacao",
            filtros.compensacao
        );
    }

    if (filtros.dataInicio) {
        query = query.gte(
            "criado_em",
            criarInicioDiaIso(
                filtros.dataInicio
            )
        );
    }

    if (filtros.dataFim) {
        query = query.lte(
            "criado_em",
            criarFimDiaIso(
                filtros.dataFim
            )
        );
    }

    query = query.order("criado_em", {
        ascending: false,
    });

    const { data, error } = await query;

    if (error) {
        console.error(
            "Erro ao buscar adiantamentos administrativos:",
            error.message
        );

        throw new Error(error.message);
    }

    let registros = (
        data || []
    ).map((registro) =>
        normalizarAdiantamentoAdmin(
            registro as unknown as AdiantamentoAdminRespostaBanco
        )
    );

    const termo = filtros.busca
        ?.trim()
        .toLocaleLowerCase("pt-BR");

    if (termo) {
        registros = registros.filter(
            (adiantamento) => {
                const tecnico =
                    adiantamento.tecnico?.nome
                        ?.toLocaleLowerCase(
                            "pt-BR"
                        ) || "";

                const descricao =
                    adiantamento.descricao
                        .toLocaleLowerCase(
                            "pt-BR"
                        );

                const chamado =
                    adiantamento.chamado
                        ?.numero_chamado
                        ?.toLocaleLowerCase(
                            "pt-BR"
                        ) || "";

                const empresa =
                    adiantamento.chamado
                        ?.empresa
                        ?.toLocaleLowerCase(
                            "pt-BR"
                        ) || "";

                const email =
                    adiantamento.tecnico
                        ?.email_contato
                        ?.toLocaleLowerCase(
                            "pt-BR"
                        ) || "";

                return (
                    tecnico.includes(termo) ||
                    descricao.includes(termo) ||
                    chamado.includes(termo) ||
                    empresa.includes(termo) ||
                    email.includes(termo)
                );
            }
        );
    }

    return registros;
}