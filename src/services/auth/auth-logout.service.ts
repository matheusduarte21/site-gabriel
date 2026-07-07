import supabase from "../../lib/supabase";

export async function logoutUsuario() {
    const { error } = await supabase.auth.signOut();

    if (error) {
        console.error('Erro ao fazer logout no Supabase:', error.message);
        throw new Error(error.message);
    }
}