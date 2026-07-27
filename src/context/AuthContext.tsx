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

export type TipoPerfilSistema =
    | 1
    | 2
    | 3;

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
    rotaInicial: string | null;
    refreshUser: () => Promise<void>;
}

export const obterRotaInicialPorPerfil = (
    tipoPerfilId: number | null | undefined
): string | null => {
    const perfil = Number(tipoPerfilId);

    if (perfil === 1) {
        return "/admin";
    }

    if (perfil === 2) {
        return "/staff/dashboard";
    }

    if (perfil === 3) {
        return "/cliente";
    }

    return null;
};

const AuthContext =
    createContext<AuthContextType>(
        {} as AuthContextType
    );

export const AuthProvider = ({
    children,
}: {
    children: React.ReactNode;
}) => {
    const [user, setUser] =
        useState<UsuarioAutenticado | null>(
            null
        );

    const [loading, setLoading] =
        useState(true);

    const carregarUsuario = useCallback(
        async (authUser: User | null) => {
            if (!authUser) {
                setUser(null);
                setLoading(false);
                return;
            }

            try {
                const usuarioSistema =
                    await getUsuarioSistemaAtual(
                        authUser
                    );

                if (!usuarioSistema) {
                    setUser(null);
                    return;
                }

                const tipoPerfilId = Number(
                    usuarioSistema.tipo_perfil_id
                );

                let tecnicoId: string | null =
                    null;

                let tecnicoNome:
                    | string
                    | null = null;

                if (tipoPerfilId === 2) {
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

                    tecnicoId =
                        tecnico?.id ?? null;

                    tecnicoNome =
                        tecnico?.nome ?? null;
                }

                setUser({
                    ...authUser,
                    bancoId:
                        usuarioSistema.id,
                    tipo_perfil_id:
                        tipoPerfilId,
                    tecnicoId,
                    tecnicoNome,
                });
            } catch (error) {
                console.error(
                    "Erro ao carregar usuário:",
                    error
                );

                setUser(null);
            } finally {
                setLoading(false);
            }
        },
        []
    );

    const refreshUser =
        useCallback(async () => {
            try {
                setLoading(true);

                const {
                    data: {
                        user: authUser,
                    },
                    error,
                } =
                    await supabase.auth.getUser();

                if (error) {
                    throw error;
                }

                await carregarUsuario(
                    authUser
                );
            } catch (error) {
                console.error(
                    "Erro ao atualizar usuário:",
                    error
                );

                setUser(null);
                setLoading(false);
            }
        }, [carregarUsuario]);

    useEffect(() => {
        let ativo = true;

        const iniciarSessao =
            async () => {
                try {
                    setLoading(true);

                    const {
                        data: { session },
                        error,
                    } =
                        await supabase.auth.getSession();

                    if (error) {
                        throw error;
                    }

                    if (ativo) {
                        await carregarUsuario(
                            session?.user ??
                                null
                        );
                    }
                } catch (error) {
                    console.error(
                        "Erro ao recuperar sessão:",
                        error
                    );

                    if (ativo) {
                        setUser(null);
                        setLoading(false);
                    }
                }
            };

        void iniciarSessao();

        const {
            data: { subscription },
        } =
            supabase.auth.onAuthStateChange(
                (_event, session) => {
                    if (!ativo) {
                        return;
                    }

                    setLoading(true);

                    void carregarUsuario(
                        session?.user ??
                            null
                    );
                }
            );

        return () => {
            ativo = false;
            subscription.unsubscribe();
        };
    }, [carregarUsuario]);

    const isAdmin =
        Number(user?.tipo_perfil_id) ===
        1;

    const isTecnico =
        Number(user?.tipo_perfil_id) ===
        2;

    const isCliente =
        Number(user?.tipo_perfil_id) ===
        3;

    const isStaff = isTecnico;

    const rotaInicial =
        obterRotaInicialPorPerfil(
            user?.tipo_perfil_id
        );

    const value = useMemo(
        () => ({
            user,
            loading,
            isAdmin,
            isTecnico,
            isStaff,
            isCliente,
            rotaInicial,
            refreshUser,
        }),
        [
            user,
            loading,
            isAdmin,
            isTecnico,
            isStaff,
            isCliente,
            rotaInicial,
            refreshUser,
        ]
    );

    return (
        <AuthContext.Provider
            value={value}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () =>
    useContext(AuthContext);