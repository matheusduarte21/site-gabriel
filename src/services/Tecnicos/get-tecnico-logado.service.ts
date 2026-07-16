import supabase from "../../lib/supabase";
import { getUsuarioSistemaAtual } from "../auth/get-usuario-sistema-atual.service";
import { TecnicoLogado } from "../../types/portal-tecnico.type";

export async function getTecnicoLogado(): Promise<TecnicoLogado> {
    const usuario = await getUsuarioSistemaAtual();

    if (!usuario) {
        throw new Error("Usuário não autenticado.");
    }

    if (Number(usuario.tipo_perfil_id) !== 2) {
        throw new Error(
            "O usuário autenticado não possui perfil de técnico."
        );
    }

    const { data, error } = await supabase
        .from("tecnico")
        .select(`
            *,
            estado (*),
            municipio (*)
        `)
        .eq("usuario_id", usuario.id)
        .maybeSingle();

    if (error) {
        console.error(
            "Erro ao buscar técnico logado:",
            error.message
        );

        throw new Error(error.message);
    }

    if (!data) {
        throw new Error(
            "Não existe um técnico vinculado a esta conta."
        );
    }

    return data as TecnicoLogado;
}