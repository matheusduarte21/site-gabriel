import supabase from "../../lib/supabase";
import {
    AcompanhamentoTecnicoPortal,
    ChamadoTecnicoPortal,
    FiltroChamadosTecnico,
} from "../../types/portal-tecnico.type";
import { getTecnicoLogado } from "./get-tecnico-logado.service";

interface ChamadoTecnicoResposta
    extends Omit<
        ChamadoTecnicoPortal,
        "acompanhamento"
    > {
    acompanhamento?:
        | AcompanhamentoTecnicoPortal
        | AcompanhamentoTecnicoPortal[]
        | null;
}

const obterTimestampAcompanhamento = (
    acompanhamento:
        AcompanhamentoTecnicoPortal
): number => {
    const valor =
        acompanhamento.status_atualizado_em ||
        acompanhamento.atualizado_em ||
        acompanhamento.criado_em;

    if (!valor) {
        return 0;
    }

    const timestamp =
        new Date(valor).getTime();

    return Number.isNaN(timestamp)
        ? 0
        : timestamp;
};

const obterAcompanhamentoMaisRecente = (
    valor:
        | AcompanhamentoTecnicoPortal
        | AcompanhamentoTecnicoPortal[]
        | null
        | undefined
): AcompanhamentoTecnicoPortal | null => {
    if (!valor) {
        return null;
    }

    if (!Array.isArray(valor)) {
        return valor;
    }

    if (valor.length === 0) {
        return null;
    }

    return [...valor].sort(
        (a, b) =>
            obterTimestampAcompanhamento(
                b
            ) -
            obterTimestampAcompanhamento(
                a
            )
    )[0];
};

export async function getMeusChamados(
    filtros: FiltroChamadosTecnico = {}
): Promise<ChamadoTecnicoPortal[]> {
    const tecnico =
        await getTecnicoLogado();

    let query = supabase
        .from("chamado")
        .select(`
            *,
            cliente (
                id,
                nome
            ),
            status (
                id,
                descricao
            ),
            tecnico (
                id,
                nome,
                telefone,
                endereco,
                cpf,
                rg,
                email_contato,
                data_nascimento,
                estado_id,
                municipio_id,
                usuario_id,
                data_criacao
            ),
            acompanhamento:chamado_acompanhamento_tecnico (
                *,
                status_tecnico (
                    id,
                    codigo,
                    descricao,
                    ordem,
                    ativo
                )
            )
        `)
        .eq(
            "tecnico_id",
            tecnico.id
        );

    if (
        filtros.statusId !==
            undefined &&
        filtros.statusId !== null &&
        filtros.statusId !== ""
    ) {
        query = query.eq(
            "status_id",
            filtros.statusId
        );
    }

    if (
        filtros.status_id !==
            undefined &&
        filtros.status_id !== null &&
        filtros.status_id !== ""
    ) {
        query = query.eq(
            "status_id",
            filtros.status_id
        );
    }

    if (filtros.dataInicio) {
        query = query.gte(
            "data_agendamento",
            filtros.dataInicio
        );
    }

    if (filtros.dataFim) {
        query = query.lte(
            "data_agendamento",
            filtros.dataFim
        );
    }

    query = query
        .order("data_agendamento", {
            ascending: true,
            nullsFirst: false,
        })
        .order("data_criacao", {
            ascending: false,
        });

    const { data, error } =
        await query;

    if (error) {
        console.error(
            "Erro ao buscar chamados do técnico:",
            error.message
        );

        throw new Error(error.message);
    }

    let chamados = (
        data || []
    ).map(
        (
            chamado: ChamadoTecnicoResposta
        ): ChamadoTecnicoPortal => ({
            ...chamado,
            acompanhamento:
                obterAcompanhamentoMaisRecente(
                    chamado.acompanhamento
                ),
        })
    );

    if (filtros.validacao) {
        chamados = chamados.filter(
            (chamado) =>
                chamado.acompanhamento
                    ?.validacao ===
                filtros.validacao
        );
    }

    const statusTecnicoFiltro =
        filtros.statusTecnico ||
        filtros.status_tecnico;

    if (statusTecnicoFiltro) {
        chamados = chamados.filter(
            (chamado) =>
                chamado.acompanhamento
                    ?.status_tecnico
                    ?.codigo ===
                statusTecnicoFiltro
        );
    }

    if (filtros.busca?.trim()) {
        const termo =
            filtros.busca
                .trim()
                .toLocaleLowerCase(
                    "pt-BR"
                );

        chamados = chamados.filter(
            (chamado) => {
                const numero =
                    chamado.numero_chamado
                        ?.toLocaleLowerCase(
                            "pt-BR"
                        ) || "";

                const empresa =
                    chamado.empresa
                        ?.toLocaleLowerCase(
                            "pt-BR"
                        ) || "";

                const cliente =
                    chamado.cliente?.nome
                        ?.toLocaleLowerCase(
                            "pt-BR"
                        ) || "";

                const endereco =
                    chamado.endereco
                        ?.toLocaleLowerCase(
                            "pt-BR"
                        ) || "";

                return (
                    numero.includes(termo) ||
                    empresa.includes(termo) ||
                    cliente.includes(termo) ||
                    endereco.includes(termo)
                );
            }
        );
    }

    return chamados;
}