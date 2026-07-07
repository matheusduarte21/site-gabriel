import supabase from "../../lib/supabase";
import { Chamado } from "../../types/chamado.type";

export async function criarChamado(chamado: Partial<Chamado>): Promise<any> {
    const { id, valor_ganho, ...payload } = chamado as any;

    const { data, error } = await supabase
        .from('chamado')
        .insert([payload])
        .select()
        .single();

    if (error) {
        console.error('Erro ao criar chamado no Supabase:', error.message);
        throw new Error(error.message);
    }

    return data;
}