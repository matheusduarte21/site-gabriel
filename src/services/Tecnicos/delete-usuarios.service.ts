import supabase from "../../lib/supabase";

export async function deletarTecnico(id: string | number): Promise<void> {
    const { error } = await supabase
        .from('tecnico')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('Erro ao deletar técnico no Supabase:', error.message);
        throw new Error(error.message);
    }
}