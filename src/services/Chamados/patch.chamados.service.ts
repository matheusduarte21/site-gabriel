import supabase from "../../lib/supabase";
import { Chamado } from "../../types/chamado.type";

export async function atualizarChamado(id: string | number, chamado: Partial<Chamado>): Promise<any> {
    const { id: _id, valor_ganho, ...payload } = chamado as any;

    const { data, error } = await supabase
        .from('chamado')
        .update(payload)
        .eq('id', id)
        .select()
        .single();

    if (error) {
        console.error('Erro ao atualizar chamado no Supabase:', error.message);
        throw new Error(error.message);
    }

    return data;
}