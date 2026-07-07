import supabase from "../../lib/supabase"; 

export async function getCurrentUser() {
    try {
        console.log("A. [Service] Buscando sessão local...");
        
        // Trocamos getUser() por getSession() - muito mais rápido e não trava a tela
        const { data: { session }, error: authError } = await supabase.auth.getSession();

        if (authError || !session?.user) {
            console.log("B. [Service] Usuário não está logado no Auth.");
            return null;
        }

        const user = session.user;
        console.log(`C. [Service] Auth encontrado para: ${user.email}. Buscando no BD...`);

        if (!user.email) return null; // Trava de segurança

        const { data: usuarioDb, error: dbError } = await supabase
            .from('usuarios')
            .select('*')
            .eq('email', user.email)
            .maybeSingle(); // Troca crucial: maybeSingle não dá erro fatal se não achar o usuário

        if (dbError) {
            console.error("Erro ao buscar dados na tabela usuarios:", dbError.message);
        }

        console.log("D. [Service] Perfil do banco carregado com sucesso!");

        return {
            ...user, 
            bancoId: usuarioDb?.id, 
            tipo_perfil_id: usuarioDb?.tipo_perfil_id
        };
    } catch (error) {
        console.error("Erro inesperado e fatal ao buscar usuário:", error);
        return null;
    }
}