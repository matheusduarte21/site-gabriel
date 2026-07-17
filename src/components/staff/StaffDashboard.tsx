import {
    ReactNode,
    useEffect,
    useMemo,
    useState,
} from "react";
import {
    AlertCircle,
    ArrowRight,
    CalendarDays,
    CheckCircle2,
    CircleDollarSign,
    ClipboardList,
    Clock3,
    MapPin,
    RefreshCw,
    Route,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useTecnico } from "../../context/TecnicoContext";
import { ChamadoTecnicoPortal } from "../../types/portal-tecnico.type";
import { getMeusChamados } from "../../services/Tecnicos/get-meus-chamados.service";
import StaffHeader from "./StaffHeader";
import {
    converterNumero,
    formatarData,
    formatarHorario,
    formatarMoeda,
    obterClasseStatusOficial,
    obterClasseStatusTecnico,
    obterDescricaoStatusOficial,
    obterDescricaoStatusTecnico,
    obterTimestampChamado,
} from "./staff.utils";

interface CardResumoProps {
    titulo: string;
    valor: string;
    descricao: string;
    icon: ReactNode;
    className: string;
}

const CardResumo = ({
    titulo,
    valor,
    descricao,
    icon,
    className,
}: CardResumoProps) => {
    return (
        <div className="rounded-xl border border-border bg-card p-4 shadow-sm transition-shadow hover:shadow-md sm:p-5">
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                        {titulo}
                    </p>

                    <p className="mt-2 text-2xl font-bold text-foreground">
                        {valor}
                    </p>

                    <p className="mt-1 text-xs text-muted-foreground">
                        {descricao}
                    </p>
                </div>

                <span
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${className}`}
                >
                    {icon}
                </span>
            </div>
        </div>
    );
};

const StaffDashboard = () => {
    const {
        tecnico,
        loadingTecnico,
        erroTecnico,
    } = useTecnico();

    const [chamados, setChamados] =
        useState<ChamadoTecnicoPortal[]>([]);

    const [loadingChamados, setLoadingChamados] =
        useState(true);

    const [
        erroChamados,
        setErroChamados,
    ] = useState<string | null>(null);

    const carregarChamados = async () => {
        try {
            setLoadingChamados(true);
            setErroChamados(null);

            const dados =
                await getMeusChamados();

            setChamados(dados);
        } catch (error) {
            const mensagem =
                error instanceof Error
                    ? error.message
                    : "Erro ao carregar chamados.";

            setErroChamados(mensagem);
        } finally {
            setLoadingChamados(false);
        }
    };

    useEffect(() => {
        if (tecnico) {
            void carregarChamados();
        } else if (!loadingTecnico) {
            setLoadingChamados(false);
        }
    }, [tecnico, loadingTecnico]);

    const resumo = useMemo(() => {
        const pendentesValidacao =
            chamados.filter(
                (chamado) =>
                    !chamado.acompanhamento ||
                    chamado.acompanhamento
                        .validacao === "pendente"
            ).length;

        const emAndamento = chamados.filter(
            (chamado) => {
                const codigo =
                    chamado.acompanhamento
                        ?.status_tecnico?.codigo;

                return [
                    "em_deslocamento",
                    "chegou_local",
                    "atendimento_iniciado",
                ].includes(codigo || "");
            }
        ).length;

        const finalizados = chamados.filter(
            (chamado) =>
                chamado.acompanhamento
                    ?.status_tecnico?.codigo ===
                "atendimento_finalizado"
        ).length;

        const totalReceber = chamados.reduce(
            (total, chamado) =>
                total +
                converterNumero(
                    chamado.valor_total_tecnico
                ),
            0
        );

        return {
            total: chamados.length,
            pendentesValidacao,
            emAndamento,
            finalizados,
            totalReceber,
        };
    }, [chamados]);

    const proximosChamados = useMemo(() => {
        const agora = Date.now();

        return chamados
            .filter(
                (chamado) =>
                    obterTimestampChamado(
                        chamado
                    ) >= agora
            )
            .sort(
                (a, b) =>
                    obterTimestampChamado(a) -
                    obterTimestampChamado(b)
            )
            .slice(0, 4);
    }, [chamados]);

    const aguardandoValidacao = useMemo(() => {
        return chamados
            .filter(
                (chamado) =>
                    !chamado.acompanhamento ||
                    chamado.acompanhamento
                        .validacao === "pendente"
            )
            .slice(0, 4);
    }, [chamados]);

    if (loadingTecnico) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <RefreshCw className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (erroTecnico || !tecnico) {
        return (
            <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-red-700">
                {erroTecnico ||
                    "Técnico não encontrado."}
            </div>
        );
    }

    return (
        <div>
            <StaffHeader
                title={`Olá, ${tecnico.nome}`}
                subtitle="Acompanhe seus atendimentos, valores e atividades."
                action={
                    <Link
                        to="/staff/chamados"
                        className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary/90"
                    >
                        Ver chamados
                        <ArrowRight className="h-4 w-4" />
                    </Link>
                }
            />

            {erroChamados && (
                <div className="mb-6 flex flex-col gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-start gap-3">
                        <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />

                        <p className="text-sm">
                            {erroChamados}
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() =>
                            void carregarChamados()
                        }
                        className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-red-200 bg-white px-3 text-sm font-semibold hover:bg-red-100"
                    >
                        <RefreshCw className="h-4 w-4" />
                        Tentar novamente
                    </button>
                </div>
            )}

            <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
                <CardResumo
                    titulo="Chamados"
                    valor={
                        loadingChamados
                            ? "..."
                            : String(resumo.total)
                    }
                    descricao="Total atribuído a você"
                    icon={
                        <ClipboardList className="h-5 w-5" />
                    }
                    className="bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300"
                />

                <CardResumo
                    titulo="Validar"
                    valor={
                        loadingChamados
                            ? "..."
                            : String(
                                  resumo.pendentesValidacao
                              )
                    }
                    descricao="Aguardando sua confirmação"
                    icon={
                        <Clock3 className="h-5 w-5" />
                    }
                    className="bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300"
                />

                <CardResumo
                    titulo="Em andamento"
                    valor={
                        loadingChamados
                            ? "..."
                            : String(
                                  resumo.emAndamento
                              )
                    }
                    descricao="Atendimentos ativos"
                    icon={
                        <Route className="h-5 w-5" />
                    }
                    className="bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300"
                />

                <CardResumo
                    titulo="Finalizados"
                    valor={
                        loadingChamados
                            ? "..."
                            : String(
                                  resumo.finalizados
                              )
                    }
                    descricao="Atendimentos concluídos"
                    icon={
                        <CheckCircle2 className="h-5 w-5" />
                    }
                    className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                />

                <CardResumo
                    titulo="Valor previsto"
                    valor={
                        loadingChamados
                            ? "..."
                            : formatarMoeda(
                                  resumo.totalReceber
                              )
                    }
                    descricao="Total dos seus chamados"
                    icon={
                        <CircleDollarSign className="h-5 w-5" />
                    }
                    className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                />
            </section>

            <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-2">
                <section className="rounded-xl border border-border bg-card shadow-sm">
                    <div className="flex items-center justify-between border-b border-border p-5">
                        <div>
                            <h3 className="font-bold text-foreground">
                                Próximos atendimentos
                            </h3>

                            <p className="mt-1 text-xs text-muted-foreground">
                                Chamados agendados para os próximos dias
                            </p>
                        </div>

                        <CalendarDays className="h-5 w-5 text-primary" />
                    </div>

                    <div className="divide-y divide-border">
                        {loadingChamados ? (
                            <div className="p-6 text-center text-sm text-muted-foreground">
                                Carregando chamados...
                            </div>
                        ) : proximosChamados.length ===
                          0 ? (
                            <div className="p-6 text-center text-sm text-muted-foreground">
                                Nenhum atendimento futuro encontrado.
                            </div>
                        ) : (
                            proximosChamados.map(
                                (chamado) => (
                                    <div
                                        key={chamado.id}
                                        className="p-5"
                                    >
                                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                            <div className="min-w-0">
                                                <p className="font-bold text-foreground">
                                                    Chamado{" "}
                                                    {
                                                        chamado.numero_chamado
                                                    }
                                                </p>

                                                <p className="mt-1 truncate text-sm text-muted-foreground">
                                                    {chamado.empresa ||
                                                        chamado.cliente
                                                            ?.nome ||
                                                        "Empresa não informada"}
                                                </p>
                                            </div>

                                            <span
                                                className={`w-fit rounded-full border px-2.5 py-1 text-xs font-bold ${obterClasseStatusOficial(
                                                    obterDescricaoStatusOficial(
                                                        chamado
                                                    )
                                                )}`}
                                            >
                                                {obterDescricaoStatusOficial(
                                                    chamado
                                                )}
                                            </span>
                                        </div>

                                        <div className="mt-4 grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
                                            <div className="flex items-center gap-2">
                                                <CalendarDays className="h-4 w-4 shrink-0" />
                                                {formatarData(
                                                    chamado.data_agendamento
                                                )}
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <Clock3 className="h-4 w-4 shrink-0" />
                                                {formatarHorario(
                                                    chamado.hora_agendamento
                                                )}
                                            </div>

                                            <div className="flex items-center gap-2 sm:col-span-2">
                                                <MapPin className="h-4 w-4 shrink-0" />

                                                <span className="truncate">
                                                    {chamado.endereco ||
                                                        "Endereço não informado"}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                )
                            )
                        )}
                    </div>

                    <div className="border-t border-border p-4">
                        <Link
                            to="/staff/chamados"
                            className="flex items-center justify-center gap-2 text-sm font-bold text-primary hover:underline"
                        >
                            Ver todos os chamados
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>
                </section>

                <section className="rounded-xl border border-border bg-card shadow-sm">
                    <div className="flex items-center justify-between border-b border-border p-5">
                        <div>
                            <h3 className="font-bold text-foreground">
                                Aguardando validação
                            </h3>

                            <p className="mt-1 text-xs text-muted-foreground">
                                Confirme se concorda com os dados
                            </p>
                        </div>

                        <Clock3 className="h-5 w-5 text-amber-600" />
                    </div>

                    <div className="divide-y divide-border">
                        {loadingChamados ? (
                            <div className="p-6 text-center text-sm text-muted-foreground">
                                Carregando chamados...
                            </div>
                        ) : aguardandoValidacao.length ===
                          0 ? (
                            <div className="p-6 text-center text-sm text-muted-foreground">
                                Nenhum chamado aguardando validação.
                            </div>
                        ) : (
                            aguardandoValidacao.map(
                                (chamado) => (
                                    <div
                                        key={chamado.id}
                                        className="p-5"
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="min-w-0">
                                                <p className="font-bold text-foreground">
                                                    Chamado{" "}
                                                    {
                                                        chamado.numero_chamado
                                                    }
                                                </p>

                                                <p className="mt-1 truncate text-sm text-muted-foreground">
                                                    {chamado.empresa ||
                                                        chamado.cliente
                                                            ?.nome ||
                                                        "Empresa não informada"}
                                                </p>
                                            </div>

                                            <span
                                                className={`shrink-0 rounded-full border px-2.5 py-1 text-xs font-bold ${obterClasseStatusTecnico(
                                                    chamado
                                                        .acompanhamento
                                                        ?.status_tecnico
                                                        ?.codigo
                                                )}`}
                                            >
                                                {obterDescricaoStatusTecnico(
                                                    chamado
                                                )}
                                            </span>
                                        </div>

                                        <div className="mt-4 flex items-center justify-between gap-3">
                                            <div>
                                                <p className="text-xs text-muted-foreground">
                                                    Valor previsto
                                                </p>

                                                <p className="font-bold text-emerald-700 dark:text-emerald-300">
                                                    {formatarMoeda(
                                                        chamado.valor_total_tecnico
                                                    )}
                                                </p>
                                            </div>

                                            <Link
                                                to="/staff/chamados"
                                                className="inline-flex h-9 items-center justify-center rounded-lg bg-primary px-3 text-xs font-bold text-primary-foreground hover:bg-primary/90"
                                            >
                                                Validar
                                            </Link>
                                        </div>
                                    </div>
                                )
                            )
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
};

export default StaffDashboard;