import {
    NavLink,
    useNavigate,
} from "react-router-dom";
import {
    useEffect,
    useState,
} from "react";
import {
    ClipboardList,
    LayoutDashboard,
    LogOut,
    Moon,
    Sun,
    User2,
    UserCircle,
    Users,
    Wrench,
    X,
} from "lucide-react";
import { logoutUsuario } from "../../services/auth/auth-logout.service";
import teccorpLogo from "../../assests/TECCORP LOGO/2.png";

const navItems = [
    {
        to: "/admin",
        icon: LayoutDashboard,
        label: "Dashboard",
        end: true,
    },
    {
        to: "/admin/clientes",
        icon: Users,
        label: "Clientes",
    },
    {
        to: "/admin/tecnicos",
        icon: Wrench,
        label: "Técnicos",
    },
    {
        to: "/admin/chamados",
        icon: ClipboardList,
        label: "Chamados",
    },
    {
        to: "/admin/usuarios",
        icon: User2,
        label: "Usuários",
    },
    {
        to: "/admin/perfil",
        icon: UserCircle,
        label: "Perfil",
    },
];

interface AdminSidebarProps {
    fecharMenu?: () => void;
}

const AdminSidebar = ({
    fecharMenu,
}: AdminSidebarProps) => {
    const navigate = useNavigate();

    const [isDarkMode, setIsDarkMode] =
        useState(() => {
            const temaSalvo =
                localStorage.getItem(
                    "tema-sistema"
                );

            if (temaSalvo) {
                return temaSalvo === "dark";
            }

            return window.matchMedia(
                "(prefers-color-scheme: dark)"
            ).matches;
        });

    const [isLoggingOut, setIsLoggingOut] =
        useState(false);

    useEffect(() => {
        const root =
            window.document.documentElement;

        if (isDarkMode) {
            root.classList.add("dark");

            localStorage.setItem(
                "tema-sistema",
                "dark"
            );
        } else {
            root.classList.remove("dark");

            localStorage.setItem(
                "tema-sistema",
                "light"
            );
        }
    }, [isDarkMode]);

    const handleLogout = async () => {
        if (isLoggingOut) {
            return;
        }

        try {
            setIsLoggingOut(true);

            await logoutUsuario();

            fecharMenu?.();

            navigate("/admin/login", {
                replace: true,
            });
        } catch (error) {
            console.error(
                "Falha ao encerrar a sessão:",
                error
            );
        } finally {
            setIsLoggingOut(false);
        }
    };

    const alternarTema = () => {
        setIsDarkMode(
            (temaAtual) => !temaAtual
        );
    };

    return (
        <aside className="flex h-screen w-64 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground shadow-2xl lg:shadow-none">
            <div className="flex h-20 shrink-0 items-center justify-center border-b border-sidebar-border px-5">
                <div className="min-w-0">
                    <img
                        src={teccorpLogo}
                        alt="Teccorp"
                        className="w-auto max-w-[175px] object-cover"
                    />
                </div>

                {fecharMenu && (
                    <button
                        type="button"
                        onClick={fecharMenu}
                        aria-label="Fechar menu"
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground lg:hidden"
                    >
                        <X className="h-5 w-5" />
                    </button>
                )}
            </div>

            <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-5">
                <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-sidebar-foreground/40">
                    Navegação
                </p>

                {navItems.map((item) => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        end={item.end}
                        onClick={fecharMenu}
                        className={({ isActive }) =>
                            `group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                                isActive
                                    ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
                                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                            }`
                        }
                    >
                        {({ isActive }) => (
                            <>
                                <span
                                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors ${
                                        isActive
                                            ? "bg-sidebar-primary text-sidebar-primary-foreground"
                                            : "bg-sidebar-accent/40 text-sidebar-foreground/70 group-hover:bg-sidebar-accent group-hover:text-sidebar-accent-foreground"
                                    }`}
                                >
                                    <item.icon className="h-4 w-4" />
                                </span>

                                <span>
                                    {item.label}
                                </span>
                            </>
                        )}
                    </NavLink>
                ))}
            </nav>

            <div className="mt-auto border-t border-sidebar-border p-4">
                <div className="mb-3 rounded-xl border border-sidebar-border bg-sidebar-accent/20 p-3">
                    <div className="flex items-center gap-3">
                        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                            <UserCircle className="h-5 w-5" />
                        </span>

                        <div className="min-w-0">
                            <p className="truncate text-xs font-semibold text-sidebar-foreground">
                                Área administrativa
                            </p>

                            <p className="truncate text-[11px] text-sidebar-foreground/60">
                                Gestão Teccorp
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-1">
                    <button
                        type="button"
                        onClick={alternarTema}
                        className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                    >
                        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-sidebar-accent/40">
                            {isDarkMode ? (
                                <Sun className="h-4 w-4" />
                            ) : (
                                <Moon className="h-4 w-4" />
                            )}
                        </span>

                        {isDarkMode
                            ? "Modo claro"
                            : "Modo escuro"}
                    </button>

                    <button
                        type="button"
                        onClick={handleLogout}
                        disabled={isLoggingOut}
                        className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/15 hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-500/10">
                            <LogOut className="h-4 w-4" />
                        </span>

                        {isLoggingOut
                            ? "Saindo..."
                            : "Sair"}
                    </button>
                </div>
            </div>
        </aside>
    );
};

export default AdminSidebar;