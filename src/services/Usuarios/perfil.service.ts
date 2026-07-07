import supabase from "../../lib/supabase";

export interface PerfilUsuarioCompleto {
    id: string;
    usuario_id: string; //
    nome: string;
    email: string;
    tipo_perfil_id: number;
    
    telefone?: string;
    endereco?: string;
    cpf?: string;
    rg?: string;
    email_contato?: string;
    estado_id?: number;
    municipio_id?: number;
    municipio?: { nome: string };
    estado?: { sigla: string; nome: string };
}

export async function obterPerfilLogado() {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
        throw new Error('Usuário não autenticado no sistema.');
    }

    const { data: dadosUsuarioBase, error: erroUsuarioBase } = await supabase
        .from('usuarios')
        .select('*')
        .eq('id', user.id)
        .single();

    if (erroUsuarioBase) {
        throw new Error(`Erro ao buscar usuário base: ${erroUsuarioBase.message}`);
    }

    if (dadosUsuarioBase.tipo_perfil_id === 1) {
        return {
            id: dadosUsuarioBase.id,
            usuario_id: dadosUsuarioBase.id,
            nome: "Administrador Sistema", 
            email: dadosUsuarioBase.email,
            tipo_perfil_id: dadosUsuarioBase.tipo_perfil_id,
            telefone: "-",
            endereco: "-",
            email_contato: dadosUsuarioBase.email,
        } as PerfilUsuarioCompleto;
    }

    if (dadosUsuarioBase.tipo_perfil_id === 2) {
        const { data: dadosTecnico, error: erroTecnico } = await supabase
            .from('tecnico')
            .select(`
                *,
                municipio ( nome ),
                estado ( sigla, nome )
            `)
            .eq('usuario_id', user.id)
            .maybeSingle(); 

        if (erroTecnico) {
            throw new Error(`Erro ao buscar dados do técnico: ${erroTecnico.message}`);
        }

        if (!dadosTecnico) {
            throw new Error('Perfil de técnico não encontrado para este usuário.');
        }

        return {
            ...dadosTecnico,
            email: dadosUsuarioBase.email,
            tipo_perfil_id: dadosUsuarioBase.tipo_perfil_id,
        } as PerfilUsuarioCompleto;
    }

    throw new Error('Tipo de perfil desconhecido.');
}

export async function atualizarPerfil(dadosAtualizados: Partial<PerfilUsuarioCompleto>) {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) throw new Error('Usuário não autenticado.');

    const { data: dadosUsuarioBase } = await supabase
        .from('usuarios')
        .select('tipo_perfil_id')
        .eq('id', user.id)
        .single();

    if (dadosUsuarioBase?.tipo_perfil_id === 1) {
        throw new Error('A edição de perfil não está disponível para Administradores.');
    }

    const { id, usuario_id, email, tipo_perfil_id, municipio, estado, ...dadosParaAtualizar } = dadosAtualizados as any;

    const { data, error } = await supabase
        .from('tecnico')
        .update(dadosParaAtualizar)
        .eq('usuario_id', user.id)
        .select()
        .single();

    if (error) {
        throw new Error(error.message);
    }

    return {
        ...data,
        email: dadosAtualizados.email,
        tipo_perfil_id: dadosAtualizados.tipo_perfil_id
    } as PerfilUsuarioCompleto;
}

export async function atualizarSenha(novaSenha: string) {
    const { error } = await supabase.auth.updateUser({
        password: novaSenha
    });

    if (error) {
        console.error("Erro ao atualizar senha:", error.message);
        throw new Error(error.message);
    }
}