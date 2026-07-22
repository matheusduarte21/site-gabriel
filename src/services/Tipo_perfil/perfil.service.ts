import supabase from "../../lib/supabase";

interface RelacaoMunicipio {
    nome: string;
}

interface RelacaoEstado {
    sigla: string;
    nome: string;
}

export interface PerfilUsuarioCompleto {
    id: string;
    usuario_id: string;
    nome: string;
    email: string;
    tipo_perfil_id: number;
    telefone?: string | null;
    endereco?: string | null;
    cpf?: string | null;
    rg?: string | null;
    email_contato?: string | null;
    data_nascimento?: string | null;
    estado_id?: number | null;
    municipio_id?: number | null;
    municipio?: RelacaoMunicipio | null;
    estado?: RelacaoEstado | null;
}

const obterRelacaoUnica = <T>(
    valor: T | T[] | null | undefined
): T | null => {
    if (Array.isArray(valor)) {
        return valor[0] ?? null;
    }

    return valor ?? null;
};

export async function obterPerfilLogado(): Promise<PerfilUsuarioCompleto> {
    const {
        data: { user },
        error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
        throw new Error(
            "Usuário não autenticado no sistema."
        );
    }

    const {
        data: dadosUsuarioBase,
        error: erroUsuarioBase,
    } = await supabase
        .from("usuarios")
        .select(
            "id, email, tipo_perfil_id"
        )
        .eq("id", user.id)
        .single();

    if (erroUsuarioBase) {
        throw new Error(
            `Erro ao buscar usuário: ${erroUsuarioBase.message}`
        );
    }

    const tipoPerfilId = Number(
        dadosUsuarioBase.tipo_perfil_id
    );

    if (tipoPerfilId === 1) {
        return {
            id: dadosUsuarioBase.id,
            usuario_id:
                dadosUsuarioBase.id,
            nome:
                user.user_metadata?.nome ||
                "Administrador do sistema",
            email:
                dadosUsuarioBase.email ||
                user.email ||
                "",
            tipo_perfil_id:
                tipoPerfilId,
            telefone: null,
            endereco: null,
            cpf: null,
            rg: null,
            email_contato:
                dadosUsuarioBase.email ||
                user.email ||
                "",
            data_nascimento: null,
            estado_id: null,
            municipio_id: null,
            municipio: null,
            estado: null,
        };
    }

    if (tipoPerfilId === 2) {
        const {
            data: dadosTecnico,
            error: erroTecnico,
        } = await supabase
            .from("tecnico")
            .select(`
                id,
                usuario_id,
                nome,
                telefone,
                endereco,
                cpf,
                rg,
                email_contato,
                data_nascimento,
                estado_id,
                municipio_id,
                municipio (
                    nome
                ),
                estado (
                    sigla,
                    nome
                )
            `)
            .eq("usuario_id", user.id)
            .maybeSingle();

        if (erroTecnico) {
            throw new Error(
                `Erro ao buscar técnico: ${erroTecnico.message}`
            );
        }

        if (!dadosTecnico) {
            throw new Error(
                "Perfil de técnico não encontrado para este usuário."
            );
        }

        return {
            id: String(
                dadosTecnico.id
            ),
            usuario_id: String(
                dadosTecnico.usuario_id
            ),
            nome:
                dadosTecnico.nome ||
                "Técnico",
            email:
                dadosUsuarioBase.email ||
                user.email ||
                "",
            tipo_perfil_id:
                tipoPerfilId,
            telefone:
                dadosTecnico.telefone,
            endereco:
                dadosTecnico.endereco,
            cpf: dadosTecnico.cpf,
            rg: dadosTecnico.rg,
            email_contato:
                dadosTecnico.email_contato,
            data_nascimento:
                dadosTecnico.data_nascimento,
            estado_id:
                dadosTecnico.estado_id,
            municipio_id:
                dadosTecnico.municipio_id,
            municipio:
                obterRelacaoUnica(
                    dadosTecnico.municipio
                ),
            estado:
                obterRelacaoUnica(
                    dadosTecnico.estado
                ),
        };
    }

    throw new Error(
        "Tipo de perfil desconhecido."
    );
}

export async function atualizarPerfil(
    dadosAtualizados: Partial<PerfilUsuarioCompleto>
): Promise<PerfilUsuarioCompleto> {
    const {
        data: { user },
        error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
        throw new Error(
            "Usuário não autenticado."
        );
    }

    const {
        data: dadosUsuarioBase,
        error: erroUsuario,
    } = await supabase
        .from("usuarios")
        .select("tipo_perfil_id, email")
        .eq("id", user.id)
        .single();

    if (erroUsuario) {
        throw new Error(
            erroUsuario.message
        );
    }

    const tipoPerfilId = Number(
        dadosUsuarioBase.tipo_perfil_id
    );

    if (tipoPerfilId === 1) {
        throw new Error(
            "A edição de dados pessoais não está disponível para administradores."
        );
    }

    if (tipoPerfilId !== 2) {
        throw new Error(
            "Este perfil não pode ser editado."
        );
    }

    const dadosParaAtualizar = {
        nome:
            dadosAtualizados.nome,
        telefone:
            dadosAtualizados.telefone ||
            null,
        endereco:
            dadosAtualizados.endereco ||
            null,
        cpf:
            dadosAtualizados.cpf ||
            null,
        rg:
            dadosAtualizados.rg ||
            null,
        email_contato:
            dadosAtualizados.email_contato ||
            null,
        data_nascimento:
            dadosAtualizados.data_nascimento ||
            null,
        estado_id:
            dadosAtualizados.estado_id ||
            null,
        municipio_id:
            dadosAtualizados.municipio_id ||
            null,
    };

    const { error } = await supabase
        .from("tecnico")
        .update(
            dadosParaAtualizar
        )
        .eq("usuario_id", user.id);

    if (error) {
        throw new Error(error.message);
    }

    return obterPerfilLogado();
}

export async function atualizarSenha(
    novaSenha: string,
    senhaAtual?: string
): Promise<void> {
    if (novaSenha.length < 8) {
        throw new Error(
            "A nova senha deve possuir pelo menos 8 caracteres."
        );
    }

    const {
        data: { user },
        error: userError,
    } = await supabase.auth.getUser();

    if (
        userError ||
        !user ||
        !user.email
    ) {
        throw new Error(
            "Usuário não autenticado."
        );
    }

    if (senhaAtual) {
        const { error: loginError } =
            await supabase.auth.signInWithPassword(
                {
                    email: user.email,
                    password:
                        senhaAtual,
                }
            );

        if (loginError) {
            throw new Error(
                "A senha atual está incorreta."
            );
        }
    }

    const { error } =
        await supabase.auth.updateUser({
            password: novaSenha,
        });

    if (error) {
        console.error(
            "Erro ao atualizar senha:",
            error.message
        );

        if (
            error.message
                .toLocaleLowerCase(
                    "pt-BR"
                )
                .includes("same password")
        ) {
            throw new Error(
                "A nova senha deve ser diferente da senha atual."
            );
        }

        throw new Error(error.message);
    }
}