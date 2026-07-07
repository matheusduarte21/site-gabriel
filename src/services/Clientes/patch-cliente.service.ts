import supabase from "../../lib/supabase";

export async function atualizarCliente(id: string | number, cliente: any): Promise<any> {
    const { id: _id, ...payload } = cliente;

    const { data, error } = await supabase
        .from('cliente')
        .update(payload)
        .eq('id', id)
        .select()
        .single();

    if (error) {
        throw new Error(error.message);
    }

    return data;
}