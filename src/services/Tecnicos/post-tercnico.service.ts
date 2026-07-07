import supabase from "../../lib/supabase";

export async function criarTecnico(tecnico: any): Promise<any> {
    const { 
        id, 
        nome_estado, 
        nome_municipio, 
        data_nascimento_formatada, 
        estado, 
        municipio, 
        ...payload 
    } = tecnico;

    const { data, error } = await supabase
        .from('tecnico')
        .insert([payload])
        .select()
        .single();

    if (error) {
        throw new Error(error.message);
    }

    return data;
}