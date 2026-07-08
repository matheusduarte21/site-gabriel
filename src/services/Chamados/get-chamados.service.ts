import supabase from "../../lib/supabase";
import { Chamado } from "../../types/chamado.type";

export async function getTodosChamados(): Promise<Chamado[]> {
    const { data, error } = await supabase
        .from("chamado")
        .select("*");

    if (error) {
        console.error("Erro ao buscar chamados no Supabase:", error.message);
        throw new Error(error.message);
    }

    return data || [];
}

export async function getChamadosAgendados(statusAgendadoId: string): Promise<Chamado[]> {
    const { data, error } = await supabase
        .from("chamado")
        .select("*")
        .eq("status_id", statusAgendadoId);

    if (error) {
        console.error("Erro ao buscar chamados agendados no Supabase:", error.message);
        throw new Error(error.message);
    }

    return data || [];
}