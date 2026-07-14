import supabase from "../../lib/supabase";

export async function getChamadoDetalhado(id: string) {
    const { data, error } = await supabase
        .from("chamado")
        .select(`
            *, 
            cliente:cliente_id(nome), 
            tecnico:tecnico_id(nome)
        `)
        .eq("id", id)
        .single();

    if (error) throw error;
    return data;
}