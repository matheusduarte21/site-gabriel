import {
    Navigate,
    useLocation,
} from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

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
        requireTecnico || requireStaff;

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-700" />

                    <p className="text-sm font-medium text-muted-foreground">
                        Verificando acesso...
                    </p>
                </div>
            </div>
        );
    }

    if (!user) {
        const loginPath = requireAdmin
            ? "/admin/login"
            : precisaTecnico
            ? "/staff/login"
            : requireCliente
            ? "/cliente/login"
            : "/";

        return (
            <Navigate
                to={loginPath}
                replace
                state={{
                    from: location.pathname,
                }}
            />
        );
    }

    if (requireAdmin && !isAdmin) {
        if (isTecnico) {
            return (
                <Navigate
                    to="/staff/dashboard"
                    replace
                />
            );
        }

        if (isCliente) {
            return (
                <Navigate
                    to="/cliente"
                    replace
                />
            );
        }

        return (
            <Navigate
                to="/admin/login"
                replace
            />
        );
    }

    if (precisaTecnico && !isTecnico) {
        if (isAdmin) {
            return (
                <Navigate
                    to="/admin"
                    replace
                />
            );
        }

        if (isCliente) {
            return (
                <Navigate
                    to="/cliente"
                    replace
                />
            );
        }

        return (
            <Navigate
                to="/staff/login"
                replace
            />
        );
    }

    if (requireCliente && !isCliente) {
        if (isAdmin) {
            return (
                <Navigate
                    to="/admin"
                    replace
                />
            );
        }

        if (isTecnico) {
            return (
                <Navigate
                    to="/staff/dashboard"
                    replace
                />
            );
        }

        return (
            <Navigate
                to="/cliente/login"
                replace
            />
        );
    }

    return <>{children}</>;
};

export default ProtectedRoute;