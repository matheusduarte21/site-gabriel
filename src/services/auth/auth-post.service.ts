import supabase from "../../lib/supabase";

export interface LoginCredenciais {
    email: string;
    senha: string;
}

export async function loginUsuario(credenciais: LoginCredenciais) {
    const { data, error } = await supabase.auth.signInWithPassword({
        email: credenciais.email,
        password: credenciais.senha,
    });

    if (error) {
        console.error('Erro ao fazer login no Supabase:', error.message);
        throw new Error(error.message);
    }

    return data;
}