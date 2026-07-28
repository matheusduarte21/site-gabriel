import {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";
import type { ReactNode } from "react";
import {
    AlertCircle,
    Banknote,
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    CircleDollarSign,
    Clock3,
    ExternalLink,
    FileCheck2,
    Loader2,
    RefreshCw,
    ShieldCheck,
    ThumbsDown,
    ThumbsUp,
    Triangle,
    Wallet,
    X,
} from "lucide-react";
import toast from "react-hot-toast";
import { AdiantamentoTecnico } from "../../types/portal-tecnico.type";
import StaffHeader from "./staffHeader";
import {
    converterNumero,
    formatarData,
    formatarMoeda,
} from "./staff.utils";
import { getMeusAdiantamentos } from "../../services/Tecnicos/Adiantamento-staff/get-meus-adiantamentos.service";
import { confirmarAdiantamentoTecnico } from "../../services/Tecnicos/Adiantamento-staff/confirmar-adiantamento.service";
import { responderValorAdiantamentoTecnico } from "../../services/Tecnicos/Adiantamento-staff/responder-valor-adiantamento.service";

interface CardResumoProps {
    titulo: string;
    valor: string;
    descricao: string;
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

interface ModalObservacao {
    adiantamentoId: string;
    tipo:
        | "reprovar_valor"
        | "divergencia_recebimento";
}

const ITENS_POR_PAGINA = 3;

const CardResumo = ({
    titulo,
    valor,
    descricao,
    icon,
    className,
}: CardResumoProps) => {
    return (
        <div className="rounded-xl border border-border bg-card p-3 shadow-sm transition-shadow hover:shadow-md">
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                        {titulo}
                    </p>

                    <p className="mt-1.5 truncate text-lg font-bold text-foreground">
                        {valor}
                    </p>

                    <p className="mt-1 line-clamp-1 text-[11px] text-muted-foreground">
                        {descricao}
                    </p>
                </div>

                <span
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${className}`}
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
        <div className="mt-5 flex flex-col gap-3 rounded-xl border border-border bg-card p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
            <p className="text-center text-xs text-muted-foreground sm:text-left">
                Mostrando{" "}
                <span className="font-bold text-foreground">
                    {inicioRegistro}
                </span>{" "}
                a{" "}
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
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground hover:bg-secondary hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
                >
                    <ChevronLeft className="h-4 w-4" />
                </button>

                {paginasVisiveis.map(
                    (pagina, index) => {
                        const anterior =
                            paginasVisiveis[
                                index - 1
                            ];

                        const separador =
                            anterior &&
                            pagina - anterior > 1;

                        return (
                            <div
                                key={pagina}
                                className="flex items-center gap-1"
                            >
                                {separador && (
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
                                    className={`flex h-8 min-w-8 items-center justify-center rounded-lg px-2 text-xs font-bold ${
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
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground hover:bg-secondary hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
                >
                    <ChevronRight className="h-4 w-4" />
                </button>
            </div>
        </div>
    );
};

const obterClasseStatus = (
    valor: string
): string => {
    if (
        [
            "aprovado",
            "pago",
            "confirmado",
            "disponivel",
            "compensado",
        ].includes(valor)
    ) {
        return "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300";
    }

    if (
        [
            "reprovado",
            "divergencia",
            "cancelado",
        ].includes(valor)
    ) {
        return "border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300";
    }

    if (valor === "parcial") {
        return "border-cyan-200 bg-cyan-50 text-cyan-700 dark:border-cyan-900 dark:bg-cyan-950/40 dark:text-cyan-300";
    }

    return "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300";
};

const formatarStatus = (
    valor: string
): string => {
    return valor
        .replace(/_/g, " ")
        .replace(/\b\w/g, (letra) =>
            letra.toUpperCase()
        );
};

const obterEtapaAtual = (
    adiantamento: AdiantamentoTecnico
) => {
    if (
        adiantamento.status_pagamento ===
        "cancelado"
    ) {
        return {
            label: "Cancelado",
            className:
                "border-slate-200 bg-slate-100 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300",
        };
    }

    if (
        adiantamento.validacao_valor_tecnico ===
        "pendente"
    ) {
        return {
            label:
                "Aguardando validação",
            className:
                "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300",
        };
    }

    if (
        adiantamento.validacao_valor_tecnico ===
        "reprovado"
    ) {
        return {
            label: "Valor reprovado",
            className:
                "border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300",
        };
    }

    if (
        adiantamento.status_pagamento ===
        "pendente"
    ) {
        return {
            label:
                "Aguardando pagamento",
            className:
                "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-300",
        };
    }

    if (
        adiantamento.confirmacao_recebimento ===
        "pendente"
    ) {
        return {
            label:
                "Confirmar recebimento",
            className:
                "border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-900 dark:bg-indigo-950/40 dark:text-indigo-300",
        };
    }

    if (
        adiantamento.confirmacao_recebimento ===
        "divergencia"
    ) {
        return {
            label:
                "Divergência informada",
            className:
                "border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300",
        };
    }

    if (
        adiantamento.status_compensacao ===
        "compensado"
    ) {
        return {
            label: "Compensado",
            className:
                "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300",
        };
    }

    if (
        adiantamento.status_compensacao ===
        "parcial"
    ) {
        return {
            label:
                "Compensado parcialmente",
            className:
                "border-cyan-200 bg-cyan-50 text-cyan-700 dark:border-cyan-900 dark:bg-cyan-950/40 dark:text-cyan-300",
        };
    }

    return {
        label:
            "Disponível para compensação",
        className:
            "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300",
    };
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
        modalObservacao,
        setModalObservacao,
    ] = useState<ModalObservacao | null>(
        null
    );

    const [
        observacao,
        setObservacao,
    ] = useState("");

    const [
        paginaAtual,
        setPaginaAtual,
    ] = useState(1);

    const carregarAdiantamentos =
        useCallback(
            async (
                exibirLoading = true
            ) => {
                try {
                    if (exibirLoading) {
                        setLoading(true);
                    }

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
                    if (exibirLoading) {
                        setLoading(false);
                    }
                }
            },
            []
        );

    useEffect(() => {
        void carregarAdiantamentos();
    }, [carregarAdiantamentos]);

    const resumo = useMemo(() => {
        return adiantamentos.reduce(
            (acumulado, item) => {
                if (
                    item.status_pagamento ===
                    "cancelado"
                ) {
                    return acumulado;
                }

                const valor =
                    converterNumero(
                        item.valor
                    );

                acumulado.total += valor;

                if (
                    item.validacao_valor_tecnico ===
                    "pendente"
                ) {
                    acumulado.validar +=
                        valor;
                }

                if (
                    item.validacao_valor_tecnico ===
                        "aprovado" &&
                    item.status_pagamento ===
                        "pendente"
                ) {
                    acumulado.pagar += valor;
                }

                if (
                    item.status_pagamento ===
                        "pago" &&
                    item.confirmacao_recebimento ===
                        "pendente"
                ) {
                    acumulado.confirmar +=
                        valor;
                }

                if (
                    item.status_compensacao ===
                        "disponivel" ||
                    item.status_compensacao ===
                        "parcial"
                ) {
                    acumulado.compensar +=
                        Math.max(
                            0,
                            valor -
                                converterNumero(
                                    item.valor_compensado
                                )
                        );
                }

                return acumulado;
            },
            {
                total: 0,
                validar: 0,
                pagar: 0,
                confirmar: 0,
                compensar: 0,
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

    const handleAprovarValor =
        async (
            adiantamentoId: string
        ) => {
            try {
                setProcessandoId(
                    adiantamentoId
                );

                await responderValorAdiantamentoTecnico(
                    {
                        adiantamentoId,
                        aprovado: true,
                    }
                );

                toast.success(
                    "Valor aprovado com sucesso."
                );

                await carregarAdiantamentos(
                    false
                );
            } catch (error) {
                toast.error(
                    error instanceof Error
                        ? error.message
                        : "Erro ao aprovar o valor."
                );
            } finally {
                setProcessandoId(null);
            }
        };

    const handleConfirmarRecebimento =
        async (
            adiantamentoId: string
        ) => {
            try {
                setProcessandoId(
                    adiantamentoId
                );

                await confirmarAdiantamentoTecnico(
                    {
                        adiantamentoId,
                        confirmado: true,
                    }
                );

                toast.success(
                    "Recebimento confirmado com sucesso."
                );

                await carregarAdiantamentos(
                    false
                );
            } catch (error) {
                toast.error(
                    error instanceof Error
                        ? error.message
                        : "Erro ao confirmar o recebimento."
                );
            } finally {
                setProcessandoId(null);
            }
        };

    const abrirModalObservacao = (
        adiantamentoId: string,
        tipo: ModalObservacao["tipo"]
    ) => {
        setModalObservacao({
            adiantamentoId,
            tipo,
        });

        setObservacao("");
    };

    const fecharModalObservacao =
        () => {
            setModalObservacao(null);
            setObservacao("");
        };

    const handleEnviarObservacao =
        async () => {
            if (!modalObservacao) {
                return;
            }

            if (
                observacao.trim().length <
                3
            ) {
                toast.error(
                    modalObservacao.tipo ===
                        "reprovar_valor"
                        ? "Informe o motivo da reprovação."
                        : "Informe o motivo da divergência."
                );

                return;
            }

            try {
                setProcessandoId(
                    modalObservacao.adiantamentoId
                );

                if (
                    modalObservacao.tipo ===
                    "reprovar_valor"
                ) {
                    await responderValorAdiantamentoTecnico(
                        {
                            adiantamentoId:
                                modalObservacao.adiantamentoId,
                            aprovado: false,
                            observacao,
                        }
                    );

                    toast.success(
                        "Valor reprovado. O administrador poderá realizar a correção."
                    );
                } else {
                    await confirmarAdiantamentoTecnico(
                        {
                            adiantamentoId:
                                modalObservacao.adiantamentoId,
                            confirmado: false,
                            observacao,
                        }
                    );

                    toast.success(
                        "Divergência registrada."
                    );
                }

                fecharModalObservacao();

                await carregarAdiantamentos(
                    false
                );
            } catch (error) {
                toast.error(
                    error instanceof Error
                        ? error.message
                        : "Erro ao registrar a resposta."
                );
            } finally {
                setProcessandoId(null);
            }
        };

    return (
        <div>
            <StaffHeader
                title="Adiantamentos"
                subtitle="Valide os valores e confirme os pagamentos recebidos."
                action={
                    <button
                        type="button"
                        onClick={() =>
                            void carregarAdiantamentos()
                        }
                        disabled={loading}
                        className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-bold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 disabled:opacity-50"
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

            <section className="grid grid-cols-2 gap-3 lg:grid-cols-3 2xl:grid-cols-5">
                <CardResumo
                    titulo="Total ativo"
                    valor={formatarMoeda(
                        resumo.total
                    )}
                    descricao="Adiantamentos não cancelados"
                    icon={
                        <Wallet className="h-4 w-4" />
                    }
                    className="bg-primary/10 text-primary"
                />

                <CardResumo
                    titulo="Validar valor"
                    valor={formatarMoeda(
                        resumo.validar
                    )}
                    descricao="Aguardando sua aprovação"
                    icon={
                        <ShieldCheck className="h-4 w-4" />
                    }
                    className="bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300"
                />

                <CardResumo
                    titulo="Aguardando pagamento"
                    valor={formatarMoeda(
                        resumo.pagar
                    )}
                    descricao="Valores que você aprovou"
                    icon={
                        <Banknote className="h-4 w-4" />
                    }
                    className="bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300"
                />

                <CardResumo
                    titulo="Confirmar recebimento"
                    valor={formatarMoeda(
                        resumo.confirmar
                    )}
                    descricao="Pagamentos a confirmar"
                    icon={
                        <FileCheck2 className="h-4 w-4" />
                    }
                    className="bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300"
                />

                <CardResumo
                    titulo="A compensar"
                    valor={formatarMoeda(
                        resumo.compensar
                    )}
                    descricao="Saldo para os fechamentos"
                    icon={
                        <CircleDollarSign className="h-4 w-4" />
                    }
                    className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                />
            </section>

            {erro && (
                <div className="mt-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
                    <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
                    {erro}
                </div>
            )}

            <section className="mt-5">
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
                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 2xl:grid-cols-3">
                        {adiantamentosPaginados.map(
                            (adiantamento) => {
                                const etapa =
                                    obterEtapaAtual(
                                        adiantamento
                                    );

                                const processando =
                                    processandoId ===
                                    adiantamento.id;

                                const podeValidarValor =
                                    adiantamento.status_pagamento ===
                                        "pendente" &&
                                    adiantamento.validacao_valor_tecnico ===
                                        "pendente";

                                const aguardandoPagamento =
                                    adiantamento.validacao_valor_tecnico ===
                                        "aprovado" &&
                                    adiantamento.status_pagamento ===
                                        "pendente";

                                const podeConfirmarRecebimento =
                                    adiantamento.status_pagamento ===
                                        "pago" &&
                                    adiantamento.confirmacao_recebimento ===
                                        "pendente";

                                const saldoCompensar =
                                    Math.max(
                                        0,
                                        converterNumero(
                                            adiantamento.valor
                                        ) -
                                            converterNumero(
                                                adiantamento.valor_compensado
                                            )
                                    );

                                return (
                                    <article
                                        key={
                                            adiantamento.id
                                        }
                                        className="flex min-h-[420px] flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md"
                                    >
                                        <div className="border-b border-border bg-gradient-to-r from-primary/10 via-primary/5 to-background p-4">
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="min-w-0">
                                                    <p className="text-[9px] font-bold uppercase tracking-wide text-primary">
                                                        Adiantamento
                                                    </p>

                                                    <h3 className="mt-1 text-xl font-bold text-foreground">
                                                        {formatarMoeda(
                                                            adiantamento.valor
                                                        )}
                                                    </h3>
                                                </div>

                                                <span
                                                    className={`max-w-[55%] rounded-full border px-2.5 py-1 text-center text-[9px] font-bold leading-4 ${etapa.className}`}
                                                >
                                                    {
                                                        etapa.label
                                                    }
                                                </span>
                                            </div>

                                            <p className="mt-2 line-clamp-2 min-h-10 text-xs leading-5 text-muted-foreground">
                                                {adiantamento.descricao ||
                                                    "Sem descrição informada."}
                                            </p>
                                        </div>

                                        <div className="flex flex-1 flex-col p-3">
                                            <div className="grid grid-cols-2 gap-x-3 gap-y-2 rounded-lg bg-secondary/40 p-3">
                                                <div className="min-w-0">
                                                    <p className="text-[8px] font-bold uppercase tracking-wide text-muted-foreground">
                                                        Chamado
                                                    </p>

                                                    <p className="mt-0.5 truncate text-[11px] font-bold text-foreground">
                                                        {adiantamento
                                                            .chamado
                                                            ?.numero_chamado ||
                                                            "Não relacionado"}
                                                    </p>
                                                </div>

                                                <div className="min-w-0">
                                                    <p className="text-[8px] font-bold uppercase tracking-wide text-muted-foreground">
                                                        Empresa
                                                    </p>

                                                    <p className="mt-0.5 truncate text-[11px] font-bold text-foreground">
                                                        {adiantamento
                                                            .chamado
                                                            ?.empresa ||
                                                            "Não informada"}
                                                    </p>
                                                </div>

                                                <div className="min-w-0">
                                                    <p className="text-[8px] font-bold uppercase tracking-wide text-muted-foreground">
                                                        Cadastrado em
                                                    </p>

                                                    <p className="mt-0.5 truncate text-[10px] font-semibold text-foreground">
                                                        {formatarData(
                                                            adiantamento.criado_em ||
                                                                adiantamento.solicitado_em
                                                        )}
                                                    </p>
                                                </div>

                                                <div className="min-w-0">
                                                    <p className="text-[8px] font-bold uppercase tracking-wide text-muted-foreground">
                                                        Saldo a compensar
                                                    </p>

                                                    <p className="mt-0.5 truncate text-[11px] font-bold text-emerald-700 dark:text-emerald-300">
                                                        {formatarMoeda(
                                                            saldoCompensar
                                                        )}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="mt-3 grid grid-cols-2 gap-2">
                                                {[
                                                    {
                                                        label:
                                                            "Validação",
                                                        valor: adiantamento.validacao_valor_tecnico,
                                                    },
                                                    {
                                                        label:
                                                            "Pagamento",
                                                        valor: adiantamento.status_pagamento,
                                                    },
                                                    {
                                                        label:
                                                            "Recebimento",
                                                        valor: adiantamento.confirmacao_recebimento,
                                                    },
                                                    {
                                                        label:
                                                            "Compensação",
                                                        valor: adiantamento.status_compensacao,
                                                    },
                                                ].map(
                                                    (item) => (
                                                        <div
                                                            key={
                                                                item.label
                                                            }
                                                            className="rounded-lg border border-border bg-background p-2.5"
                                                        >
                                                            <p className="text-[8px] font-bold uppercase tracking-wide text-muted-foreground">
                                                                {
                                                                    item.label
                                                                }
                                                            </p>

                                                            <span
                                                                className={`mt-1.5 inline-flex max-w-full truncate rounded-full border px-2 py-1 text-[9px] font-bold ${obterClasseStatus(
                                                                    item.valor
                                                                )}`}
                                                            >
                                                                {formatarStatus(
                                                                    item.valor
                                                                )}
                                                            </span>
                                                        </div>
                                                    )
                                                )}
                                            </div>

                                            {adiantamento.observacao_validacao && (
                                                <div className="mt-3 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
                                                    <p className="font-bold">
                                                        Motivo da reprovação
                                                    </p>

                                                    <p className="mt-1 line-clamp-2 leading-5">
                                                        {
                                                            adiantamento.observacao_validacao
                                                        }
                                                    </p>
                                                </div>
                                            )}

                                            {adiantamento.observacao_recebimento && (
                                                <div className="mt-3 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
                                                    <p className="font-bold">
                                                        Divergência informada
                                                    </p>

                                                    <p className="mt-1 line-clamp-2 leading-5">
                                                        {
                                                            adiantamento.observacao_recebimento
                                                        }
                                                    </p>
                                                </div>
                                            )}

                                            {adiantamento.comprovante_url && (
                                                <a
                                                    href={
                                                        adiantamento.comprovante_url
                                                    }
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="mt-3 inline-flex w-fit items-center gap-1.5 text-xs font-bold text-primary hover:underline"
                                                >
                                                    <ExternalLink className="h-3.5 w-3.5" />
                                                    Ver comprovante
                                                </a>
                                            )}

                                            {aguardandoPagamento && (
                                                <div className="mt-3 flex items-start gap-2 rounded-lg border border-blue-200 bg-blue-50 p-3 text-xs text-blue-700 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-300">
                                                    <Clock3 className="mt-0.5 h-4 w-4 shrink-0" />

                                                    <div>
                                                        <p className="font-bold">
                                                            Valor aprovado
                                                        </p>

                                                        <p className="mt-1 line-clamp-2 leading-5">
                                                            Aguardando o registro do pagamento.
                                                        </p>
                                                    </div>
                                                </div>
                                            )}

                                            {(adiantamento.status_compensacao ===
                                                "disponivel" ||
                                                adiantamento.status_compensacao ===
                                                    "parcial") && (
                                                <div className="mt-3 flex items-start gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300">
                                                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />

                                                    <div>
                                                        <p className="font-bold">
                                                            Disponível para compensação
                                                        </p>

                                                        <p className="mt-1 line-clamp-2 leading-5">
                                                            O saldo poderá ser descontado do próximo fechamento.
                                                        </p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {podeValidarValor && (
                                            <div className="grid grid-cols-2 gap-2 border-t border-border bg-secondary/10 p-3">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        void handleAprovarValor(
                                                            adiantamento.id
                                                        )
                                                    }
                                                    disabled={
                                                        processando
                                                    }
                                                    className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-emerald-600 px-3 text-xs font-bold text-white hover:bg-emerald-700 disabled:opacity-50"
                                                >
                                                    {processando ? (
                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                    ) : (
                                                        <ThumbsUp className="h-4 w-4" />
                                                    )}

                                                    Aprovar
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        abrirModalObservacao(
                                                            adiantamento.id,
                                                            "reprovar_valor"
                                                        )
                                                    }
                                                    disabled={
                                                        processando
                                                    }
                                                    className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 text-xs font-bold text-red-700 hover:bg-red-100 disabled:opacity-50 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300"
                                                >
                                                    <ThumbsDown className="h-4 w-4" />
                                                    Reprovar
                                                </button>
                                            </div>
                                        )}

                                        {podeConfirmarRecebimento && (
                                            <div className="grid grid-cols-2 gap-2 border-t border-border bg-secondary/10 p-3">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        void handleConfirmarRecebimento(
                                                            adiantamento.id
                                                        )
                                                    }
                                                    disabled={
                                                        processando
                                                    }
                                                    className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-emerald-600 px-3 text-xs font-bold text-white hover:bg-emerald-700 disabled:opacity-50"
                                                >
                                                    {processando ? (
                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                    ) : (
                                                        <CheckCircle2 className="h-4 w-4" />
                                                    )}

                                                    Confirmar
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        abrirModalObservacao(
                                                            adiantamento.id,
                                                            "divergencia_recebimento"
                                                        )
                                                    }
                                                    disabled={
                                                        processando
                                                    }
                                                    className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 text-xs font-bold text-red-700 hover:bg-red-100 disabled:opacity-50 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300"
                                                >
                                                    <Triangle className="h-4 w-4" />
                                                    Divergência
                                                </button>
                                            </div>
                                        )}
                                    </article>
                                );
                            }
                        )}
                    </div>
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

            {modalObservacao && (
                <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center sm:p-4">
                    <div className="w-full rounded-t-2xl border border-border bg-card p-5 shadow-2xl sm:max-w-lg sm:rounded-2xl sm:p-6">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <h3 className="text-lg font-bold text-foreground">
                                    {modalObservacao.tipo ===
                                    "reprovar_valor"
                                        ? "Reprovar valor"
                                        : "Informar divergência"}
                                </h3>

                                <p className="mt-1 text-sm text-muted-foreground">
                                    {modalObservacao.tipo ===
                                    "reprovar_valor"
                                        ? "Explique por que você não concorda com o valor cadastrado."
                                        : "Descreva o problema encontrado no pagamento recebido."}
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={
                                    fecharModalObservacao
                                }
                                disabled={
                                    processandoId ===
                                    modalObservacao.adiantamentoId
                                }
                                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary disabled:opacity-50"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <textarea
                            value={observacao}
                            onChange={(event) =>
                                setObservacao(
                                    event.target.value
                                )
                            }
                            rows={5}
                            className="mt-5 w-full resize-none rounded-xl border border-border bg-background p-3 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                            placeholder={
                                modalObservacao.tipo ===
                                "reprovar_valor"
                                    ? "Exemplo: O valor combinado era R$ 30,00 maior."
                                    : "Exemplo: O valor recebido está diferente do valor informado."
                            }
                        />

                        <div className="mt-5 grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={
                                    fecharModalObservacao
                                }
                                disabled={
                                    processandoId ===
                                    modalObservacao.adiantamentoId
                                }
                                className="h-11 rounded-lg border border-border bg-background text-sm font-bold text-foreground hover:bg-secondary disabled:opacity-50"
                            >
                                Voltar
                            </button>

                            <button
                                type="button"
                                onClick={() =>
                                    void handleEnviarObservacao()
                                }
                                disabled={
                                    processandoId ===
                                    modalObservacao.adiantamentoId
                                }
                                className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-red-600 text-sm font-bold text-white hover:bg-red-700 disabled:opacity-50"
                            >
                                {processandoId ===
                                modalObservacao.adiantamentoId ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <AlertCircle className="h-4 w-4" />
                                )}

                                Confirmar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StaffAdiantamentos;