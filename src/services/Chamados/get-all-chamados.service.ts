import supabase from "../../lib/supabase";
import { Cliente } from "../../types/cliente.type";

export async function getTodosChamados(): Promise<Cliente[]> {
    const { data, error } = await supabase
        .from('chamado')
        .select('*')

    if (error) {
        console.error('Erro ao buscar clientes no Supabase:', error.message)
        throw new Error(error.message)
    }

    return data || []
}