import { createContext, useContext, useEffect, useState } from "react";
import supabase from "../lib/supabase"; 

interface AuthContextType {
    user: any | null; 
    loading: boolean;
    isAdmin: boolean;
    isStaff: boolean;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Função interna para buscar os dados sem depender de arquivos externos
        const getSessionAndUser = async () => {
            try {
                // 1. Pega a sessão atual do cache do navegador instantaneamente
                const { data: { session }, error: sessionError } = await supabase.auth.getSession();
                
                if (sessionError || !session?.user) {
                    setUser(null);
                    setLoading(false);
                    return;
                }

                // 2. Busca o perfil do usuário no banco
                const { data: usuarioDb, error: dbError } = await supabase
                    .from('usuarios')
                    .select('*')
                    .eq('email', session.user.email)
                    .maybeSingle();

                if (dbError) {
                    console.error("Erro ao ler tabela usuarios:", dbError);
                }

                // 3. Monta o usuário e salva no estado
                setUser({
                    ...session.user,
                    bancoId: usuarioDb?.id,
                    tipo_perfil_id: usuarioDb?.tipo_perfil_id
                });
            } catch (error) {
                console.error("Erro fatal no AuthContext:", error);
                setUser(null);
            } finally {
                // GARANTIA: O loading sempre vai desligar!
                setLoading(false);
            }
        };

        // Chama a função ao carregar o app
        getSessionAndUser();

        // Escuta mudanças (ex: se o token expirar ou fizer logout)
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (session) {
                getSessionAndUser();
            } else {
                setUser(null);
                setLoading(false);
            }
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    const isAdmin = user?.tipo_perfil_id === 1;
    const isStaff = user?.tipo_perfil_id === 2 || user?.tipo_perfil_id === 1; 

    return (
        <AuthContext.Provider value={{ user, loading, isAdmin, isStaff }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);