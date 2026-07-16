import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from "react";
import type { User } from "@supabase/supabase-js";
import supabase from "../lib/supabase";
import { getUsuarioSistemaAtual } from "../services/auth/get-usuario-sistema-atual.service";

export type UsuarioAutenticado = User & {
    bancoId: string | null;
    tipo_perfil_id: number | null;
    tecnicoId: string | null;
    tecnicoNome: string | null;
};

interface AuthContextType {
    user: UsuarioAutenticado | null;
    loading: boolean;
    isAdmin: boolean;
    isTecnico: boolean;
    isStaff: boolean;
    isCliente: boolean;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>(
    {} as AuthContextType
);

export const AuthProvider = ({
    children,
}: {
    children: React.ReactNode;
}) => {
    const [user, setUser] =
        useState<UsuarioAutenticado | null>(null);

    const [loading, setLoading] = useState(true);

    const carregarUsuario = useCallback(
        async (authUser: User | null) => {
            if (!authUser) {
                setUser(null);
                setLoading(false);
                return;
            }

            try {
                const usuarioSistema =
                    await getUsuarioSistemaAtual(authUser);

                let tecnicoId: string | null = null;
                let tecnicoNome: string | null = null;

                if (
                    usuarioSistema &&
                    Number(
                        usuarioSistema.tipo_perfil_id
                    ) === 2
                ) {
                    const {
                        data: tecnico,
                        error: tecnicoError,
                    } = await supabase
                        .from("tecnico")
                        .select("id, nome")
                        .eq(
                            "usuario_id",
                            usuarioSistema.id
                        )
                        .maybeSingle();

                    if (tecnicoError) {
                        console.error(
                            "Erro ao buscar vínculo do técnico:",
                            tecnicoError.message
                        );
                    }

                    tecnicoId = tecnico?.id ?? null;
                    tecnicoNome = tecnico?.nome ?? null;
                }

                setUser({
                    ...authUser,
                    bancoId:
                        usuarioSistema?.id ?? null,
                    tipo_perfil_id:
                        usuarioSistema?.tipo_perfil_id ??
                        null,
                    tecnicoId,
                    tecnicoNome,
                });
            } catch (error) {
                console.error(
                    "Erro ao carregar perfil do usuário:",
                    error
                );

                setUser(null);
            } finally {
                setLoading(false);
            }
        },
        []
    );

    const refreshUser = useCallback(async () => {
        setLoading(true);

        const {
            data: { user: authUser },
            error,
        } = await supabase.auth.getUser();

        if (error) {
            console.error(
                "Erro ao atualizar usuário:",
                error.message
            );

            setUser(null);
            setLoading(false);
            return;
        }

        await carregarUsuario(authUser);
    }, [carregarUsuario]);

    useEffect(() => {
        const iniciarSessao = async () => {
            setLoading(true);

            const {
                data: { session },
                error,
            } = await supabase.auth.getSession();

            if (error) {
                console.error(
                    "Erro ao recuperar sessão:",
                    error.message
                );

                setUser(null);
                setLoading(false);
                return;
            }

            await carregarUsuario(
                session?.user ?? null
            );
        };

        iniciarSessao();

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange(
            (_event, session) => {
                setLoading(true);

                void carregarUsuario(
                    session?.user ?? null
                );
            }
        );

        return () => {
            subscription.unsubscribe();
        };
    }, [carregarUsuario]);

    const isAdmin =
        Number(user?.tipo_perfil_id) === 1;

    const isTecnico =
        Number(user?.tipo_perfil_id) === 2;

    const isCliente =
        Number(user?.tipo_perfil_id) === 3;

    const isStaff = isTecnico;

    const value = useMemo(
        () => ({
            user,
            loading,
            isAdmin,
            isTecnico,
            isStaff,
            isCliente,
            refreshUser,
        }),
        [
            user,
            loading,
            isAdmin,
            isTecnico,
            isStaff,
            isCliente,
            refreshUser,
        ]
    );

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () =>
    useContext(AuthContext);