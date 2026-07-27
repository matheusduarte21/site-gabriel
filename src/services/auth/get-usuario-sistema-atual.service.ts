import type { User } from "@supabase/supabase-js";
import supabase from "../../lib/supabase";

export interface UsuarioSistema {
    id: string;
    email: string;
    tipo_perfil_id: number;
    criado_em?: string | null;
}

export async function getUsuarioSistemaAtual(
    authUserRecebido?: User | null
): Promise<UsuarioSistema | null> {
    let authUser = authUserRecebido ?? null;

    if (!authUser) {
        const {
            data: { user },
            error,
        } = await supabase.auth.getUser();

        if (error) {
            throw new Error(error.message);
        }

        authUser = user;
    }

    if (!authUser) {
        return null;
    }

    const { data: usuarioPorId, error: erroPorId } =
        await supabase
            .from("usuarios")
            .select("id, email, tipo_perfil_id, criado_em")
            .eq("id", authUser.id)
            .maybeSingle();

    if (erroPorId) {
        console.error(
            "Erro ao buscar usuário pelo ID:",
            erroPorId.message
        );
    }

    if (usuarioPorId) {
        return {
            ...usuarioPorId,
            tipo_perfil_id: Number(
                usuarioPorId.tipo_perfil_id
            ),
        };
    }

    if (!authUser.email) {
        return null;
    }

    const { data: usuarioPorEmail, error: erroPorEmail } =
        await supabase
            .from("usuarios")
            .select("id, email, tipo_perfil_id, criado_em")
            .eq("email", authUser.email)
            .maybeSingle();

    if (erroPorEmail) {
        throw new Error(erroPorEmail.message);
    }

    if (!usuarioPorEmail) {
        return null;
    }

    return {
        ...usuarioPorEmail,
        tipo_perfil_id: Number(
            usuarioPorEmail.tipo_perfil_id
        ),
    };
}