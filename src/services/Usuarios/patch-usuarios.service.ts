import supabase from "../../lib/supabase";

export async function atualizarUsuario(id: string | number, usuario: any): Promise<any> {
    const { id: _id, ...payload } = usuario;

    const { data, error } = await supabase
        .from('usuarios')
        .update(payload)
        .eq('id', id)
        .select()
        .single();

    if (error) {
        throw new Error(error.message);
    }

    return data;
}