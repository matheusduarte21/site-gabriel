import supabase from "../../lib/supabase";

export async function criarCliente(cliente: any): Promise<any> {
    const { id, ...payload } = cliente;

    const { data, error } = await supabase
        .from('cliente')
        .insert([payload])
        .select()
        .single();

    if (error) {
        throw new Error(error.message);
    }

    return data;
}