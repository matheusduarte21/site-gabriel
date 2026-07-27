import supabase from "../../../lib/supabase";
import { getOuCriarAcompanhamento } from "../acompanhamento-tecnico.service";


interface ValidarAtendimentoParams {
    chamadoId: string;
    aprovado: boolean;
    observacao?: string;
}

export async function validarAtendimentoTecnico({
    chamadoId,
    aprovado,
    observacao = "",
}: ValidarAtendimentoParams): Promise<AcompanhamentoTecnico> {
    const observacaoNormalizada =
        observacao.trim();

    if (
        !aprovado &&
        !observacaoNormalizada
    ) {
        throw new Error(
            "Informe o motivo da reprovação."
        );
    }

    const acompanhamento =
        await getOuCriarAcompanhamento(
            chamadoId
        );

    const validacao: ValidacaoAtendimento =
        aprovado
            ? "aprovado"
            : "reprovado";

    const { data, error } = await supabase
        .from(
            "chamado_acompanhamento_tecnico"
        )
        .update({
            validacao,
            observacao_validacao: aprovado
                ? null
                : observacaoNormalizada,
            validado_em:
                new Date().toISOString(),
        })
        .eq("id", acompanhamento.id)
        .select(`
            *,
            status_tecnico (*)
        `)
        .single();

    if (error) {
        console.error(
            "Erro ao validar atendimento:",
            error.message
        );

        throw new Error(error.message);
    }

    return data as AcompanhamentoTecnico;
}