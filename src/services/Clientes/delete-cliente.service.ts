import supabase from "../../lib/supabase";

export async function deletarCliente(id: string | number): Promise<void> {
    const { error } = await supabase
        .from('cliente')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('Erro ao deletar cliente no Supabase:', error.message);
        throw new Error(error.message);
    }
}