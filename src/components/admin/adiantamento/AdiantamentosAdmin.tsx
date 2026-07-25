import { RefreshCw, Plus, HandCoins, Clock3, Banknote, CheckCircle2, WalletCards, Search, RotateCcw, AlertCircle, Loader2, UserRound, Eye, Pencil, CircleDollarSign, Send, Ban, ChevronLeft, ChevronRight, Triangle } from "lucide-react";
import { ReactNode, useState, useCallback, useEffect, useMemo } from "react";
import toast from "react-hot-toast";
import { calcularResumoAdiantamentosAdmin } from "../../../services/Adiantamentos/adiantamento-admin.utils";
import { cancelarAdiantamentoAdmin } from "../../../services/Adiantamentos/admin/cancelar-adiantamento-admin.service";
import { getTodosAdiantamentosAdmin } from "../../../services/Adiantamentos/admin/get-all-adiantamentos-admin.service";
import { getTecnicosParaAdiantamentoAdmin } from "../../../services/Adiantamentos/admin/get-tecnicos-adiantamento-admin.service";
import { atualizarAdiantamentoAdmin } from "../../../services/Adiantamentos/admin/patch-adiantamento-admin.service";
import { criarAdiantamentoAdmin } from "../../../services/Adiantamentos/admin/post-adiantamento-admin.service";
import { reenviarConfirmacaoAdiantamentoAdmin } from "../../../services/Adiantamentos/admin/reenviar-confirmacao-adiantamento-admin.service";
import { registrarPagamentoAdiantamentoAdmin } from "../../../services/Adiantamentos/admin/registrar-pagamento-adiantamento-admin.service";
import { AdiantamentoAdmin, EtapaAdiantamentoAdmin, TecnicoOpcaoAdiantamento } from "../../../types/diantamento-admin.type";
import AdminHeader from "../AdminHeader";
import AdiantamentoAdminAcaoModal, { ModoAcaoAdiantamento } from "./AdiantamentoAdminAcaoModal";
import AdiantamentoAdminDetalheModal from "./AdiantamentoAdminDetalheModal";
import AdiantamentoAdminFormModal from "./AdiantamentoAdminFormModal";
import AdiantamentoAdminPagamentoModal from "./AdiantamentoAdminPagamentoModal";

interface CardResumoProps {
    titulo: string;
    valor: string;
    descricao: string;
    icon: ReactNode;
    className: string;
}

interface ModalAcaoSelecionada {
    modo: ModoAcaoAdiantamento;
    adiantamento: AdiantamentoAdmin;
}

const ITENS_POR_PAGINA = 3;

const formatarMoeda = (
    valor: number
): string => {
    return new Intl.NumberFormat(
        "pt-BR",
        {
            style: "currency",
            currency: "BRL",
        }
    ).format(valor);
};

const formatarData = (
    valor: string | null | undefined
): string => {
    if (!valor) {
        return "Não informada";
    }

    const data = new Date(valor);

    if (Number.isNaN(data.getTime())) {
        return valor;
    }

    return new Intl.DateTimeFormat(
        "pt-BR",
        {
            dateStyle: "short",
        }
    ).format(data);
};

const obterEtapa = (
    etapa: EtapaAdiantamentoAdmin
) => {
    const configuracoes: Record<
        EtapaAdiantamentoAdmin,
        {
            label: string;
            className: string;
        }
    > = {
        aguardando_validacao: {
            label: "Aguardando validação",
            className:
                "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300",
        },
        valor_reprovado: {
            label: "Valor reprovado",
            className:
                "border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300",
        },
        aguardando_pagamento: {
            label: "Aguardando pagamento",
            className:
                "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-300",
        },
        aguardando_confirmacao: {
            label: "Aguardando confirmação",
            className:
                "border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-900 dark:bg-indigo-950/40 dark:text-indigo-300",
        },
        divergencia_recebimento: {
            label: "Divergência",
            className:
                "border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300",
        },
        disponivel_compensacao: {
            label: "Disponível para compensar",
            className:
                "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300",
        },
        parcialmente_compensado: {
            label: "Compensado parcialmente",
            className:
                "border-cyan-200 bg-cyan-50 text-cyan-700 dark:border-cyan-900 dark:bg-cyan-950/40 dark:text-cyan-300",
        },
        compensado: {
            label: "Compensado",
            className:
                "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300",
        },
        cancelado: {
            label: "Cancelado",
            className:
                "border-slate-200 bg-slate-100 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300",
        },
    };

    return configuracoes[etapa];
};

const obterTextoStatus = (
    valor: string
): string => {
    return valor
        .replace("_", " ")
        .replace(/\b\w/g, (letra) =>
            letra.toUpperCase()
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

const criarPaginasVisiveis = (
    paginaAtual: number,
    totalPaginas: number
): number[] => {
    const limite = 5;

    if (totalPaginas <= limite) {
        return Array.from(
            {
                length: totalPaginas,
            },
            (_, index) => index + 1
        );
    }

    let inicio = Math.max(
        1,
        paginaAtual - 2
    );

    let fim = Math.min(
        totalPaginas,
        inicio + limite - 1
    );

    inicio = Math.max(
        1,
        fim - limite + 1
    );

    return Array.from(
        {
            length: fim - inicio + 1,
        },
        (_, index) => inicio + index
    );
};

const CardResumo = ({
    titulo,
    valor,
    descricao,
    icon,
    className,
}: CardResumoProps) => {
    return (
        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                        {titulo}
                    </p>

                    <p className="mt-1.5 truncate text-lg font-bold text-foreground">
                        {valor}
                    </p>

                    <p className="mt-1 truncate text-[11px] text-muted-foreground">
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

const AdiantamentosAdmin = () => {
    const [
        adiantamentos,
        setAdiantamentos,
    ] = useState<AdiantamentoAdmin[]>([]);

    const [tecnicos, setTecnicos] =
        useState<
            TecnicoOpcaoAdiantamento[]
        >([]);

    const [loading, setLoading] =
        useState(true);

    const [erro, setErro] =
        useState<string | null>(null);

    const [busca, setBusca] =
        useState("");

    const [
        tecnicoFiltro,
        setTecnicoFiltro,
    ] = useState("todos");

    const [
        etapaFiltro,
        setEtapaFiltro,
    ] = useState<
        EtapaAdiantamentoAdmin | "todos"
    >("todos");

    const [dataInicio, setDataInicio] =
        useState("");

    const [dataFim, setDataFim] =
        useState("");

    const [
        paginaAtual,
        setPaginaAtual,
    ] = useState(1);

    const [
        formAberto,
        setFormAberto,
    ] = useState(false);

    const [
        adiantamentoEditando,
        setAdiantamentoEditando,
    ] =
        useState<AdiantamentoAdmin | null>(
            null
        );

    const [
        pagamentoSelecionado,
        setPagamentoSelecionado,
    ] =
        useState<AdiantamentoAdmin | null>(
            null
        );

    const [
        detalheSelecionado,
        setDetalheSelecionado,
    ] =
        useState<AdiantamentoAdmin | null>(
            null
        );

    const [
        acaoSelecionada,
        setAcaoSelecionada,
    ] =
        useState<ModalAcaoSelecionada | null>(
            null
        );

    const [
        processando,
        setProcessando,
    ] = useState(false);

    const carregarDados = useCallback(
        async (
            exibirLoading = true
        ) => {
            try {
                if (exibirLoading) {
                    setLoading(true);
                }

                setErro(null);

                const [
                    adiantamentosDb,
                    tecnicosDb,
                ] = await Promise.all([
                    getTodosAdiantamentosAdmin(),
                    getTecnicosParaAdiantamentoAdmin(),
                ]);

                setAdiantamentos(
                    adiantamentosDb
                );

                setTecnicos(tecnicosDb);
            } catch (error) {
                setErro(
                    error instanceof Error
                        ? error.message
                        : "Não foi possível carregar os adiantamentos."
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
        void carregarDados();
    }, [carregarDados]);

    const adiantamentosFiltrados =
        useMemo(() => {
            const termo = busca
                .trim()
                .toLocaleLowerCase(
                    "pt-BR"
                );

            return adiantamentos.filter(
                (adiantamento) => {
                    const correspondeTecnico =
                        tecnicoFiltro ===
                            "todos" ||
                        adiantamento.tecnico_id ===
                            tecnicoFiltro;

                    const correspondeEtapa =
                        etapaFiltro ===
                            "todos" ||
                        adiantamento.etapa ===
                            etapaFiltro;

                    let correspondePeriodo =
                        true;

                    const criadoEm =
                        adiantamento.criado_em
                            ? new Date(
                                  adiantamento.criado_em
                              )
                            : null;

                    if (
                        dataInicio &&
                        criadoEm
                    ) {
                        const inicio =
                            new Date(
                                `${dataInicio}T00:00:00`
                            );

                        correspondePeriodo =
                            criadoEm >= inicio;
                    }

                    if (
                        dataFim &&
                        criadoEm &&
                        correspondePeriodo
                    ) {
                        const fim = new Date(
                            `${dataFim}T23:59:59`
                        );

                        correspondePeriodo =
                            criadoEm <= fim;
                    }

                    const tecnico =
                        adiantamento.tecnico
                            ?.nome
                            ?.toLocaleLowerCase(
                                "pt-BR"
                            ) || "";

                    const descricao =
                        adiantamento.descricao
                            .toLocaleLowerCase(
                                "pt-BR"
                            );

                    const chamado =
                        adiantamento.chamado
                            ?.numero_chamado
                            ?.toLocaleLowerCase(
                                "pt-BR"
                            ) || "";

                    const empresa =
                        adiantamento.chamado
                            ?.empresa
                            ?.toLocaleLowerCase(
                                "pt-BR"
                            ) || "";

                    const correspondeBusca =
                        !termo ||
                        tecnico.includes(
                            termo
                        ) ||
                        descricao.includes(
                            termo
                        ) ||
                        chamado.includes(
                            termo
                        ) ||
                        empresa.includes(
                            termo
                        );

                    return (
                        correspondeTecnico &&
                        correspondeEtapa &&
                        correspondePeriodo &&
                        correspondeBusca
                    );
                }
            );
        }, [
            adiantamentos,
            busca,
            tecnicoFiltro,
            etapaFiltro,
            dataInicio,
            dataFim,
        ]);

    useEffect(() => {
        setPaginaAtual(1);
    }, [
        busca,
        tecnicoFiltro,
        etapaFiltro,
        dataInicio,
        dataFim,
    ]);

    const resumo = useMemo(
        () =>
            calcularResumoAdiantamentosAdmin(
                adiantamentosFiltrados
            ),
        [adiantamentosFiltrados]
    );

    const totalPaginas = Math.max(
        1,
        Math.ceil(
            adiantamentosFiltrados.length /
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

            return adiantamentosFiltrados.slice(
                inicio,
                inicio +
                    ITENS_POR_PAGINA
            );
        }, [
            adiantamentosFiltrados,
            paginaAtual,
        ]);

    const inicioRegistro =
        adiantamentosFiltrados.length ===
        0
            ? 0
            : (paginaAtual - 1) *
                  ITENS_POR_PAGINA +
              1;

    const fimRegistro = Math.min(
        paginaAtual *
            ITENS_POR_PAGINA,
        adiantamentosFiltrados.length
    );

    const paginasVisiveis =
        criarPaginasVisiveis(
            paginaAtual,
            totalPaginas
        );

    const limparFiltros = () => {
        setBusca("");
        setTecnicoFiltro("todos");
        setEtapaFiltro("todos");
        setDataInicio("");
        setDataFim("");
    };

    const abrirNovo = () => {
        setAdiantamentoEditando(null);
        setFormAberto(true);
    };

    const abrirEdicao = (
        adiantamento: AdiantamentoAdmin
    ) => {
        setAdiantamentoEditando(
            adiantamento
        );

        setFormAberto(true);
    };

    const handleSalvar = async (
        payload: {
            tecnicoId: string;
            valor: number;
            descricao: string;
            chamadoId: string | null;
        }
    ) => {
        try {
            setProcessando(true);

            if (adiantamentoEditando) {
                await atualizarAdiantamentoAdmin({
                    adiantamentoId:
                        adiantamentoEditando.id,
                    valor: payload.valor,
                    descricao:
                        payload.descricao,
                    chamadoId:
                        payload.chamadoId,
                });

                toast.success(
                    "Adiantamento atualizado e reenviado para validação."
                );
            } else {
                await criarAdiantamentoAdmin({
                    tecnicoId:
                        payload.tecnicoId,
                    valor: payload.valor,
                    descricao:
                        payload.descricao,
                    chamadoId:
                        payload.chamadoId,
                });

                toast.success(
                    "Adiantamento cadastrado com sucesso."
                );
            }

            setFormAberto(false);
            setAdiantamentoEditando(null);

            await carregarDados(false);
        } catch (error) {
            toast.error(
                error instanceof Error
                    ? error.message
                    : "Erro ao salvar adiantamento."
            );
        } finally {
            setProcessando(false);
        }
    };

    const handlePagamento = async (
        payload: {
            pagoEm: string;
            comprovanteUrl:
                | string
                | null;
        }
    ) => {
        if (!pagamentoSelecionado) {
            return;
        }

        try {
            setProcessando(true);

            await registrarPagamentoAdiantamentoAdmin(
                {
                    adiantamentoId:
                        pagamentoSelecionado.id,
                    comprovanteUrl:
                        payload.comprovanteUrl,
                    pagoEm: payload.pagoEm,
                }
            );

            toast.success(
                "Pagamento registrado com sucesso."
            );

            setPagamentoSelecionado(null);

            await carregarDados(false);
        } catch (error) {
            toast.error(
                error instanceof Error
                    ? error.message
                    : "Erro ao registrar pagamento."
            );
        } finally {
            setProcessando(false);
        }
    };

    const handleAcao = async (
        valor: string
    ) => {
        if (!acaoSelecionada) {
            return;
        }

        try {
            setProcessando(true);

            if (
                acaoSelecionada.modo ===
                "cancelar"
            ) {
                await cancelarAdiantamentoAdmin(
                    {
                        adiantamentoId:
                            acaoSelecionada
                                .adiantamento
                                .id,
                        motivo: valor,
                    }
                );

                toast.success(
                    "Adiantamento cancelado."
                );
            } else {
                await reenviarConfirmacaoAdiantamentoAdmin(
                    {
                        adiantamentoId:
                            acaoSelecionada
                                .adiantamento
                                .id,
                        comprovanteUrl:
                            valor || null,
                    }
                );

                toast.success(
                    "Confirmação reenviada ao técnico."
                );
            }

            setAcaoSelecionada(null);

            await carregarDados(false);
        } catch (error) {
            toast.error(
                error instanceof Error
                    ? error.message
                    : "Erro ao processar ação."
            );
        } finally {
            setProcessando(false);
        }
    };

    const alterarPagina = (
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

    return (
        <div>
            <AdminHeader
                title="Adiantamentos"
                subtitle="Cadastre, acompanhe e gerencie os adiantamentos dos técnicos."
            />

            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:justify-end">
                <button
                    type="button"
                    onClick={() =>
                        void carregarDados()
                    }
                    disabled={loading}
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-border bg-card px-4 text-sm font-bold text-foreground shadow-sm hover:bg-secondary disabled:opacity-50"
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

                <button
                    type="button"
                    onClick={abrirNovo}
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-bold text-primary-foreground shadow-sm hover:bg-primary/90"
                >
                    <Plus className="h-4 w-4" />
                    Novo adiantamento
                </button>
            </div>

            <section className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
                <CardResumo
                    titulo="Total cadastrado"
                    valor={formatarMoeda(
                        resumo.valorTotal
                    )}
                    descricao={`${resumo.quantidade} registros`}
                    icon={
                        <HandCoins className="h-4 w-4" />
                    }
                    className="bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300"
                />

                <CardResumo
                    titulo="Validar"
                    valor={formatarMoeda(
                        resumo.valorAguardandoValidacao
                    )}
                    descricao={`${resumo.quantidadeAguardandoValidacao} aguardando técnico`}
                    icon={
                        <Clock3 className="h-4 w-4" />
                    }
                    className="bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300"
                />

                <CardResumo
                    titulo="Pagar"
                    valor={formatarMoeda(
                        resumo.valorAguardandoPagamento
                    )}
                    descricao={`${resumo.quantidadeAguardandoPagamento} aprovados`}
                    icon={
                        <Banknote className="h-4 w-4" />
                    }
                    className="bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300"
                />

                <CardResumo
                    titulo="Confirmar"
                    valor={formatarMoeda(
                        resumo.valorAguardandoConfirmacao
                    )}
                    descricao={`${resumo.quantidadeAguardandoConfirmacao} aguardando recebimento`}
                    icon={
                        <CheckCircle2 className="h-4 w-4" />
                    }
                    className="bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300"
                />

                <CardResumo
                    titulo="Divergências"
                    valor={formatarMoeda(
                        resumo.valorDivergencias
                    )}
                    descricao={`${resumo.quantidadeDivergencias} pendências`}
                    icon={
                        <Triangle className="h-4 w-4" />
                    }
                    className="bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300"
                />

                <CardResumo
                    titulo="A compensar"
                    valor={formatarMoeda(
                        resumo.valorDisponivelCompensacao
                    )}
                    descricao={`${resumo.quantidadeDisponiveisCompensacao} disponíveis`}
                    icon={
                        <WalletCards className="h-4 w-4" />
                    }
                    className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                />
            </section>

            <section className="mt-5 rounded-xl border border-border bg-card p-3 shadow-sm">
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[minmax(220px,1fr)_190px_210px_145px_145px_auto]">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                        <input
                            type="search"
                            value={busca}
                            onChange={(event) =>
                                setBusca(
                                    event.target
                                        .value
                                )
                            }
                            placeholder="Buscar técnico, chamado ou descrição"
                            className="h-10 w-full rounded-lg border border-border bg-background pl-9 pr-3 text-xs text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                        />
                    </div>

                    <select
                        value={tecnicoFiltro}
                        onChange={(event) =>
                            setTecnicoFiltro(
                                event.target.value
                            )
                        }
                        className="h-10 rounded-lg border border-border bg-background px-3 text-xs text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                    >
                        <option value="todos">
                            Todos os técnicos
                        </option>

                        {tecnicos.map(
                            (tecnico) => (
                                <option
                                    key={tecnico.id}
                                    value={tecnico.id}
                                >
                                    {tecnico.nome}
                                </option>
                            )
                        )}
                    </select>

                    <select
                        value={etapaFiltro}
                        onChange={(event) =>
                            setEtapaFiltro(
                                event.target
                                    .value as
                                    | EtapaAdiantamentoAdmin
                                    | "todos"
                            )
                        }
                        className="h-10 rounded-lg border border-border bg-background px-3 text-xs text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                    >
                        <option value="todos">
                            Todas as etapas
                        </option>

                        <option value="aguardando_validacao">
                            Aguardando validação
                        </option>

                        <option value="valor_reprovado">
                            Valor reprovado
                        </option>

                        <option value="aguardando_pagamento">
                            Aguardando pagamento
                        </option>

                        <option value="aguardando_confirmacao">
                            Aguardando confirmação
                        </option>

                        <option value="divergencia_recebimento">
                            Divergência
                        </option>

                        <option value="disponivel_compensacao">
                            Disponível
                        </option>

                        <option value="parcialmente_compensado">
                            Parcialmente compensado
                        </option>

                        <option value="compensado">
                            Compensado
                        </option>

                        <option value="cancelado">
                            Cancelado
                        </option>
                    </select>

                    <input
                        type="date"
                        value={dataInicio}
                        onChange={(event) =>
                            setDataInicio(
                                event.target.value
                            )
                        }
                        aria-label="Data inicial"
                        className="h-10 rounded-lg border border-border bg-background px-3 text-xs text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                    />

                    <input
                        type="date"
                        value={dataFim}
                        onChange={(event) =>
                            setDataFim(
                                event.target.value
                            )
                        }
                        aria-label="Data final"
                        className="h-10 rounded-lg border border-border bg-background px-3 text-xs text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                    />

                    <button
                        type="button"
                        onClick={limparFiltros}
                        className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-border bg-background px-3 text-xs font-bold text-foreground hover:bg-secondary"
                    >
                        <RotateCcw className="h-4 w-4" />
                        Limpar
                    </button>
                </div>
            </section>

            {erro && (
                <div className="mt-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
                    <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
                    {erro}
                </div>
            )}

            {loading ? (
                <div className="mt-5 flex min-h-[320px] items-center justify-center rounded-xl border border-border bg-card">
                    <div className="flex flex-col items-center gap-3">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />

                        <p className="text-sm text-muted-foreground">
                            Carregando adiantamentos...
                        </p>
                    </div>
                </div>
            ) : adiantamentosPaginados.length ===
              0 ? (
                <div className="mt-5 rounded-xl border border-border bg-card p-10 text-center shadow-sm">
                    <HandCoins className="mx-auto h-10 w-10 text-muted-foreground/50" />

                    <h3 className="mt-4 font-bold text-foreground">
                        Nenhum adiantamento encontrado
                    </h3>

                    <p className="mt-1 text-sm text-muted-foreground">
                        Não existem registros para os filtros selecionados.
                    </p>
                </div>
            ) : (
                <section className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {adiantamentosPaginados.map(
                        (adiantamento) => {
                            const etapa =
                                obterEtapa(
                                    adiantamento.etapa
                                );

                            const podeEditar =
                                adiantamento.status_pagamento ===
                                "pendente";

                            const podeCancelar =
                                adiantamento.status_pagamento ===
                                "pendente";

                            const podePagar =
                                adiantamento.etapa ===
                                "aguardando_pagamento";

                            const podeReenviar =
                                adiantamento.etapa ===
                                "divergencia_recebimento";

                            return (
                                <article
                                    key={
                                        adiantamento.id
                                    }
                                    className="flex min-h-[390px] flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-shadow hover:shadow-md"
                                >
                                    <div className="flex-1 p-4">
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex min-w-0 items-center gap-2.5">
                                                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                                    <UserRound className="h-4 w-4" />
                                                </span>

                                                <div className="min-w-0">
                                                    <h3 className="truncate text-sm font-bold text-foreground">
                                                        {adiantamento
                                                            .tecnico
                                                            ?.nome ||
                                                            "Técnico não informado"}
                                                    </h3>

                                                    <p className="mt-0.5 text-[10px] text-muted-foreground">
                                                        {formatarData(
                                                            adiantamento.criado_em
                                                        )}
                                                    </p>
                                                </div>
                                            </div>

                                            <span
                                                className={`max-w-[150px] shrink-0 rounded-full border px-2 py-1 text-center text-[9px] font-bold leading-3 ${etapa.className}`}
                                            >
                                                {
                                                    etapa.label
                                                }
                                            </span>
                                        </div>

                                        <div className="mt-4">
                                            <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                                                Valor
                                            </p>

                                            <p className="mt-1 text-xl font-bold text-foreground">
                                                {formatarMoeda(
                                                    adiantamento.valor_numero
                                                )}
                                            </p>

                                            <p className="mt-2 line-clamp-2 min-h-[40px] text-xs leading-5 text-muted-foreground">
                                                {
                                                    adiantamento.descricao
                                                }
                                            </p>
                                        </div>

                                        <div className="mt-4 grid grid-cols-2 gap-2 rounded-xl bg-secondary/30 p-3">
                                            <div className="min-w-0">
                                                <p className="text-[9px] uppercase tracking-wide text-muted-foreground">
                                                    Chamado
                                                </p>

                                                <p className="mt-1 truncate text-xs font-bold text-foreground">
                                                    {adiantamento
                                                        .chamado
                                                        ?.numero_chamado ||
                                                        "Não relacionado"}
                                                </p>
                                            </div>

                                            <div className="min-w-0">
                                                <p className="text-[9px] uppercase tracking-wide text-muted-foreground">
                                                    Empresa
                                                </p>

                                                <p className="mt-1 truncate text-xs font-bold text-foreground">
                                                    {adiantamento
                                                        .chamado
                                                        ?.empresa ||
                                                        "Não informada"}
                                                </p>
                                            </div>

                                            <div>
                                                <p className="text-[9px] uppercase tracking-wide text-muted-foreground">
                                                    Compensado
                                                </p>

                                                <p className="mt-1 text-xs font-bold text-foreground">
                                                    {formatarMoeda(
                                                        adiantamento.valor_compensado_numero
                                                    )}
                                                </p>
                                            </div>

                                            <div>
                                                <p className="text-[9px] uppercase tracking-wide text-muted-foreground">
                                                    Saldo
                                                </p>

                                                <p className="mt-1 text-xs font-bold text-emerald-700 dark:text-emerald-300">
                                                    {formatarMoeda(
                                                        adiantamento.saldo_compensar
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
                                                        className="min-w-0 rounded-lg border border-border bg-background p-2"
                                                    >
                                                        <p className="truncate text-[8px] font-bold uppercase tracking-wide text-muted-foreground">
                                                            {
                                                                item.label
                                                            }
                                                        </p>

                                                        <span
                                                            className={`mt-1 inline-flex max-w-full truncate rounded-full border px-1.5 py-0.5 text-[8px] font-bold ${obterClasseStatus(
                                                                item.valor
                                                            )}`}
                                                        >
                                                            {obterTextoStatus(
                                                                item.valor
                                                            )}
                                                        </span>
                                                    </div>
                                                )
                                            )}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2 border-t border-border bg-secondary/10 p-3">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setDetalheSelecionado(
                                                    adiantamento
                                                )
                                            }
                                            className="inline-flex h-8 items-center justify-center gap-1.5 rounded-lg border border-border bg-background px-2 text-[10px] font-bold text-foreground hover:bg-secondary"
                                        >
                                            <Eye className="h-3.5 w-3.5" />
                                            Visualizar
                                        </button>

                                        {podeEditar && (
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    abrirEdicao(
                                                        adiantamento
                                                    )
                                                }
                                                className="inline-flex h-8 items-center justify-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-2 text-[10px] font-bold text-blue-700 hover:bg-blue-100 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-300"
                                            >
                                                <Pencil className="h-3.5 w-3.5" />
                                                Editar
                                            </button>
                                        )}

                                        {podePagar && (
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setPagamentoSelecionado(
                                                        adiantamento
                                                    )
                                                }
                                                className="col-span-2 inline-flex h-8 items-center justify-center gap-1.5 rounded-lg bg-emerald-600 px-2 text-[10px] font-bold text-white hover:bg-emerald-700"
                                            >
                                                <CircleDollarSign className="h-3.5 w-3.5" />
                                                Registrar pagamento
                                            </button>
                                        )}

                                        {podeReenviar && (
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setAcaoSelecionada(
                                                        {
                                                            modo: "reenviar",
                                                            adiantamento,
                                                        }
                                                    )
                                                }
                                                className="col-span-2 inline-flex h-8 items-center justify-center gap-1.5 rounded-lg bg-primary px-2 text-[10px] font-bold text-primary-foreground hover:bg-primary/90"
                                            >
                                                <Send className="h-3.5 w-3.5" />
                                                Reenviar confirmação
                                            </button>
                                        )}

                                        {podeCancelar && (
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setAcaoSelecionada(
                                                        {
                                                            modo: "cancelar",
                                                            adiantamento,
                                                        }
                                                    )
                                                }
                                                className="col-span-2 inline-flex h-8 items-center justify-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-2 text-[10px] font-bold text-red-700 hover:bg-red-100 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300"
                                            >
                                                <Ban className="h-3.5 w-3.5" />
                                                Cancelar
                                            </button>
                                        )}
                                    </div>
                                </article>
                            );
                        }
                    )}
                </section>
            )}

            {adiantamentosFiltrados.length >
                ITENS_POR_PAGINA && (
                <div className="mt-5 flex flex-col gap-4 rounded-xl border border-border bg-card p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-center text-xs text-muted-foreground sm:text-left">
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
                            {
                                adiantamentosFiltrados.length
                            }
                        </span>{" "}
                        registros
                    </p>

                    <div className="flex items-center justify-center gap-1">
                        <button
                            type="button"
                            onClick={() =>
                                alterarPagina(
                                    paginaAtual - 1
                                )
                            }
                            disabled={
                                paginaAtual === 1
                            }
                            aria-label="Página anterior"
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </button>

                        {paginasVisiveis.map(
                            (pagina) => (
                                <button
                                    key={pagina}
                                    type="button"
                                    onClick={() =>
                                        alterarPagina(
                                            pagina
                                        )
                                    }
                                    aria-current={
                                        pagina ===
                                        paginaAtual
                                            ? "page"
                                            : undefined
                                    }
                                    className={`flex h-8 min-w-8 items-center justify-center rounded-lg px-2 text-xs font-bold transition-colors ${
                                        pagina ===
                                        paginaAtual
                                            ? "bg-primary text-primary-foreground shadow-sm"
                                            : "border border-border bg-background text-muted-foreground hover:bg-secondary hover:text-foreground"
                                    }`}
                                >
                                    {pagina}
                                </button>
                            )
                        )}

                        <button
                            type="button"
                            onClick={() =>
                                alterarPagina(
                                    paginaAtual + 1
                                )
                            }
                            disabled={
                                paginaAtual ===
                                totalPaginas
                            }
                            aria-label="Próxima página"
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            <ChevronRight className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            )}

            {formAberto && (
                <AdiantamentoAdminFormModal
                    adiantamento={
                        adiantamentoEditando
                    }
                    tecnicos={tecnicos}
                    salvando={processando}
                    onClose={() => {
                        setFormAberto(false);

                        setAdiantamentoEditando(
                            null
                        );
                    }}
                    onSubmit={handleSalvar}
                />
            )}

            {pagamentoSelecionado && (
                <AdiantamentoAdminPagamentoModal
                    adiantamento={
                        pagamentoSelecionado
                    }
                    salvando={processando}
                    onClose={() =>
                        setPagamentoSelecionado(
                            null
                        )
                    }
                    onSubmit={
                        handlePagamento
                    }
                />
            )}

            {acaoSelecionada && (
                <AdiantamentoAdminAcaoModal
                    modo={
                        acaoSelecionada.modo
                    }
                    adiantamento={
                        acaoSelecionada.adiantamento
                    }
                    processando={processando}
                    onClose={() =>
                        setAcaoSelecionada(
                            null
                        )
                    }
                    onConfirm={handleAcao}
                />
            )}

            {detalheSelecionado && (
                <AdiantamentoAdminDetalheModal
                    adiantamento={
                        detalheSelecionado
                    }
                    onClose={() =>
                        setDetalheSelecionado(
                            null
                        )
                    }
                />
            )}
        </div>
    );
};

export default AdiantamentosAdmin;