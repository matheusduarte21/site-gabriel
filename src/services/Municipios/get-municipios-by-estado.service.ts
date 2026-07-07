import supabase from "../../lib/supabase";

export async function getMunicipiosPorEstado(estadoId: number | string) {
    const { data, error } = await supabase
        .from('municipio')
        .select('*')
        .eq('estado_id', estadoId)
        .order('nome', { ascending: true });

    if (error) {
        throw new Error(error.message);
    }

    return data || [];
}