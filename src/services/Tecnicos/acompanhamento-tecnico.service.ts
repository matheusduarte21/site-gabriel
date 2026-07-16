import supabase from "../../lib/supabase";
import {
    AcompanhamentoTecnico,
    StatusTecnico,
    StatusTecnicoCodigo,
} from "../../types/portal-tecnico.type";
import { getTecnicoLogado } from "./get-tecnico-logado.service";

export async function validarPropriedadeChamado(
    chamadoId: string
): Promise<void> {
    const tecnico = await getTecnicoLogado();

    const { data, error } = await supabase
        .from("chamado")
        .select("id")
        .eq("id", chamadoId)
        .eq("tecnico_id", tecnico.id)
        .maybeSingle();

    if (error) {
        throw new Error(error.message);
    }

    if (!data) {
        throw new Error(
            "Este chamado não pertence ao técnico autenticado."
        );
    }
}

export async function getStatusTecnicoPorCodigo(
    codigo: StatusTecnicoCodigo
): Promise<StatusTecnico> {
    const { data, error } = await supabase
        .from("status_tecnico")
        .select("*")
        .eq("codigo", codigo)
        .eq("ativo", true)
        .maybeSingle();

    if (error) {
        throw new Error(error.message);
    }

    if (!data) {
        throw new Error(
            `Status técnico não encontrado: ${codigo}.`
        );
    }

    return data as StatusTecnico;
}

export async function getOuCriarAcompanhamento(
    chamadoId: string
): Promise<AcompanhamentoTecnico> {
    await validarPropriedadeChamado(chamadoId);

    const { data: existente, error: erroBusca } =
        await supabase
            .from(
                "chamado_acompanhamento_tecnico"
            )
            .select(`
                *,
                status_tecnico (*)
            `)
            .eq("chamado_id", chamadoId)
            .maybeSingle();

    if (erroBusca) {
        throw new Error(erroBusca.message);
    }

    if (existente) {
        return existente as AcompanhamentoTecnico;
    }

    const statusAguardando =
        await getStatusTecnicoPorCodigo(
            "aguardando"
        );

    const { data: criado, error: erroCriacao } =
        await supabase
            .from(
                "chamado_acompanhamento_tecnico"
            )
            .insert({
                chamado_id: chamadoId,
                status_tecnico_id:
                    statusAguardando.id,
                validacao: "pendente",
            })
            .select(`
                *,
                status_tecnico (*)
            `)
            .single();

    if (erroCriacao) {
        if (erroCriacao.code === "23505") {
            const {
                data: acompanhamentoExistente,
                error: erroNovaBusca,
            } = await supabase
                .from(
                    "chamado_acompanhamento_tecnico"
                )
                .select(`
                    *,
                    status_tecnico (*)
                `)
                .eq("chamado_id", chamadoId)
                .single();

            if (erroNovaBusca) {
                throw new Error(
                    erroNovaBusca.message
                );
            }

            return acompanhamentoExistente as AcompanhamentoTecnico;
        }

        throw new Error(erroCriacao.message);
    }

    return criado as AcompanhamentoTecnico;
}