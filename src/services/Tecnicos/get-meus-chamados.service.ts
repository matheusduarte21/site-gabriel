import supabase from "../../lib/supabase";
import {
    ChamadoTecnicoPortal,
    FiltroChamadosTecnico,
} from "../../types/portal-tecnico.type";
import { getTecnicoLogado } from "./get-tecnico-logado.service";

const obterMesReferencia = (
    dataAgendamento?: string | null,
    dataCriacao?: string | null
): string | null => {
    const data =
        dataAgendamento ||
        dataCriacao ||
        null;

    if (!data) {
        return null;
    }

    const mes = data.slice(0, 7);

    return /^\d{4}-\d{2}$/.test(mes)
        ? mes
        : null;
};

const obterRelacaoUnica = <T>(
    valor: T | T[] | null | undefined
): T | null => {
    if (Array.isArray(valor)) {
        return valor[0] ?? null;
    }

    return valor ?? null;
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
                usuario_id,
                nome,
                telefone,
                endereco,
                cpf,
                rg,
                data_nascimento,
                email_contato,
                data_criacao,
                estado_id,
                municipio_id
            ),
            acompanhamento:chamado_acompanhamento_tecnico (
                id,
                chamado_id,
                status_tecnico_id,
                validacao,
                observacao_validacao,
                validado_em,
                status_atualizado_em,
                deslocamento_em,
                chegada_em,
                inicio_em,
                finalizacao_em,
                criado_em,
                atualizado_em,
                status_tecnico (
                    id,
                    codigo,
                    descricao,
                    ordem,
                    ativo
                )
            )
        `)
        .eq("tecnico_id", tecnico.id)
        .order("data_agendamento", {
            ascending: true,
            nullsFirst: false,
        })
        .order("data_criacao", {
            ascending: false,
        });

    if (
        filtros.statusOficialId &&
        filtros.statusOficialId !== "todos"
    ) {
        query = query.eq(
            "status_id",
            filtros.statusOficialId
        );
    }

    const { data, error } = await query;

    if (error) {
        console.error(
            "Erro ao buscar chamados do técnico:",
            error.message
        );

        throw new Error(error.message);
    }

    let chamados = (data ?? []).map(
        (registro: any): ChamadoTecnicoPortal => ({
            ...registro,
            cliente: obterRelacaoUnica(
                registro.cliente
            ),
            status: obterRelacaoUnica(
                registro.status
            ),
            tecnico: obterRelacaoUnica(
                registro.tecnico
            ),
            acompanhamento:
                obterRelacaoUnica(
                    registro.acompanhamento
                ),
            adiantamentos: [],
        })
    );

    if (
        filtros.mes &&
        filtros.mes !== "todos"
    ) {
        chamados = chamados.filter(
            (chamado) =>
                obterMesReferencia(
                    chamado.data_agendamento,
                    chamado.data_criacao
                ) === filtros.mes
        );
    }

    if (
        filtros.validacao &&
        filtros.validacao !== "todos"
    ) {
        chamados = chamados.filter(
            (chamado) =>
                chamado.acompanhamento
                    ?.validacao ===
                filtros.validacao
        );
    }

    if (
        filtros.statusTecnico &&
        filtros.statusTecnico !== "todos"
    ) {
        chamados = chamados.filter(
            (chamado) =>
                chamado.acompanhamento
                    ?.status_tecnico
                    ?.codigo ===
                filtros.statusTecnico
        );
    }

    return chamados;
}