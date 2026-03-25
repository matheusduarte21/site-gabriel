import supabase from "../../lib/supabase";

export async function getTodosTecnicos() {
    const { data, error } = await supabase
        .from('tecnico')
        .select(`
            *,
            estado (
                nome
            ),
            municipio (
                nome
            )
        `)
        .order('nome', { ascending: true })

    if (error) {
        console.error('Erro ao buscar Tecnicos no Supabase:', error.message)
        throw new Error(error.message)
    }

    return data || []
}