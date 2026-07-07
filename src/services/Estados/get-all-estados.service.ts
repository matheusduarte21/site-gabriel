import supabase from "../../lib/supabase";

export async function getTodosEstados() {
    const { data, error } = await supabase
        .from('estado')
        .select('*')
        .order('nome', { ascending: true });

    if (error) {
        throw new Error(error.message);
    }

    return data || [];
}