import {
    Navigate,
    useLocation,
} from "react-router-dom";
import { Loader2 } from "lucide-react";
import {
    obterRotaInicialPorPerfil,
    useAuth,
} from "../../context/AuthContext";

interface ProtectedRouteProps {
    children: React.ReactNode;
    requireAdmin?: boolean;
    requireTecnico?: boolean;
    requireStaff?: boolean;
    requireCliente?: boolean;
}

const ProtectedRoute = ({
    children,
    requireAdmin = false,
    requireTecnico = false,
    requireStaff = false,
    requireCliente = false,
}: ProtectedRouteProps) => {
    const location = useLocation();

    const {
        user,
        loading,
        isAdmin,
        isTecnico,
        isCliente,
    } = useAuth();

    const precisaTecnico =
        requireTecnico ||
        requireStaff;

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />

                    <p className="text-sm font-medium text-muted-foreground">
                        Verificando acesso...
                    </p>
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <Navigate
                to="/login"
                replace
                state={{
                    from:
                        location.pathname,
                }}
            />
        );
    }

    const rotaCorreta =
        obterRotaInicialPorPerfil(
            user.tipo_perfil_id
        ) || "/";

    if (
        requireAdmin &&
        !isAdmin
    ) {
        return (
            <Navigate
                to={rotaCorreta}
                replace
            />
        );
    }

    if (
        precisaTecnico &&
        !isTecnico
    ) {
        return (
            <Navigate
                to={rotaCorreta}
                replace
            />
        );
    }

    if (
        requireCliente &&
        !isCliente
    ) {
        return (
            <Navigate
                to={rotaCorreta}
                replace
            />
        );
    }

    return <>{children}</>;
};

export default ProtectedRoute;