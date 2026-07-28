import {
    ReactNode,
    useEffect,
    useMemo,
    useState,
} from "react";
import {
    AlertCircle,
    Building2,
    CalendarDays,
    Check,
    ChevronLeft,
    ChevronRight,
    Clock3,
    ExternalLink,
    Eye,
    FileText,
    Loader2,
    MapPin,
    RefreshCw,
    Search,
    ThumbsDown,
    ThumbsUp,
    Wallet,
    X,
} from "lucide-react";
import toast from "react-hot-toast";
import { ChamadoTecnicoPortal } from "../../types/portal-tecnico.type";
import { getMeusChamados } from "../../services/Tecnicos/get-meus-chamados.service";
import { atualizarStatusTecnico } from "../../services/Tecnicos/atualizar-status-tecnico.service";
import StaffHeader from "./staffHeader";
import {
    formatarData,
    formatarHorario,
    formatarMoeda,
    obterClasseStatusOficial,
    obterClasseStatusTecnico,
    obterClasseValidacao,
    obterDescricaoStatusOficial,
    obterDescricaoStatusTecnico,
    obterProximaEtapa,
    obterTextoValidacao,
} from "./staff.utils";
import { validarAtendimentoTecnico } from "../../services/Tecnicos/Adiantamento-staff/validar-atendimento.service";

type FiltroStatus =
    | "todos"
    | "validar"
    | "agendados"
    | "andamento"
    | "finalizados"
    | "reprovados";

interface InformacaoCompactaProps {
    icon: ReactNode;
    label: string;
    value: string;
    className?: string;
}

interface ItemFinanceiroProps {
    label: string;
    value: string;
}

interface PaginacaoProps {
    paginaAtual: number;
    totalPaginas: number;
    totalRegistros: number;
    inicioRegistro: number;
    fimRegistro: number;
    onChange: (pagina: number) => void;
}

const ITENS_POR_PAGINA = 3;

const InformacaoCompacta = ({
    icon,
    label,
    value,
    className = "",
}: InformacaoCompactaProps) => {
    return (
        <div
            className={`flex min-w-0 items-start gap-2 rounded-lg bg-secondary/50 p-3 ${className}`}
        >
            <span className="mt-0.5 shrink-0 text-primary">
                {icon}
            </span>

            <div className="min-w-0">
                <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                    {label}
                </p>

                <p className="mt-0.5 truncate text-xs font-bold text-foreground sm:text-sm">
                    {value}
                </p>
            </div>
        </div>
    );
};

const ItemFinanceiro = ({
    label,
    value,
}: ItemFinanceiroProps) => {
    return (
        <div className="rounded-lg border border-border bg-background p-3">
            <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                {label}
            </p>

            <p className="mt-1 text-sm font-bold text-foreground">
                {value}
            </p>
        </div>
    );
};

const criarPaginasVisiveis = (
    paginaAtual: number,
    totalPaginas: number
): number[] => {
    const quantidadeMaxima = 5;

    if (totalPaginas <= quantidadeMaxima) {
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
        inicio + quantidadeMaxima - 1
    );

    inicio = Math.max(
        1,
        fim - quantidadeMaxima + 1
    );

    return Array.from(
        {
            length: fim - inicio + 1,
        },
        (_, index) => inicio + index
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
    const paginasVisiveis =
        criarPaginasVisiveis(
            paginaAtual,
            totalPaginas
        );

    if (totalRegistros === 0) {
        return null;
    }

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
                chamados
            </p>

            <div className="flex items-center justify-center gap-1">
                <button
                    type="button"
                    onClick={() =>
                        onChange(
                            paginaAtual - 1
                        )
                    }
                    disabled={
                        paginaAtual === 1
                    }
                    aria-label="Página anterior"
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
                >
                    <ChevronLeft className="h-4 w-4" />
                </button>

                {paginasVisiveis.map(
                    (pagina) => (
                        <button
                            key={pagina}
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
                    )
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

const StaffChamados = () => {
    const [chamados, setChamados] =
        useState<
            ChamadoTecnicoPortal[]
        >([]);

    const [loading, setLoading] =
        useState(true);

    const [erro, setErro] =
        useState<string | null>(null);

    const [busca, setBusca] =
        useState("");

    const [filtro, setFiltro] =
        useState<FiltroStatus>("todos");

    const [
        paginaAtual,
        setPaginaAtual,
    ] = useState(1);

    const [
        processandoId,
        setProcessandoId,
    ] = useState<string | null>(null);

    const [
        chamadoReprovacaoId,
        setChamadoReprovacaoId,
    ] = useState<string | null>(null);

    const [
        observacaoReprovacao,
        setObservacaoReprovacao,
    ] = useState("");

    const [
        chamadoDetalhes,
        setChamadoDetalhes,
    ] =
        useState<ChamadoTecnicoPortal | null>(
            null
        );

    const carregarChamados = async (
        exibirCarregamento = true
    ) => {
        try {
            if (exibirCarregamento) {
                setLoading(true);
            }

            setErro(null);

            const dados =
                await getMeusChamados();

            setChamados(dados);
        } catch (error) {
            const mensagem =
                error instanceof Error
                    ? error.message
                    : "Erro ao carregar chamados.";

            setErro(mensagem);
        } finally {
            if (exibirCarregamento) {
                setLoading(false);
            }
        }
    };

    useEffect(() => {
        void carregarChamados();
    }, []);

    useEffect(() => {
        setPaginaAtual(1);
    }, [busca, filtro]);

    const chamadosFiltrados =
        useMemo(() => {
            const termo = busca
                .trim()
                .toLocaleLowerCase(
                    "pt-BR"
                );

            return chamados.filter(
                (chamado) => {
                    const numeroChamado =
                        chamado.numero_chamado
                            ?.toLocaleLowerCase(
                                "pt-BR"
                            ) || "";

                    const empresa =
                        chamado.empresa
                            ?.toLocaleLowerCase(
                                "pt-BR"
                            ) || "";

                    const endereco =
                        chamado.endereco
                            ?.toLocaleLowerCase(
                                "pt-BR"
                            ) || "";

                    const cliente =
                        chamado.cliente?.nome
                            ?.toLocaleLowerCase(
                                "pt-BR"
                            ) || "";

                    const correspondeBusca =
                        !termo ||
                        numeroChamado.includes(
                            termo
                        ) ||
                        empresa.includes(
                            termo
                        ) ||
                        endereco.includes(
                            termo
                        ) ||
                        cliente.includes(
                            termo
                        );

                    if (!correspondeBusca) {
                        return false;
                    }

                    const validacao =
                        chamado.acompanhamento
                            ?.validacao ||
                        "pendente";

                    const codigo =
                        chamado.acompanhamento
                            ?.status_tecnico
                            ?.codigo;

                    if (
                        filtro === "validar"
                    ) {
                        return (
                            validacao ===
                            "pendente"
                        );
                    }

                    if (
                        filtro ===
                        "andamento"
                    ) {
                        return [
                            "em_deslocamento",
                            "chegou_local",
                            "atendimento_iniciado",
                        ].includes(
                            codigo || ""
                        );
                    }

                    if (
                        filtro ===
                        "finalizados"
                    ) {
                        return (
                            codigo ===
                            "atendimento_finalizado"
                        );
                    }

                    if (
                        filtro ===
                        "reprovados"
                    ) {
                        return (
                            validacao ===
                            "reprovado"
                        );
                    }

                    if (
                        filtro ===
                        "agendados"
                    ) {
                        return (
                            Number(
                                chamado.status_id
                            ) === 1
                        );
                    }

                    return true;
                }
            );
        }, [chamados, busca, filtro]);

    const totalPaginas = Math.max(
        1,
        Math.ceil(
            chamadosFiltrados.length /
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
    }, [paginaAtual, totalPaginas]);

    const chamadosPaginados =
        useMemo(() => {
            const inicio =
                (paginaAtual - 1) *
                ITENS_POR_PAGINA;

            return chamadosFiltrados.slice(
                inicio,
                inicio +
                    ITENS_POR_PAGINA
            );
        }, [
            chamadosFiltrados,
            paginaAtual,
        ]);

    const inicioRegistro =
        chamadosFiltrados.length === 0
            ? 0
            : (paginaAtual - 1) *
                  ITENS_POR_PAGINA +
              1;

    const fimRegistro = Math.min(
        paginaAtual *
            ITENS_POR_PAGINA,
        chamadosFiltrados.length
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

    const handleAprovar = async (
        chamadoId: string
    ) => {
        try {
            setProcessandoId(
                chamadoId
            );

            await validarAtendimentoTecnico(
                {
                    chamadoId,
                    aprovado: true,
                }
            );

            toast.success(
                "Atendimento aprovado com sucesso."
            );

            await carregarChamados(
                false
            );
        } catch (error) {
            toast.error(
                error instanceof Error
                    ? error.message
                    : "Erro ao aprovar atendimento."
            );
        } finally {
            setProcessandoId(null);
        }
    };

    const abrirReprovacao = (
        chamadoId: string
    ) => {
        setChamadoReprovacaoId(
            chamadoId
        );

        setObservacaoReprovacao("");
    };

    const fecharReprovacao = () => {
        setChamadoReprovacaoId(null);
        setObservacaoReprovacao("");
    };

    const handleReprovar =
        async () => {
            if (
                !chamadoReprovacaoId
            ) {
                return;
            }

            if (
                !observacaoReprovacao.trim()
            ) {
                toast.error(
                    "Informe o motivo da reprovação."
                );

                return;
            }

            try {
                setProcessandoId(
                    chamadoReprovacaoId
                );

                await validarAtendimentoTecnico(
                    {
                        chamadoId:
                            chamadoReprovacaoId,
                        aprovado: false,
                        observacao:
                            observacaoReprovacao,
                    }
                );

                toast.success(
                    "Atendimento reprovado."
                );

                fecharReprovacao();

                await carregarChamados(
                    false
                );
            } catch (error) {
                toast.error(
                    error instanceof Error
                        ? error.message
                        : "Erro ao reprovar atendimento."
                );
            } finally {
                setProcessandoId(null);
            }
        };

    const handleAvancarStatus =
    async (
        chamado: ChamadoTecnicoPortal
    ) => {
        const proximaEtapa =
            obterProximaEtapa(
                chamado.acompanhamento
                    ?.status_tecnico
                    ?.codigo
            );

        if (!proximaEtapa) {
            return;
        }

        const chamadoId = String(
            chamado.id
        );

        try {
            setProcessandoId(
                chamadoId
            );

            const acompanhamentoAtualizado =
                await atualizarStatusTecnico(
                    chamadoId,
                    proximaEtapa.codigo
                );

            setChamados(
                (chamadosAtuais) =>
                    chamadosAtuais.map(
                        (
                            chamadoAtual
                        ) =>
                            String(
                                chamadoAtual.id
                            ) ===
                            chamadoId
                                ? {
                                      ...chamadoAtual,
                                      acompanhamento:
                                          acompanhamentoAtualizado,
                                  }
                                : chamadoAtual
                    )
            );

            setChamadoDetalhes(
                (chamadoAtual) =>
                    chamadoAtual &&
                    String(
                        chamadoAtual.id
                    ) === chamadoId
                        ? {
                              ...chamadoAtual,
                              acompanhamento:
                                  acompanhamentoAtualizado,
                          }
                        : chamadoAtual
            );

            toast.success(
                "Andamento atualizado com sucesso."
            );
        } catch (error) {
            toast.error(
                error instanceof Error
                    ? error.message
                    : "Erro ao atualizar andamento."
            );
        } finally {
            setProcessandoId(null);
        }
    };

    return (
        <div>
            <StaffHeader
                title="Meus chamados"
                subtitle="Consulte, valide e atualize os seus atendimentos."
                action={
                    <button
                        type="button"
                        onClick={() =>
                            void carregarChamados()
                        }
                        disabled={loading}
                        className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-border bg-background px-4 text-sm font-bold text-foreground shadow-sm transition-colors hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
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

            <section className="mb-6 rounded-xl border border-border bg-card p-4 shadow-sm">
                <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_230px]">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />

                        <input
                            type="search"
                            value={busca}
                            onChange={(event) =>
                                setBusca(
                                    event.target
                                        .value
                                )
                            }
                            placeholder="Buscar número, empresa ou endereço"
                            className="h-11 w-full rounded-lg border border-border bg-background pl-10 pr-4 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/10"
                        />
                    </div>

                    <select
                        value={filtro}
                        onChange={(event) =>
                            setFiltro(
                                event.target
                                    .value as FiltroStatus
                            )
                        }
                        className="h-11 rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/10"
                    >
                        <option value="todos">
                            Todos os chamados
                        </option>

                        <option value="validar">
                            Aguardando validação
                        </option>

                        <option value="agendados">
                            Agendados
                        </option>

                        <option value="andamento">
                            Em andamento
                        </option>

                        <option value="finalizados">
                            Finalizados
                        </option>

                        <option value="reprovados">
                            Reprovados
                        </option>
                    </select>
                </div>
            </section>

            {erro && (
                <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                    <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />

                    <p>{erro}</p>
                </div>
            )}

            {loading ? (
                <div className="flex min-h-[300px] items-center justify-center rounded-xl border border-border bg-card">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : chamadosFiltrados.length ===
              0 ? (
                <div className="rounded-xl border border-border bg-card p-10 text-center shadow-sm">
                    <FileText className="mx-auto h-10 w-10 text-muted-foreground/50" />

                    <h3 className="mt-4 font-bold text-foreground">
                        Nenhum chamado encontrado
                    </h3>

                    <p className="mt-1 text-sm text-muted-foreground">
                        Não existem chamados
                        para os filtros
                        selecionados.
                    </p>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 gap-4 xl:grid-cols-2 2xl:grid-cols-3">
                        {chamadosPaginados.map(
                            (chamado) => {
                                const chamadoId =
                                    String(
                                        chamado.id
                                    );

                                const validacao =
                                    chamado
                                        .acompanhamento
                                        ?.validacao ||
                                    "pendente";

                                const codigoStatusTecnico =
                                    chamado
                                        .acompanhamento
                                        ?.status_tecnico
                                        ?.codigo;

                                const proximaEtapa =
                                    obterProximaEtapa(
                                        codigoStatusTecnico
                                    );

                                const processando =
                                    processandoId ===
                                    chamadoId;

                                const empresa =
                                    chamado.empresa ||
                                    chamado
                                        .cliente
                                        ?.nome ||
                                    "Empresa não informada";

                                return (
                                    <article
                                        key={
                                            chamadoId
                                        }
                                        className="flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
                                    >
                                        <div className="border-b border-border p-4">
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="min-w-0">
                                                    <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                                                        Chamado
                                                    </p>

                                                    <h3 className="mt-1 truncate text-base font-bold text-foreground">
                                                        {
                                                            chamado.numero_chamado
                                                        }
                                                    </h3>
                                                </div>

                                                <div className="shrink-0 text-right">
                                                    <p className="mb-1 text-[9px] font-bold uppercase tracking-wide text-muted-foreground">
                                                        Status oficial
                                                    </p>

                                                    <span
                                                        className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-bold ${obterClasseStatusOficial(
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
                                            </div>

                                            <div className="mt-3 flex min-w-0 items-center gap-2">
                                                <Building2 className="h-4 w-4 shrink-0 text-muted-foreground" />

                                                <p className="truncate text-sm font-semibold text-foreground">
                                                    {
                                                        empresa
                                                    }
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex flex-1 flex-col p-4">
                                            <div className="grid grid-cols-2 gap-2">
                                                <InformacaoCompacta
                                                    icon={
                                                        <CalendarDays className="h-4 w-4" />
                                                    }
                                                    label="Data"
                                                    value={formatarData(
                                                        chamado.data_agendamento
                                                    )}
                                                />

                                                <InformacaoCompacta
                                                    icon={
                                                        <Clock3 className="h-4 w-4" />
                                                    }
                                                    label="Horário"
                                                    value={formatarHorario(
                                                        chamado.hora_agendamento
                                                    )}
                                                />

                                                <InformacaoCompacta
                                                    icon={
                                                        <MapPin className="h-4 w-4" />
                                                    }
                                                    label="Endereço"
                                                    value={
                                                        chamado.endereco ||
                                                        "Não informado"
                                                    }
                                                    className="col-span-2"
                                                />
                                            </div>

                                            <div className="mt-3 rounded-xl border border-border bg-background p-3">
                                                <div className="flex items-center justify-between gap-3">
                                                    <div className="min-w-0">
                                                        <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                                                            Seu andamento
                                                        </p>

                                                        <span
                                                            className={`mt-1.5 inline-flex max-w-full truncate rounded-full border px-2.5 py-1 text-[10px] font-bold ${obterClasseStatusTecnico(
                                                                codigoStatusTecnico
                                                            )}`}
                                                        >
                                                            {obterDescricaoStatusTecnico(
                                                                chamado
                                                            )}
                                                        </span>
                                                    </div>

                                                    <div className="shrink-0 text-right">
                                                        <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                                                            Valor
                                                        </p>

                                                        <p className="mt-1 text-base font-bold text-emerald-700 dark:text-emerald-300">
                                                            {formatarMoeda(
                                                                chamado.valor_total_tecnico
                                                            )}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="mt-3">
                                                <span
                                                    className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-bold ${obterClasseValidacao(
                                                        validacao
                                                    )}`}
                                                >
                                                    {obterTextoValidacao(
                                                        validacao
                                                    )}
                                                </span>
                                            </div>

                                            <div className="mt-auto pt-4">
                                                {validacao ===
                                                    "pendente" && (
                                                    <div className="grid grid-cols-2 gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                setChamadoDetalhes(
                                                                    chamado
                                                                )
                                                            }
                                                            className="col-span-2 inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-border bg-background px-3 text-xs font-bold text-foreground transition-colors hover:bg-secondary"
                                                        >
                                                            <Eye className="h-4 w-4" />
                                                            Ver detalhes
                                                        </button>

                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                void handleAprovar(
                                                                    chamadoId
                                                                )
                                                            }
                                                            disabled={
                                                                processando
                                                            }
                                                            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-emerald-600 px-3 text-xs font-bold text-white transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                                                        >
                                                            {processando ? (
                                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                            ) : (
                                                                <ThumbsUp className="h-4 w-4" />
                                                            )}

                                                            Concordo
                                                        </button>

                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                abrirReprovacao(
                                                                    chamadoId
                                                                )
                                                            }
                                                            disabled={
                                                                processando
                                                            }
                                                            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 text-xs font-bold text-red-700 transition-colors hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                                                        >
                                                            <ThumbsDown className="h-4 w-4" />
                                                            Não concordo
                                                        </button>
                                                    </div>
                                                )}

                                                {validacao ===
                                                    "aprovado" &&
                                                    proximaEtapa && (
                                                        <div className="grid grid-cols-[auto_minmax(0,1fr)] gap-2">
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    setChamadoDetalhes(
                                                                        chamado
                                                                    )
                                                                }
                                                                aria-label="Ver detalhes"
                                                                className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                                                            >
                                                                <Eye className="h-4 w-4" />
                                                            </button>

                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    void handleAvancarStatus(
                                                                        chamado
                                                                    )
                                                                }
                                                                disabled={
                                                                    processando
                                                                }
                                                                className="inline-flex h-10 min-w-0 items-center justify-center gap-2 rounded-lg bg-primary px-3 text-xs font-bold text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
                                                            >
                                                                {processando ? (
                                                                    <Loader2 className="h-4 w-4 shrink-0 animate-spin" />
                                                                ) : (
                                                                    <Check className="h-4 w-4 shrink-0" />
                                                                )}

                                                                <span className="truncate">
                                                                    {
                                                                        proximaEtapa.label
                                                                    }
                                                                </span>
                                                            </button>
                                                        </div>
                                                    )}

                                                {validacao ===
                                                    "aprovado" &&
                                                    !proximaEtapa && (
                                                        <div className="grid grid-cols-[auto_minmax(0,1fr)] gap-2">
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    setChamadoDetalhes(
                                                                        chamado
                                                                    )
                                                                }
                                                                aria-label="Ver detalhes"
                                                                className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                                                            >
                                                                <Eye className="h-4 w-4" />
                                                            </button>

                                                            <div className="flex h-10 min-w-0 items-center justify-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 text-xs font-bold text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300">
                                                                <Check className="h-4 w-4 shrink-0" />

                                                                <span className="truncate">
                                                                    Atendimento
                                                                    finalizado
                                                                </span>
                                                            </div>
                                                        </div>
                                                    )}

                                                {validacao ===
                                                    "reprovado" && (
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setChamadoDetalhes(
                                                                chamado
                                                            )
                                                        }
                                                        className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-border bg-background px-3 text-xs font-bold text-foreground transition-colors hover:bg-secondary"
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                        Ver detalhes
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </article>
                                );
                            }
                        )}
                    </div>

                    <Paginacao
                        paginaAtual={
                            paginaAtual
                        }
                        totalPaginas={
                            totalPaginas
                        }
                        totalRegistros={
                            chamadosFiltrados.length
                        }
                        inicioRegistro={
                            inicioRegistro
                        }
                        fimRegistro={
                            fimRegistro
                        }
                        onChange={
                            handleAlterarPagina
                        }
                    />
                </>
            )}

            {chamadoDetalhes && (
                <div
                    className="fixed inset-0 z-[100] flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center sm:p-4"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="titulo-detalhes-chamado"
                >
                    <div className="flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-2xl border border-border bg-card shadow-2xl sm:max-w-3xl sm:rounded-2xl">
                        <div className="flex items-start justify-between gap-4 border-b border-border p-5 sm:p-6">
                            <div className="min-w-0">
                                <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                                    Detalhes do chamado
                                </p>

                                <h3
                                    id="titulo-detalhes-chamado"
                                    className="mt-1 break-words text-xl font-bold text-foreground"
                                >
                                    {
                                        chamadoDetalhes.numero_chamado
                                    }
                                </h3>

                                <p className="mt-1 truncate text-sm text-muted-foreground">
                                    {chamadoDetalhes.empresa ||
                                        chamadoDetalhes
                                            .cliente
                                            ?.nome ||
                                        "Empresa não informada"}
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() =>
                                    setChamadoDetalhes(
                                        null
                                    )
                                }
                                aria-label="Fechar detalhes"
                                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="overflow-y-auto p-5 sm:p-6">
                            <div className="flex flex-wrap gap-2">
                                <span
                                    className={`rounded-full border px-2.5 py-1 text-xs font-bold ${obterClasseStatusOficial(
                                        obterDescricaoStatusOficial(
                                            chamadoDetalhes
                                        )
                                    )}`}
                                >
                                    {obterDescricaoStatusOficial(
                                        chamadoDetalhes
                                    )}
                                </span>

                                <span
                                    className={`rounded-full border px-2.5 py-1 text-xs font-bold ${obterClasseValidacao(
                                        chamadoDetalhes
                                            .acompanhamento
                                            ?.validacao ||
                                            "pendente"
                                    )}`}
                                >
                                    {obterTextoValidacao(
                                        chamadoDetalhes
                                            .acompanhamento
                                            ?.validacao ||
                                            "pendente"
                                    )}
                                </span>

                                <span
                                    className={`rounded-full border px-2.5 py-1 text-xs font-bold ${obterClasseStatusTecnico(
                                        chamadoDetalhes
                                            .acompanhamento
                                            ?.status_tecnico
                                            ?.codigo
                                    )}`}
                                >
                                    {obterDescricaoStatusTecnico(
                                        chamadoDetalhes
                                    )}
                                </span>
                            </div>

                            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                                <InformacaoCompacta
                                    icon={
                                        <CalendarDays className="h-4 w-4" />
                                    }
                                    label="Data do atendimento"
                                    value={formatarData(
                                        chamadoDetalhes.data_agendamento
                                    )}
                                />

                                <InformacaoCompacta
                                    icon={
                                        <Clock3 className="h-4 w-4" />
                                    }
                                    label="Horário"
                                    value={formatarHorario(
                                        chamadoDetalhes.hora_agendamento
                                    )}
                                />

                                <InformacaoCompacta
                                    icon={
                                        <Building2 className="h-4 w-4" />
                                    }
                                    label="Empresa"
                                    value={
                                        chamadoDetalhes.empresa ||
                                        chamadoDetalhes
                                            .cliente
                                            ?.nome ||
                                        "Não informada"
                                    }
                                />

                                <InformacaoCompacta
                                    icon={
                                        <MapPin className="h-4 w-4" />
                                    }
                                    label="Endereço"
                                    value={
                                        chamadoDetalhes.endereco ||
                                        "Não informado"
                                    }
                                />
                            </div>

                            <div className="mt-5 rounded-xl border border-border bg-secondary/30 p-4">
                                <div className="flex items-center gap-2">
                                    <Wallet className="h-5 w-5 text-primary" />

                                    <h4 className="font-bold text-foreground">
                                        Valores do atendimento
                                    </h4>
                                </div>

                                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                                    <ItemFinanceiro
                                        label="Chamado"
                                        value={formatarMoeda(
                                            chamadoDetalhes.valor_chamado_tecnico
                                        )}
                                    />

                                    <ItemFinanceiro
                                        label="Hora extra"
                                        value={formatarMoeda(
                                            chamadoDetalhes.hora_extra_tecnico
                                        )}
                                    />

                                    <ItemFinanceiro
                                        label="Deslocamento"
                                        value={formatarMoeda(
                                            chamadoDetalhes.deslocamento_tecnico
                                        )}
                                    />

                                    <ItemFinanceiro
                                        label="Reembolso"
                                        value={formatarMoeda(
                                            chamadoDetalhes.reembolso_tecnico
                                        )}
                                    />
                                </div>

                                <div className="mt-3 flex items-center justify-between rounded-lg border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-900 dark:bg-emerald-950/40">
                                    <span className="text-sm font-bold text-emerald-700 dark:text-emerald-300">
                                        Total previsto
                                    </span>

                                    <span className="text-xl font-bold text-emerald-700 dark:text-emerald-300">
                                        {formatarMoeda(
                                            chamadoDetalhes.valor_total_tecnico
                                        )}
                                    </span>
                                </div>
                            </div>

                            {chamadoDetalhes.observacoes && (
                                <div className="mt-5 rounded-xl border border-border bg-background p-4">
                                    <div className="flex items-center gap-2">
                                        <FileText className="h-4 w-4 text-primary" />

                                        <h4 className="text-sm font-bold text-foreground">
                                            Observações
                                        </h4>
                                    </div>

                                    <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
                                        {
                                            chamadoDetalhes.observacoes
                                        }
                                    </p>
                                </div>
                            )}

                            {chamadoDetalhes
                                .acompanhamento
                                ?.validacao ===
                                "reprovado" &&
                                chamadoDetalhes
                                    .acompanhamento
                                    .observacao_validacao && (
                                    <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
                                        <p className="text-sm font-bold">
                                            Motivo da reprovação
                                        </p>

                                        <p className="mt-2 whitespace-pre-wrap text-sm leading-6">
                                            {
                                                chamadoDetalhes
                                                    .acompanhamento
                                                    .observacao_validacao
                                            }
                                        </p>
                                    </div>
                                )}

                            {chamadoDetalhes.url_arquivo && (
                                <a
                                    href={
                                        chamadoDetalhes.url_arquivo
                                    }
                                    target="_blank"
                                    rel="noreferrer"
                                    className="mt-5 inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-border bg-background px-4 text-sm font-bold text-primary transition-colors hover:bg-secondary"
                                >
                                    <ExternalLink className="h-4 w-4" />
                                    Abrir arquivo do chamado
                                </a>
                            )}
                        </div>

                        <div className="border-t border-border p-4 sm:p-5">
                            <button
                                type="button"
                                onClick={() =>
                                    setChamadoDetalhes(
                                        null
                                    )
                                }
                                className="h-10 w-full rounded-lg border border-border bg-background px-4 text-sm font-bold text-foreground transition-colors hover:bg-secondary"
                            >
                                Fechar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {chamadoReprovacaoId && (
                <div
                    className="fixed inset-0 z-[110] flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center sm:p-4"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="titulo-reprovacao-chamado"
                >
                    <div className="w-full rounded-t-2xl border border-border bg-card p-5 shadow-2xl sm:max-w-lg sm:rounded-2xl sm:p-6">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <h3
                                    id="titulo-reprovacao-chamado"
                                    className="text-lg font-bold text-foreground"
                                >
                                    Não concordo com o chamado
                                </h3>

                                <p className="mt-1 text-sm leading-5 text-muted-foreground">
                                    Informe
                                    obrigatoriamente
                                    o motivo da
                                    reprovação.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={
                                    fecharReprovacao
                                }
                                aria-label="Fechar"
                                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <textarea
                            value={
                                observacaoReprovacao
                            }
                            onChange={(event) =>
                                setObservacaoReprovacao(
                                    event.target
                                        .value
                                )
                            }
                            rows={5}
                            autoFocus
                            placeholder="Exemplo: o valor está incorreto, pois deveria haver um acréscimo de R$ 30,00."
                            className="mt-5 w-full resize-none rounded-lg border border-border bg-background p-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/10"
                        />

                        <div className="mt-5 grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={
                                    fecharReprovacao
                                }
                                className="h-11 rounded-lg border border-border bg-background px-4 text-sm font-bold text-foreground transition-colors hover:bg-secondary"
                            >
                                Cancelar
                            </button>

                            <button
                                type="button"
                                onClick={() =>
                                    void handleReprovar()
                                }
                                disabled={
                                    processandoId ===
                                    chamadoReprovacaoId
                                }
                                className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-red-600 px-4 text-sm font-bold text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {processandoId ===
                                chamadoReprovacaoId ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <ThumbsDown className="h-4 w-4" />
                                )}

                                Reprovar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StaffChamados;