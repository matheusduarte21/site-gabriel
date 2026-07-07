import supabase from "../../lib/supabase";
import { Cliente } from "../../types/cliente.type";

export async function getTodosClientes(): Promise<Cliente[]> {
    const { data, error } = await supabase
      .from('cliente')
      .select('*')
      .order('nome', { ascending: true })

    if (error) {
      console.error('Erro ao buscar clientes no Supabase:', error.message)
      throw new Error(error.message)
    }

    return data || []
}