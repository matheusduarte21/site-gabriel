import supabase from "../../lib/supabase";
import { Cliente } from "../../types/cliente.type";

export async function getTodosStatus(): Promise<Cliente[]> {
    const { data, error } = await supabase
        .from('status')
        .select('*')
        .order('descricao', { ascending: true })

    if (error) {
        console.error('Erro ao busca status no Supabase:', error.message)
        throw new Error(error.message)
    }

    return data || []
}