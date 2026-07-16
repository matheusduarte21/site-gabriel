import supabase from "../../lib/supabase";
import {
    AdiantamentoTecnico,
    StatusAdiantamento,
} from "../../types/portal-tecnico.type";
import { getTecnicoLogado } from "./get-tecnico-logado.service";

export async function getMeusAdiantamentos(
    status?: StatusAdiantamento | "todos"
): Promise<AdiantamentoTecnico[]> {
    const tecnico = await getTecnicoLogado();

    let query = supabase
        .from("adiantamento")
        .select(`
            *,
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

    if (status && status !== "todos") {
        query = query.eq("status", status);
    }

    const { data, error } = await query;

    if (error) {
        console.error(
            "Erro ao buscar adiantamentos:",
            error.message
        );

        throw new Error(error.message);
    }

    return (data || []) as AdiantamentoTecnico[];
}