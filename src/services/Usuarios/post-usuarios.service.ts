import supabase from "../../lib/supabase";

export async function criarUsuario(usuario: any): Promise<any> {
    const { data: authData, error: authError } = await supabase.auth.signUp({
        email: usuario.email,
        password: 'SenhaPadrao123!'
    });

    if (authError) {
        throw new Error(authError.message);
    }

    const userId = authData.user?.id;

    if (!userId) {
        throw new Error("Não foi possível criar a autenticação do usuário.");
    }

    const payload = {
        id: userId,
        email: usuario.email,
        tipo_perfil_id: usuario.tipo_perfil_id
    };

    const { data, error } = await supabase
        .from('usuarios')
        .upsert(payload)
        .select()
        .single();

    if (error) {
        throw new Error(error.message);
    }

    return data;
}   