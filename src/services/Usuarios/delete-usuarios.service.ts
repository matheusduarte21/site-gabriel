import supabase from "../../lib/supabase";

export async function deletarUsuario(id: string | number): Promise<void> {
    const { error } = await supabase
        .from('usuarios')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('Erro ao deletar usuário no Supabase:', error.message);
        throw new Error(error.message);
    }
}