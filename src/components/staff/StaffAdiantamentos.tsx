import {
    ReactNode,
    useEffect,
    useMemo,
    useState,
} from "react";
import {
    AlertCircle,
    Banknote,
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    Clock3,
    ExternalLink,
    Loader2,
    RefreshCw,
    Wallet,
    X,
} from "lucide-react";
import toast from "react-hot-toast";
import {
    AdiantamentoTecnico,
    StatusAdiantamento,
} from "../../types/portal-tecnico.type";
import { getMeusAdiantamentos } from "../../services/Tecnicos/get-meus-adiantamentos.service";
import { confirmarAdiantamentoTecnico } from "../../services/Tecnicos/confirmar-adiantamento.service";
import StaffHeader from "./StaffHeader";
import {
    converterNumero,
    formatarData,
    formatarMoeda,
} from "./staff.utils";

interface CardResumoProps {
    titulo: string;
    valor: string;
    icon: ReactNode;
    className: string;
}

interface PaginacaoProps {
    paginaAtual: number;
    totalPaginas: number;
    totalRegistros: number;
    inicioRegistro: number;
    fimRegistro: number;
    onChange: (pagina: number) => void;
}

const ITENS_POR_PAGINA = 5;

const CardResumo = ({
    titulo,
    valor,
    icon,
    className,
}: CardResumoProps) => {
    return (
        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
            <div className="flex items-center justify-between gap-3">
                <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                        {titulo}
                    </p>

                    <p className="mt-2 text-xl font-bold text-foreground">
                        {valor}
                    </p>
                </div>

                <span
                    className={`flex h-10 w-10 items-center justify-center rounded-xl ${className}`}
                >
                    {icon}
                </span>
            </div>
        </div>
    );
};

const Paginacao = ({
    paginaAtual,
    totalPaginas,
    totalRegistros,
    inicioRegistro,
    fimRegistro,
    onChange,
}: PaginacaoProps) => {
    if (
        totalRegistros === 0 ||
        totalPaginas <= 1
    ) {
        return null;
    }

    const paginasVisiveis = Array.from(
        {
            length: totalPaginas,
        },
        (_, index) => index + 1
    ).filter((pagina) => {
        if (totalPaginas <= 5) {
            return true;
        }

        if (
            pagina === 1 ||
            pagina === totalPaginas
        ) {
            return true;
        }

        return (
            pagina >= paginaAtual - 1 &&
            pagina <= paginaAtual + 1
        );
    });

    return (
        <div className="mt-6 flex flex-col gap-4 rounded-xl border border-border bg-card p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
            <p className="text-center text-xs text-muted-foreground sm:text-left sm:text-sm">
                Mostrando{" "}
                <span className="font-bold text-foreground">
                    {inicioRegistro}
                </span>{" "}
                até{" "}
                <span className="font-bold text-foreground">
                    {fimRegistro}
                </span>{" "}
                de{" "}
                <span className="font-bold text-foreground">
                    {totalRegistros}
                </span>{" "}
                adiantamentos
            </p>

            <div className="flex items-center justify-center gap-1">
                <button
                    type="button"
                    onClick={() =>
                        onChange(
                            paginaAtual - 1
                        )
                    }
                    disabled={paginaAtual === 1}
                    aria-label="Página anterior"
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
                >
                    <ChevronLeft className="h-4 w-4" />
                </button>

                {paginasVisiveis.map(
                    (pagina, index) => {
                        const paginaAnterior =
                            paginasVisiveis[
                                index - 1
                            ];

                        const exibirSeparador =
                            paginaAnterior &&
                            pagina -
                                paginaAnterior >
                                1;

                        return (
                            <div
                                key={pagina}
                                className="flex items-center gap-1"
                            >
                                {exibirSeparador && (
                                    <span className="px-1 text-xs text-muted-foreground">
                                        ...
                                    </span>
                                )}

                                <button
                                    type="button"
                                    onClick={() =>
                                        onChange(
                                            pagina
                                        )
                                    }
                                    aria-current={
                                        pagina ===
                                        paginaAtual
                                            ? "page"
                                            : undefined
                                    }
                                    className={`flex h-9 min-w-9 items-center justify-center rounded-lg px-2 text-xs font-bold transition-colors ${
                                        pagina ===
                                        paginaAtual
                                            ? "bg-primary text-primary-foreground shadow-sm"
                                            : "border border-border bg-background text-muted-foreground hover:bg-secondary hover:text-foreground"
                                    }`}
                                >
                                    {pagina}
                                </button>
                            </div>
                        );
                    }
                )}

                <button
                    type="button"
                    onClick={() =>
                        onChange(
                            paginaAtual + 1
                        )
                    }
                    disabled={
                        paginaAtual ===
                        totalPaginas
                    }
                    aria-label="Próxima página"
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
                >
                    <ChevronRight className="h-4 w-4" />
                </button>
            </div>
        </div>
    );
};

const obterClasseStatus = (
    status: StatusAdiantamento
): string => {
    if (status === "pago") {
        return "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300";
    }

    if (status === "aprovado") {
        return "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-300";
    }

    if (
        status === "reprovado" ||
        status === "cancelado"
    ) {
        return "border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300";
    }

    return "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300";
};

const StaffAdiantamentos = () => {
    const [
        adiantamentos,
        setAdiantamentos,
    ] = useState<AdiantamentoTecnico[]>([]);

    const [loading, setLoading] =
        useState(true);

    const [erro, setErro] =
        useState<string | null>(null);

    const [
        processandoId,
        setProcessandoId,
    ] = useState<string | null>(null);

    const [
        divergenciaId,
        setDivergenciaId,
    ] = useState<string | null>(null);

    const [
        observacaoDivergencia,
        setObservacaoDivergencia,
    ] = useState("");

    const [
        paginaAtual,
        setPaginaAtual,
    ] = useState(1);

    const carregarAdiantamentos =
        async () => {
            try {
                setLoading(true);
                setErro(null);

                const dados =
                    await getMeusAdiantamentos();

                setAdiantamentos(dados);
            } catch (error) {
                setErro(
                    error instanceof Error
                        ? error.message
                        : "Erro ao carregar adiantamentos."
                );
            } finally {
                setLoading(false);
            }
        };

    useEffect(() => {
        void carregarAdiantamentos();
    }, []);

    const resumo = useMemo(() => {
        return adiantamentos.reduce(
            (acumulado, item) => {
                const valor =
                    converterNumero(
                        item.valor
                    );

                acumulado.total += valor;

                if (
                    item.status === "pago"
                ) {
                    acumulado.pago += valor;
                }

                if (
                    item.status === "pendente"
                ) {
                    acumulado.pendente +=
                        valor;
                }

                if (
                    item.confirmacao_tecnico ===
                    "confirmado"
                ) {
                    acumulado.confirmado +=
                        valor;
                }

                return acumulado;
            },
            {
                total: 0,
                pago: 0,
                pendente: 0,
                confirmado: 0,
            }
        );
    }, [adiantamentos]);

    const totalPaginas = Math.max(
        1,
        Math.ceil(
            adiantamentos.length /
                ITENS_POR_PAGINA
        )
    );

    useEffect(() => {
        if (
            paginaAtual > totalPaginas
        ) {
            setPaginaAtual(
                totalPaginas
            );
        }
    }, [
        paginaAtual,
        totalPaginas,
    ]);

    const adiantamentosPaginados =
        useMemo(() => {
            const inicio =
                (paginaAtual - 1) *
                ITENS_POR_PAGINA;

            return adiantamentos.slice(
                inicio,
                inicio +
                    ITENS_POR_PAGINA
            );
        }, [
            adiantamentos,
            paginaAtual,
        ]);

    const inicioRegistro =
        adiantamentos.length === 0
            ? 0
            : (paginaAtual - 1) *
                  ITENS_POR_PAGINA +
              1;

    const fimRegistro = Math.min(
        paginaAtual *
            ITENS_POR_PAGINA,
        adiantamentos.length
    );

    const handleAlterarPagina = (
        pagina: number
    ) => {
        if (
            pagina < 1 ||
            pagina > totalPaginas
        ) {
            return;
        }

        setPaginaAtual(pagina);

        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };

    const handleConfirmar = async (
        adiantamentoId: string
    ) => {
        try {
            setProcessandoId(
                adiantamentoId
            );

            await confirmarAdiantamentoTecnico({
                adiantamentoId,
                confirmado: true,
            });

            toast.success(
                "Recebimento confirmado."
            );

            await carregarAdiantamentos();
        } catch (error) {
            toast.error(
                error instanceof Error
                    ? error.message
                    : "Erro ao confirmar adiantamento."
            );
        } finally {
            setProcessandoId(null);
        }
    };

    const handleDivergencia = async () => {
        if (!divergenciaId) {
            return;
        }

        if (
            !observacaoDivergencia.trim()
        ) {
            toast.error(
                "Informe o motivo da divergência."
            );

            return;
        }

        try {
            setProcessandoId(
                divergenciaId
            );

            await confirmarAdiantamentoTecnico({
                adiantamentoId:
                    divergenciaId,
                confirmado: false,
                observacao:
                    observacaoDivergencia,
            });

            toast.success(
                "Divergência registrada."
            );

            setDivergenciaId(null);
            setObservacaoDivergencia("");

            await carregarAdiantamentos();
        } catch (error) {
            toast.error(
                error instanceof Error
                    ? error.message
                    : "Erro ao registrar divergência."
            );
        } finally {
            setProcessandoId(null);
        }
    };

    return (
        <div>
            <StaffHeader
                title="Adiantamentos"
                subtitle="Consulte valores antecipados e confirme os recebimentos."
                action={
                    <button
                        type="button"
                        onClick={() =>
                            void carregarAdiantamentos()
                        }
                        disabled={loading}
                        className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-border bg-background px-4 text-sm font-bold text-foreground shadow-sm hover:bg-secondary disabled:opacity-50"
                    >
                        <RefreshCw
                            className={`h-4 w-4 ${
                                loading
                                    ? "animate-spin"
                                    : ""
                            }`}
                        />

                        Atualizar
                    </button>
                }
            />

            <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <CardResumo
                    titulo="Total"
                    valor={formatarMoeda(
                        resumo.total
                    )}
                    icon={
                        <Wallet className="h-5 w-5" />
                    }
                    className="bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300"
                />

                <CardResumo
                    titulo="Pagos"
                    valor={formatarMoeda(
                        resumo.pago
                    )}
                    icon={
                        <Banknote className="h-5 w-5" />
                    }
                    className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                />

                <CardResumo
                    titulo="Pendentes"
                    valor={formatarMoeda(
                        resumo.pendente
                    )}
                    icon={
                        <Clock3 className="h-5 w-5" />
                    }
                    className="bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300"
                />

                <CardResumo
                    titulo="Confirmados"
                    valor={formatarMoeda(
                        resumo.confirmado
                    )}
                    icon={
                        <CheckCircle2 className="h-5 w-5" />
                    }
                    className="bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300"
                />
            </section>

            {erro && (
                <div className="mt-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
                    <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />

                    {erro}
                </div>
            )}

            <section className="mt-6 space-y-4">
                {loading ? (
                    <div className="flex min-h-[280px] items-center justify-center rounded-xl border border-border bg-card">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : adiantamentos.length ===
                  0 ? (
                    <div className="rounded-xl border border-border bg-card p-10 text-center shadow-sm">
                        <Wallet className="mx-auto h-10 w-10 text-muted-foreground/50" />

                        <h3 className="mt-4 font-bold text-foreground">
                            Nenhum adiantamento encontrado
                        </h3>
                    </div>
                ) : (
                    adiantamentosPaginados.map(
                        (adiantamento) => {
                            const podeConfirmar =
                                adiantamento.status ===
                                    "pago" &&
                                adiantamento.confirmacao_tecnico ===
                                    "pendente";

                            const processando =
                                processandoId ===
                                adiantamento.id;

                            return (
                                <article
                                    key={
                                        adiantamento.id
                                    }
                                    className="rounded-xl border border-border bg-card p-4 shadow-sm sm:p-5"
                                >
                                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                        <div className="min-w-0">
                                            <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                                                Adiantamento
                                            </p>

                                            <h3 className="mt-1 text-xl font-bold text-foreground">
                                                {formatarMoeda(
                                                    adiantamento.valor
                                                )}
                                            </h3>

                                            <p className="mt-2 text-sm text-muted-foreground">
                                                {
                                                    adiantamento.descricao
                                                }
                                            </p>
                                        </div>

                                        <span
                                            className={`w-fit rounded-full border px-2.5 py-1 text-xs font-bold capitalize ${obterClasseStatus(
                                                adiantamento.status
                                            )}`}
                                        >
                                            {
                                                adiantamento.status
                                            }
                                        </span>
                                    </div>

                                    <div className="mt-5 grid grid-cols-1 gap-3 rounded-xl bg-secondary/40 p-4 text-sm sm:grid-cols-3">
                                        <div>
                                            <p className="text-xs text-muted-foreground">
                                                Chamado
                                            </p>

                                            <p className="mt-1 font-bold text-foreground">
                                                {adiantamento
                                                    .chamado
                                                    ?.numero_chamado ||
                                                    "Não informado"}
                                            </p>
                                        </div>

                                        <div>
                                            <p className="text-xs text-muted-foreground">
                                                Empresa
                                            </p>

                                            <p className="mt-1 font-bold text-foreground">
                                                {adiantamento
                                                    .chamado
                                                    ?.empresa ||
                                                    "Não informada"}
                                            </p>
                                        </div>

                                        <div>
                                            <p className="text-xs text-muted-foreground">
                                                Data
                                            </p>

                                            <p className="mt-1 font-bold text-foreground">
                                                {formatarData(
                                                    adiantamento.pago_em ||
                                                        adiantamento.solicitado_em
                                                )}
                                            </p>
                                        </div>
                                    </div>

                                    {adiantamento.comprovante_url && (
                                        <a
                                            href={
                                                adiantamento.comprovante_url
                                            }
                                            target="_blank"
                                            rel="noreferrer"
                                            className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-primary hover:underline"
                                        >
                                            <ExternalLink className="h-4 w-4" />

                                            Ver comprovante
                                        </a>
                                    )}

                                    {podeConfirmar && (
                                        <div className="mt-5 grid grid-cols-1 gap-3 border-t border-border pt-5 sm:grid-cols-2">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    void handleConfirmar(
                                                        adiantamento.id
                                                    )
                                                }
                                                disabled={
                                                    processando
                                                }
                                                className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 text-sm font-bold text-white hover:bg-emerald-700 disabled:opacity-50"
                                            >
                                                {processando ? (
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                ) : (
                                                    <CheckCircle2 className="h-4 w-4" />
                                                )}

                                                Confirmar recebimento
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setDivergenciaId(
                                                        adiantamento.id
                                                    );

                                                    setObservacaoDivergencia(
                                                        ""
                                                    );
                                                }}
                                                disabled={
                                                    processando
                                                }
                                                className="h-11 rounded-lg border border-red-200 bg-red-50 px-4 text-sm font-bold text-red-700 hover:bg-red-100 disabled:opacity-50 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300"
                                            >
                                                Informar divergência
                                            </button>
                                        </div>
                                    )}
                                </article>
                            );
                        }
                    )
                )}
            </section>

            <Paginacao
                paginaAtual={paginaAtual}
                totalPaginas={totalPaginas}
                totalRegistros={
                    adiantamentos.length
                }
                inicioRegistro={
                    inicioRegistro
                }
                fimRegistro={fimRegistro}
                onChange={
                    handleAlterarPagina
                }
            />

            {divergenciaId && (
                <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center sm:p-4">
                    <div className="w-full rounded-t-2xl border border-border bg-card p-5 shadow-2xl sm:max-w-lg sm:rounded-2xl sm:p-6">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <h3 className="text-lg font-bold text-foreground">
                                    Informar divergência
                                </h3>

                                <p className="mt-1 text-sm text-muted-foreground">
                                    Descreva o problema encontrado no pagamento.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() => {
                                    setDivergenciaId(
                                        null
                                    );

                                    setObservacaoDivergencia(
                                        ""
                                    );
                                }}
                                className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <textarea
                            value={
                                observacaoDivergencia
                            }
                            onChange={(event) =>
                                setObservacaoDivergencia(
                                    event.target.value
                                )
                            }
                            rows={5}
                            className="mt-5 w-full resize-none rounded-lg border border-border bg-background p-3 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                            placeholder="Informe a divergência encontrada."
                        />

                        <div className="mt-5 grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={() => {
                                    setDivergenciaId(
                                        null
                                    );

                                    setObservacaoDivergencia(
                                        ""
                                    );
                                }}
                                className="h-11 rounded-lg border border-border bg-background text-sm font-bold text-foreground hover:bg-secondary"
                            >
                                Cancelar
                            </button>

                            <button
                                type="button"
                                onClick={() =>
                                    void handleDivergencia()
                                }
                                disabled={
                                    processandoId ===
                                    divergenciaId
                                }
                                className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-red-600 text-sm font-bold text-white hover:bg-red-700 disabled:opacity-50"
                            >
                                {processandoId ===
                                divergenciaId ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <AlertCircle className="h-4 w-4" />
                                )}

                                Registrar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StaffAdiantamentos;