import { useState } from "react";
import {
    Eye,
    EyeOff,
    Loader2,
    Lock,
    Mail,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import supabase from "../../lib/supabase";
import { getUsuarioSistemaAtual } from "../../services/auth/get-usuario-sistema-atual.service";
import teccorpLogo from "../../assests/TECCORP LOGO/2.png";
import { getTecnicoLogado } from "../../services/Tecnicos/get-tecnico-logado.service";

const StaffLogin = () => {
    const navigate = useNavigate();

    const [email, setEmail] =
        useState("");

    const [password, setPassword] =
        useState("");

    const [mostrarSenha, setMostrarSenha] =
        useState(false);

    const [error, setError] =
        useState<string | null>(null);

    const [loading, setLoading] =
        useState(false);

    const handleLogin = async (
        event: React.FormEvent
    ) => {
        event.preventDefault();

        if (loading) {
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const {
                data,
                error: authError,
            } =
                await supabase.auth.signInWithPassword(
                    {
                        email: email.trim(),
                        password,
                    }
                );

            if (authError || !data.user) {
                setError(
                    "E-mail ou senha incorretos."
                );
                return;
            }

            const usuario =
                await getUsuarioSistemaAtual(
                    data.user
                );

            if (
                !usuario ||
                Number(
                    usuario.tipo_perfil_id
                ) !== 2
            ) {
                await supabase.auth.signOut();

                setError(
                    "Este acesso é exclusivo para técnicos."
                );

                return;
            }

            await getTecnicoLogado();

            navigate("/staff/dashboard", {
                replace: true,
            });
        } catch (error) {
            console.error(
                "Erro no login do técnico:",
                error
            );

            const mensagem =
                error instanceof Error
                    ? error.message
                    : "Ocorreu um erro ao tentar entrar.";

            await supabase.auth.signOut();

            setError(mensagem);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
            <div className="w-full max-w-md">
                <div className="mb-6 text-center">
                    <img
                        src={teccorpLogo}
                        alt="Teccorp"
                        className="mx-auto h-auto w-[190px]"
                    />

                    <h1 className="mt-6 text-2xl font-bold text-slate-900">
                        Área do técnico
                    </h1>

                    <p className="mt-2 text-sm text-slate-500">
                        Acompanhe seus chamados, pagamentos e atendimentos.
                    </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/60 sm:p-8">
                    <div className="mb-6 flex items-center gap-3 rounded-xl border border-cyan-100 bg-cyan-50 p-4">
                        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-600 text-white">
                      
                        </span>

                        <div>
                            <p className="text-sm font-bold text-slate-900">
                                Portal do técnico
                            </p>

                            <p className="text-xs text-slate-500">
                                Utilize o seu e-mail e senha cadastrados.
                            </p>
                        </div>
                    </div>

                    <form
                        onSubmit={handleLogin}
                        className="space-y-5"
                    >
                        {error && (
                            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                                {error}
                            </div>
                        )}

                        <div className="space-y-1.5">
                            <label
                                htmlFor="staff-email"
                                className="text-sm font-semibold text-slate-700"
                            >
                                E-mail
                            </label>

                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

                                <input
                                    id="staff-email"
                                    type="email"
                                    value={email}
                                    onChange={(event) =>
                                        setEmail(
                                            event.target
                                                .value
                                        )
                                    }
                                    required
                                    autoComplete="email"
                                    placeholder="tecnico@teccorp.com.br"
                                    className="h-11 w-full rounded-lg border border-slate-300 bg-white pl-10 pr-4 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-cyan-600 focus:ring-2 focus:ring-cyan-600/10"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label
                                htmlFor="staff-password"
                                className="text-sm font-semibold text-slate-700"
                            >
                                Senha
                            </label>

                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

                                <input
                                    id="staff-password"
                                    type={
                                        mostrarSenha
                                            ? "text"
                                            : "password"
                                    }
                                    value={password}
                                    onChange={(event) =>
                                        setPassword(
                                            event.target
                                                .value
                                        )
                                    }
                                    required
                                    autoComplete="current-password"
                                    placeholder="••••••••"
                                    className="h-11 w-full rounded-lg border border-slate-300 bg-white pl-10 pr-11 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-cyan-600 focus:ring-2 focus:ring-cyan-600/10"
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
                                    className="absolute right-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-700"
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
                            className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-cyan-700 px-4 text-sm font-bold text-white shadow-sm transition-colors hover:bg-cyan-800 disabled:cursor-not-allowed disabled:opacity-60"
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

export default StaffLogin;