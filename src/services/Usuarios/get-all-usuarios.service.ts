import supabase from "../../lib/supabase";
import { Cliente } from "../../types/cliente.type";

export async function getTodosUsuarios(): Promise<Cliente[]> {
    const { data, error } = await supabase
        .from('usuarios')
        .select('*')
        .order('email', { ascending: true })

    if (error) {
        console.error('Erro ao buscar clientes no Supabase:', error.message)
        throw new Error(error.message)
    }

    return data || []
}