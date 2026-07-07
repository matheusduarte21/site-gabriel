import supabase from "../../lib/supabase";

export async function getTodosTiposPerfil() {
    const { data, error } = await supabase
        .from('tipo_perfil')
        .select('*')
        .order('nome', { ascending: true })

    if (error) {
        console.error('Erro ao buscar tipos de perfil no Supabase:', error.message)
        throw new Error(error.message)
    }

    return data || []
}