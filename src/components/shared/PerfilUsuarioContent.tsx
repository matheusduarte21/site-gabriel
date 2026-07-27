import {
    useEffect,
    useMemo,
    useState,
} from "react";
import type {
    FormEvent,
    ReactNode,
} from "react";
import {
    AtSign,
    CalendarDays,
    CreditCard,
    Eye,
    EyeOff,
    FileText,
    Loader2,
    LockKeyhole,
    MapPin,
    Phone,
    RefreshCw,
    ShieldCheck,
    UserCircle,
} from "lucide-react";
import toast from "react-hot-toast";import { atualizarSenha, obterPerfilLogado, PerfilUsuarioCompleto } from "../../services/Tipo_perfil/perfil.service";


interface CampoPerfilProps {
    label: string;
    value: string;
    icon: ReactNode;
}

interface CampoSenhaProps {
    id: string;
    label: string;
    value: string;
    visible: boolean;
    placeholder: string;
    autoComplete: string;
    onChange: (
        value: string
    ) => void;
    onToggle: () => void;
}

const formatarData = (
    valor: string | null | undefined
): string => {
    if (!valor) {
        return "Não informada";
    }

    const data = valor.split("T")[0];
    const partes = data.split("-");

    if (partes.length !== 3) {
        return valor;
    }

    const [ano, mes, dia] =
        partes;

    return `${dia}/${mes}/${ano}`;
};

const obterIniciais = (
    nome: string
): string => {
    const partes = nome
        .trim()
        .split(/\s+/)
        .filter(Boolean);

    if (partes.length === 0) {
        return "TC";
    }

    if (partes.length === 1) {
        return partes[0]
            .slice(0, 2)
            .toUpperCase();
    }

    return `${partes[0][0]}${
        partes[
            partes.length - 1
        ][0]
    }`.toUpperCase();
};

const obterNomePerfil = (
    tipoPerfilId: number
): string => {
    if (tipoPerfilId === 1) {
        return "Administrador";
    }

    if (tipoPerfilId === 2) {
        return "Técnico";
    }

    if (tipoPerfilId === 3) {
        return "Empresa";
    }

    return "Usuário";
};

const CampoPerfil = ({
    label,
    value,
    icon,
}: CampoPerfilProps) => {
    return (
        <div className="flex min-h-[86px] items-start gap-3 rounded-xl border border-border bg-background p-4">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                {icon}
            </span>

            <div className="min-w-0">
                <p className="text-xs font-medium text-muted-foreground">
                    {label}
                </p>

                <p className="mt-1 break-words text-sm font-bold text-foreground">
                    {value ||
                        "Não informado"}
                </p>
            </div>
        </div>
    );
};

const CampoSenha = ({
    id,
    label,
    value,
    visible,
    placeholder,
    autoComplete,
    onChange,
    onToggle,
}: CampoSenhaProps) => {
    return (
        <div className="space-y-1.5">
            <label
                htmlFor={id}
                className="text-sm font-semibold text-foreground"
            >
                {label}
            </label>

            <div className="relative">
                <LockKeyhole className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />

                <input
                    id={id}
                    type={
                        visible
                            ? "text"
                            : "password"
                    }
                    required
                    value={value}
                    onChange={(event) =>
                        onChange(
                            event.target
                                .value
                        )
                    }
                    autoComplete={
                        autoComplete
                    }
                    placeholder={
                        placeholder
                    }
                    className="h-11 w-full rounded-xl border border-border bg-background pl-10 pr-11 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/10"
                />

                <button
                    type="button"
                    onClick={onToggle}
                    aria-label={
                        visible
                            ? "Ocultar senha"
                            : "Mostrar senha"
                    }
                    className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                >
                    {visible ? (
                        <EyeOff className="h-4 w-4" />
                    ) : (
                        <Eye className="h-4 w-4" />
                    )}
                </button>
            </div>
        </div>
    );
};

const PerfilUsuarioContent = () => {
    const [
        perfil,
        setPerfil,
    ] =
        useState<PerfilUsuarioCompleto | null>(
            null
        );

    const [loading, setLoading] =
        useState(true);

    const [erro, setErro] =
        useState<string | null>(null);

    const [
        senhaAtual,
        setSenhaAtual,
    ] = useState("");

    const [
        novaSenha,
        setNovaSenha,
    ] = useState("");

    const [
        confirmarSenha,
        setConfirmarSenha,
    ] = useState("");

    const [
        mostrarSenhaAtual,
        setMostrarSenhaAtual,
    ] = useState(false);

    const [
        mostrarNovaSenha,
        setMostrarNovaSenha,
    ] = useState(false);

    const [
        mostrarConfirmacao,
        setMostrarConfirmacao,
    ] = useState(false);

    const [
        alterandoSenha,
        setAlterandoSenha,
    ] = useState(false);

    const carregarPerfil =
        async () => {
            try {
                setLoading(true);
                setErro(null);

                const dados =
                    await obterPerfilLogado();

                setPerfil(dados);
            } catch (error) {
                setErro(
                    error instanceof Error
                        ? error.message
                        : "Erro ao carregar perfil."
                );
            } finally {
                setLoading(false);
            }
        };

    useEffect(() => {
        void carregarPerfil();
    }, []);

    const localizacao =
        useMemo(() => {
            if (!perfil) {
                return "";
            }

            return [
                perfil.municipio
                    ?.nome,
                perfil.estado?.sigla ||
                    perfil.estado?.nome,
            ]
                .filter(Boolean)
                .join(" - ");
        }, [perfil]);

    const handleAlterarSenha =
        async (
            event: FormEvent
        ) => {
            event.preventDefault();

            if (!senhaAtual) {
                toast.error(
                    "Informe sua senha atual."
                );

                return;
            }

            if (
                novaSenha.length < 8
            ) {
                toast.error(
                    "A nova senha deve possuir pelo menos 8 caracteres."
                );

                return;
            }

            if (
                novaSenha !==
                confirmarSenha
            ) {
                toast.error(
                    "As novas senhas não coincidem."
                );

                return;
            }

            if (
                senhaAtual === novaSenha
            ) {
                toast.error(
                    "A nova senha deve ser diferente da senha atual."
                );

                return;
            }

            try {
                setAlterandoSenha(true);

                await atualizarSenha(
                    novaSenha,
                    senhaAtual
                );

                setSenhaAtual("");
                setNovaSenha("");
                setConfirmarSenha("");

                toast.success(
                    "Senha alterada com sucesso."
                );
            } catch (error) {
                toast.error(
                    error instanceof Error
                        ? error.message
                        : "Erro ao alterar senha."
                );
            } finally {
                setAlterandoSenha(
                    false
                );
            }
        };

    if (loading) {
        return (
            <div className="flex min-h-[400px] items-center justify-center rounded-xl border border-border bg-card">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />

                    <p className="text-sm text-muted-foreground">
                        Carregando perfil...
                    </p>
                </div>
            </div>
        );
    }

    if (erro || !perfil) {
        return (
            <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
                <p className="font-bold">
                    Não foi possível carregar o perfil
                </p>

                <p className="mt-2 text-sm">
                    {erro ||
                        "Perfil não encontrado."}
                </p>

                <button
                    type="button"
                    onClick={() =>
                        void carregarPerfil()
                    }
                    className="mt-4 inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-red-200 bg-white px-4 text-sm font-bold text-red-700 hover:bg-red-100 dark:bg-red-950"
                >
                    <RefreshCw className="h-4 w-4" />
                    Tentar novamente
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <section className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
                <div className="bg-gradient-to-r from-blue-800 via-blue-700 to-indigo-700 p-6 text-white sm:p-8">
                    <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
                        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full border-4 border-white/20 bg-white/15 text-2xl font-bold">
                            {obterIniciais(
                                perfil.nome
                            )}
                        </div>

                        <div className="min-w-0">
                            <h2 className="break-words text-2xl font-bold">
                                {perfil.nome}
                            </h2>

                            <p className="mt-1 text-sm text-blue-100">
                                {obterNomePerfil(
                                    perfil.tipo_perfil_id
                                )}{" "}
                                Teccorp
                            </p>

                            <p className="mt-1 break-all text-xs text-blue-100/80">
                                {perfil.email}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="p-4 sm:p-6">
                    <div className="mb-5">
                        <h3 className="text-lg font-bold text-foreground">
                            Informações pessoais
                        </h3>

                        <p className="mt-1 text-sm text-muted-foreground">
                            Consulte os dados vinculados ao seu usuário.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <CampoPerfil
                            label="E-mail de acesso"
                            value={
                                perfil.email
                            }
                            icon={
                                <AtSign className="h-5 w-5" />
                            }
                        />

                        <CampoPerfil
                            label="E-mail de contato"
                            value={
                                perfil.email_contato ||
                                perfil.email
                            }
                            icon={
                                <AtSign className="h-5 w-5" />
                            }
                        />

                        <CampoPerfil
                            label="Telefone"
                            value={
                                perfil.telefone ||
                                "Não informado"
                            }
                            icon={
                                <Phone className="h-5 w-5" />
                            }
                        />

                        <CampoPerfil
                            label="Data de nascimento"
                            value={formatarData(
                                perfil.data_nascimento
                            )}
                            icon={
                                <CalendarDays className="h-5 w-5" />
                            }
                        />

                        <CampoPerfil
                            label="CPF"
                            value={
                                perfil.cpf ||
                                "Não informado"
                            }
                            icon={
                                <CreditCard className="h-5 w-5" />
                            }
                        />

                        <CampoPerfil
                            label="RG"
                            value={
                                perfil.rg ||
                                "Não informado"
                            }
                            icon={
                                <FileText className="h-5 w-5" />
                            }
                        />

                        <CampoPerfil
                            label="Localização"
                            value={
                                localizacao ||
                                "Não informada"
                            }
                            icon={
                                <MapPin className="h-5 w-5" />
                            }
                        />

                        <CampoPerfil
                            label="Endereço"
                            value={
                                perfil.endereco ||
                                "Não informado"
                            }
                            icon={
                                <UserCircle className="h-5 w-5" />
                            }
                        />
                    </div>
                </div>
            </section>

            <section className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
                <div className="flex items-start gap-4 border-b border-border p-5 sm:p-6">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                        <ShieldCheck className="h-5 w-5" />
                    </span>

                    <div>
                        <h3 className="text-lg font-bold text-foreground">
                            Segurança da conta
                        </h3>

                        <p className="mt-1 text-sm text-muted-foreground">
                            Altere sua senha de acesso ao sistema.
                        </p>
                    </div>
                </div>

                <form
                    onSubmit={
                        handleAlterarSenha
                    }
                    className="p-5 sm:p-6"
                >
                    <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
                        <CampoSenha
                            id="senha-atual"
                            label="Senha atual"
                            value={senhaAtual}
                            visible={
                                mostrarSenhaAtual
                            }
                            placeholder="Digite sua senha atual"
                            autoComplete="current-password"
                            onChange={
                                setSenhaAtual
                            }
                            onToggle={() =>
                                setMostrarSenhaAtual(
                                    (valor) =>
                                        !valor
                                )
                            }
                        />

                        <CampoSenha
                            id="nova-senha"
                            label="Nova senha"
                            value={novaSenha}
                            visible={
                                mostrarNovaSenha
                            }
                            placeholder="Mínimo de 8 caracteres"
                            autoComplete="new-password"
                            onChange={
                                setNovaSenha
                            }
                            onToggle={() =>
                                setMostrarNovaSenha(
                                    (valor) =>
                                        !valor
                                )
                            }
                        />

                        <CampoSenha
                            id="confirmar-senha"
                            label="Confirmar nova senha"
                            value={
                                confirmarSenha
                            }
                            visible={
                                mostrarConfirmacao
                            }
                            placeholder="Repita a nova senha"
                            autoComplete="new-password"
                            onChange={
                                setConfirmarSenha
                            }
                            onToggle={() =>
                                setMostrarConfirmacao(
                                    (valor) =>
                                        !valor
                                )
                            }
                        />
                    </div>

                    <div className="mt-5 flex flex-col gap-4 rounded-xl border border-border bg-secondary/30 p-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <p className="text-sm font-semibold text-foreground">
                                Requisitos da senha
                            </p>

                            <p className="mt-1 text-xs leading-5 text-muted-foreground">
                                Utilize pelo menos 8 caracteres e não repita sua senha atual.
                            </p>
                        </div>

                        <button
                            type="submit"
                            disabled={
                                alterandoSenha
                            }
                            className="inline-flex h-11 w-full shrink-0 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                        >
                            {alterandoSenha ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <LockKeyhole className="h-4 w-4" />
                            )}

                            {alterandoSenha
                                ? "Alterando..."
                                : "Alterar senha"}
                        </button>
                    </div>
                </form>
            </section>
        </div>
    );
};

export default PerfilUsuarioContent;