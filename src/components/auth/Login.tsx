import {
    useEffect,
    useState,
} from "react";
import {
    Eye,
    EyeOff,
    Loader2,
    Lock,
    Mail,
    Moon,
    Sun,
} from "lucide-react";
import {
    useNavigate,
} from "react-router-dom";
import supabase from "../../lib/supabase";
import { getUsuarioSistemaAtual } from "../../services/auth/get-usuario-sistema-atual.service";
import {
    obterRotaInicialPorPerfil,
    useAuth,
} from "../../context/AuthContext";
import teccorpLogo from "../../assests/TECCORP LOGO/2.png";

const Login = () => {
    const navigate = useNavigate();

    const {
        user,
        loading: loadingAuth,
        rotaInicial,
    } = useAuth();

    const [email, setEmail] =
        useState("");

    const [password, setPassword] =
        useState("");

    const [
        mostrarSenha,
        setMostrarSenha,
    ] = useState(false);

    const [loading, setLoading] =
        useState(false);

    const [error, setError] =
        useState("");

    const [
        isDarkMode,
        setIsDarkMode,
    ] = useState(() => {
        return (
            localStorage.getItem(
                "tema-sistema"
            ) === "dark"
        );
    });

    useEffect(() => {
        const root =
            document.documentElement;

        root.classList.toggle(
            "dark",
            isDarkMode
        );

        localStorage.setItem(
            "tema-sistema",
            isDarkMode
                ? "dark"
                : "light"
        );
    }, [isDarkMode]);

    useEffect(() => {
        if (
            !loadingAuth &&
            user &&
            rotaInicial
        ) {
            navigate(rotaInicial, {
                replace: true,
            });
        }
    }, [
        loadingAuth,
        user,
        rotaInicial,
        navigate,
    ]);

    const handleLogin = async (
        event: React.FormEvent
    ) => {
        event.preventDefault();

        if (loading) {
            return;
        }

        try {
            setLoading(true);
            setError("");

            const {
                data,
                error: authError,
            } =
                await supabase.auth.signInWithPassword(
                    {
                        email: email
                            .trim()
                            .toLocaleLowerCase(),
                        password,
                    }
                );

            if (
                authError ||
                !data.user
            ) {
                setError(
                    "E-mail ou senha incorretos."
                );

                return;
            }

            const usuarioSistema =
                await getUsuarioSistemaAtual(
                    data.user
                );

            if (!usuarioSistema) {
                await supabase.auth.signOut();

                setError(
                    "Seu usuário não possui acesso ao sistema."
                );

                return;
            }

            const rota =
                obterRotaInicialPorPerfil(
                    Number(
                        usuarioSistema.tipo_perfil_id
                    )
                );

            if (!rota) {
                await supabase.auth.signOut();

                setError(
                    "O perfil deste usuário não está configurado corretamente."
                );

                return;
            }

            if (
                Number(
                    usuarioSistema.tipo_perfil_id
                ) === 2
            ) {
                const {
                    data: tecnico,
                    error: tecnicoError,
                } = await supabase
                    .from("tecnico")
                    .select("id")
                    .eq(
                        "usuario_id",
                        usuarioSistema.id
                    )
                    .maybeSingle();

                if (
                    tecnicoError ||
                    !tecnico
                ) {
                    await supabase.auth.signOut();

                    setError(
                        "Este usuário não possui um técnico vinculado."
                    );

                    return;
                }
            }

            navigate(rota, {
                replace: true,
            });
        } catch (error) {
            console.error(
                "Erro ao realizar login:",
                error
            );

            await supabase.auth.signOut();

            setError(
                "Não foi possível entrar no sistema."
            );
        } finally {
            setLoading(false);
        }
    };

    if (loadingAuth && user) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="relative flex min-h-screen items-center justify-center bg-background px-4 py-10">
            <button
                type="button"
                onClick={() =>
                    setIsDarkMode(
                        (valor) => !valor
                    )
                }
                aria-label={
                    isDarkMode
                        ? "Ativar tema claro"
                        : "Ativar tema escuro"
                }
                className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground shadow-sm transition-colors hover:bg-secondary hover:text-foreground sm:right-6 sm:top-6"
            >
                {isDarkMode ? (
                    <Sun className="h-5 w-5" />
                ) : (
                    <Moon className="h-5 w-5" />
                )}
            </button>

            <div className="w-full max-w-sm">
                <div className="mb-7 text-center">

                    <h1 className="mt-6 text-2xl font-bold text-foreground">
                        Acesso ao sistema
                    </h1>

                    <p className="mt-2 text-sm text-muted-foreground">
                        Entre com seu e-mail e senha.
                    </p>
                </div>

                <div className="rounded-2xl border border-border bg-card p-6 shadow-xl shadow-black/5 sm:p-7">
                    <form
                        onSubmit={handleLogin}
                        className="space-y-5"
                    >
                        {error && (
                            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
                                {error}
                            </div>
                        )}

                        <div className="space-y-1.5">
                            <label
                                htmlFor="login-email"
                                className="text-sm font-semibold text-foreground"
                            >
                                E-mail
                            </label>

                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />

                                <input
                                    id="login-email"
                                    type="email"
                                    required
                                    autoComplete="email"
                                    value={email}
                                    onChange={(
                                        event
                                    ) =>
                                        setEmail(
                                            event
                                                .target
                                                .value
                                        )
                                    }
                                    placeholder="seuemail@exemplo.com"
                                    className="h-11 w-full rounded-xl border border-border bg-background pl-10 pr-4 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/10"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label
                                htmlFor="login-password"
                                className="text-sm font-semibold text-foreground"
                            >
                                Senha
                            </label>

                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />

                                <input
                                    id="login-password"
                                    type={
                                        mostrarSenha
                                            ? "text"
                                            : "password"
                                    }
                                    required
                                    autoComplete="current-password"
                                    value={password}
                                    onChange={(
                                        event
                                    ) =>
                                        setPassword(
                                            event
                                                .target
                                                .value
                                        )
                                    }
                                    placeholder="••••••••"
                                    className="h-11 w-full rounded-xl border border-border bg-background pl-10 pr-11 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/10"
                                />

                                <button
                                    type="button"
                                    onClick={() =>
                                        setMostrarSenha(
                                            (valor) =>
                                                !valor
                                        )
                                    }
                                    aria-label={
                                        mostrarSenha
                                            ? "Ocultar senha"
                                            : "Mostrar senha"
                                    }
                                    className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground"
                                >
                                    {mostrarSenha ? (
                                        <EyeOff className="h-4 w-4" />
                                    ) : (
                                        <Eye className="h-4 w-4" />
                                    )}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-bold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {loading && (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            )}

                            {loading
                                ? "Entrando..."
                                : "Entrar"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login;