import supabase from "../../lib/supabase";

export async function atualizarTecnico(id: string | number, tecnico: any): Promise<any> {
    const { 
        id: _id, 
        nome_estado, 
        nome_municipio, 
        data_nascimento_formatada, 
        estado, 
        municipio, 
        ...payload 
    } = tecnico;

    const { data, error } = await supabase
        .from('tecnico')
        .update(payload)
        .eq('id', id)
        .select()
        .single();

    if (error) {
        throw new Error(error.message);
    }

    return data;
}