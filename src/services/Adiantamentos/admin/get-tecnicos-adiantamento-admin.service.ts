import supabase from "../../../lib/supabase";
import { TecnicoOpcaoAdiantamento } from "../../../types/diantamento-admin.type";

export async function getTecnicosParaAdiantamentoAdmin(): Promise<
    TecnicoOpcaoAdiantamento[]
> {
    const { data, error } = await supabase
        .from("tecnico")
        .select(`
            id,
            usuario_id,
            nome,
            telefone,
            email_contato,
            cpf
        `)
        .order("nome", {
            ascending: true,
        });

    if (error) {
        console.error(
            "Erro ao buscar técnicos para adiantamento:",
            error.message
        );

        throw new Error(error.message);
    }

    return (
        data || []
    ) as TecnicoOpcaoAdiantamento[];
}