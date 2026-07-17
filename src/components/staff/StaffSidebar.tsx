import {
    NavLink,
    useNavigate,
} from "react-router-dom";
import {
    BookOpen,
    ChevronUp,
    ClipboardList,
    LayoutDashboard,
    Loader2,
    LogOut,
    Moon,
    Settings,
    Sun,
    UserCircle,
    Wallet,
    X,
} from "lucide-react";
import {
    useEffect,
    useState,
} from "react";
import { logoutUsuario } from "../../services/auth/auth-logout.service";
import { useTecnico } from "../../context/TecnicoContext";
import teccorpLogo from "../../assests/TECCORP LOGO/2.png";
import { obterIniciais } from "./staff.utils";

interface StaffSidebarProps {
    fecharMenu?: () => void;
}

const navItems = [
    {
        to: "/staff/dashboard",
        icon: LayoutDashboard,
        label: "Dashboard",
    },
    {
        to: "/staff/chamados",
        icon: ClipboardList,
        label: "Meus chamados",
    },
    {
        to: "/staff/adiantamentos",
        icon: Wallet,
        label: "Adiantamentos",
    },
    {
        to: "/staff/perfil",
        icon: UserCircle,
        label: "Meu perfil",
    },
    {
        to: "/staff/videos",
        icon: BookOpen,
        label: "Vídeos e aulas",
    },
];

const StaffSidebar = ({
    fecharMenu,
}: StaffSidebarProps) => {
    const navigate = useNavigate();

    const {
        tecnico,
        loadingTecnico,
    } = useTecnico();

    const [isDarkMode, setIsDarkMode] =
        useState(() => {
            return (
                localStorage.getItem(
                    "tema-sistema"
                ) === "dark"
            );
        });

    const [
        configuracoesAbertas,
        setConfiguracoesAbertas,
    ] = useState(false);

    const [isLoggingOut, setIsLoggingOut] =
        useState(false);

    useEffect(() => {
        const root =
            window.document.documentElement;

        root.classList.toggle(
            "dark",
            isDarkMode
        );

        localStorage.setItem(
            "tema-sistema",
            isDarkMode ? "dark" : "light"
        );
    }, [isDarkMode]);

    const handleNavClick = () => {
        fecharMenu?.();
    };

    const handleLogout = async () => {
        if (isLoggingOut) {
            return;
        }

        try {
            setIsLoggingOut(true);

            await logoutUsuario();

            fecharMenu?.();

            navigate("/staff/login", {
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

    return (
        <aside className="flex h-screen w-64 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground shadow-2xl lg:shadow-none">
            <div className="relative flex h-20 shrink-0 items-center justify-center border-b border-sidebar-border px-5">
                <img
                    src={teccorpLogo}
                    alt="Teccorp"
                    className="w-auto max-w-[175px] object-contain"
                />

                {fecharMenu && (
                    <button
                        type="button"
                        onClick={fecharMenu}
                        aria-label="Fechar menu"
                        className="absolute right-3 flex h-9 w-9 items-center justify-center rounded-lg text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground lg:hidden"
                    >
                        <X className="h-5 w-5" />
                    </button>
                )}
            </div>

            <div className="border-b border-sidebar-border px-3 py-4">
                <div className="flex items-center gap-3 rounded-xl bg-sidebar-accent/30 p-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sidebar-primary text-sm font-bold text-sidebar-primary-foreground">
                        {obterIniciais(
                            tecnico?.nome
                        )}
                    </div>

                    <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-sidebar-foreground">
                            {loadingTecnico
                                ? "Carregando..."
                                : tecnico?.nome ||
                                  "Técnico"}
                        </p>

                        <p className="truncate text-[11px] text-sidebar-foreground/50">
                            Portal do técnico
                        </p>
                    </div>
                </div>
            </div>

            <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-5">
                <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-sidebar-foreground/40">
                    Navegação
                </p>

                {navItems.map((item) => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        onClick={handleNavClick}
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

            <div className="mt-auto border-t border-sidebar-border p-3">
                {configuracoesAbertas && (
                    <div className="mb-2 rounded-xl border border-sidebar-border bg-sidebar-accent/20 p-3 shadow-lg">
                        <div className="mb-3">
                            <p className="text-xs font-bold text-sidebar-foreground">
                                Aparência
                            </p>

                            <p className="mt-0.5 text-[11px] text-sidebar-foreground/50">
                                Escolha o tema do sistema
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                            <button
                                type="button"
                                onClick={() =>
                                    setIsDarkMode(false)
                                }
                                className={`flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold transition-colors ${
                                    !isDarkMode
                                        ? "border-sidebar-primary bg-sidebar-primary text-sidebar-primary-foreground"
                                        : "border-sidebar-border bg-sidebar/50 text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                                }`}
                            >
                                <Sun className="h-4 w-4" />
                                Claro
                            </button>

                            <button
                                type="button"
                                onClick={() =>
                                    setIsDarkMode(true)
                                }
                                className={`flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold transition-colors ${
                                    isDarkMode
                                        ? "border-sidebar-primary bg-sidebar-primary text-sidebar-primary-foreground"
                                        : "border-sidebar-border bg-sidebar/50 text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                                }`}
                            >
                                <Moon className="h-4 w-4" />
                                Escuro
                            </button>
                        </div>
                    </div>
                )}

                <button
                    type="button"
                    onClick={() =>
                        setConfiguracoesAbertas(
                            (valor) => !valor
                        )
                    }
                    className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                        configuracoesAbertas
                            ? "bg-sidebar-accent text-sidebar-accent-foreground"
                            : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                    }`}
                >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-sidebar-accent/50">
                        <Settings className="h-4 w-4" />
                    </span>

                    <span className="flex-1 text-left">
                        Aparência
                    </span>

                    <ChevronUp
                        className={`h-4 w-4 transition-transform ${
                            configuracoesAbertas
                                ? "rotate-0"
                                : "rotate-180"
                        }`}
                    />
                </button>

                <div className="my-2 border-t border-sidebar-border" />

                <button
                    type="button"
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/15 hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-500/10">
                        {isLoggingOut ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <LogOut className="h-4 w-4" />
                        )}
                    </span>

                    <span>
                        {isLoggingOut
                            ? "Encerrando..."
                            : "Encerrar sessão"}
                    </span>
                </button>
            </div>
        </aside>
    );
};

export default StaffSidebar;