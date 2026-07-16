import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from "react";
import { useAuth } from "./AuthContext";
import { TecnicoLogado } from "../types/portal-tecnico.type";
import { getTecnicoLogado } from "../services/Tecnicos/get-tecnico-logado.service";

interface TecnicoContextType {
    tecnico: TecnicoLogado | null;
    loadingTecnico: boolean;
    erroTecnico: string | null;
    recarregarTecnico: () => Promise<void>;
}

const TecnicoContext =
    createContext<TecnicoContextType>(
        {} as TecnicoContextType
    );

export const TecnicoProvider = ({
    children,
}: {
    children: React.ReactNode;
}) => {
    const { user, isTecnico, loading } =
        useAuth();

    const [tecnico, setTecnico] =
        useState<TecnicoLogado | null>(null);

    const [loadingTecnico, setLoadingTecnico] =
        useState(true);

    const [erroTecnico, setErroTecnico] =
        useState<string | null>(null);

    const recarregarTecnico =
        useCallback(async () => {
            if (!user || !isTecnico) {
                setTecnico(null);
                setErroTecnico(null);
                setLoadingTecnico(false);
                return;
            }

            try {
                setLoadingTecnico(true);
                setErroTecnico(null);

                const dados =
                    await getTecnicoLogado();

                setTecnico(dados);
            } catch (error) {
                const mensagem =
                    error instanceof Error
                        ? error.message
                        : "Erro ao carregar técnico.";

                console.error(
                    "Erro no contexto do técnico:",
                    error
                );

                setTecnico(null);
                setErroTecnico(mensagem);
            } finally {
                setLoadingTecnico(false);
            }
        }, [user, isTecnico]);

    useEffect(() => {
        if (!loading) {
            void recarregarTecnico();
        }
    }, [loading, recarregarTecnico]);

    const value = useMemo(
        () => ({
            tecnico,
            loadingTecnico,
            erroTecnico,
            recarregarTecnico,
        }),
        [
            tecnico,
            loadingTecnico,
            erroTecnico,
            recarregarTecnico,
        ]
    );

    return (
        <TecnicoContext.Provider value={value}>
            {children}
        </TecnicoContext.Provider>
    );
};

export const useTecnico = () =>
    useContext(TecnicoContext);