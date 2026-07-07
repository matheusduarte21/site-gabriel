import supabase from "../../lib/supabase";

export async function deletarChamado(id: string | number): Promise<void> {
    const { error } = await supabase
        .from('chamado')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('Erro ao deletar chamado no Supabase:', error.message);
        throw new Error(error.message);
    }
}