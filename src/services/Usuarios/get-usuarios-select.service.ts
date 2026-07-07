import supabase from "../../lib/supabase";

export async function getUsuariosParaSelect() {
    const { data, error } = await supabase
        .from('usuarios')
        .select('id, email')
        .order('email', { ascending: true });

    if (error) {
        console.error('Erro ao buscar usuários para select:', error.message);
        throw new Error(error.message);
    }

    return data || [];
}