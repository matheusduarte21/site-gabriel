import {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";
import type { ReactNode } from "react";
import {
    AlertCircle,
    Boxes,
    ChevronLeft,
    ChevronRight,
    Circle,
    Eye,
    Loader2,
    PackageCheck,
    RefreshCw,
    RotateCcw,
    Search,
    ShieldCheck,
    Wrench,
} from "lucide-react";
import StaffHeader from "./StaffHeader";
import StaffEquipamentoDetalheModal from "./StaffEquipamentoDetalheModal";

import {
    CondicaoEquipamento,
    Equipamento,
    OpcaoFiltroEstoque,
    ResumoMeuEstoqueTecnico,
} from "../../types/estoque.type";
import { getMeuEstoqueTecnico, getResumoMeuEstoqueTecnico } from "../../services/Tecnicos/Estoque-tecnico/get-meu-estoque-tecnico.service";

interface CardResumoProps {
    titulo: string;
    valor: number;
    descricao: string;
    icon: ReactNode;
    className: string;
}

const ITENS_POR_PAGINA = 6;

const resumoInicial: ResumoMeuEstoqueTecnico =
    {
        total: 0,
        novos: 0,
        recondicionados: 0,
        ruins: 0,
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

                    <p className="mt-1.5 text-2xl font-bold text-foreground">
                        {valor}
                    </p>

                    <p className="mt-1 text-xs text-muted-foreground">
                        {descricao}
                    </p>
                </div>

                <span
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${className}`}
                >
                    {icon}
                </span>
            </div>
        </div>
    );
};

const formatarCondicao = (
    condicao: CondicaoEquipamento
): string => {
    const nomes: Record<
        CondicaoEquipamento,
        string
    > = {
        novo: "Novo",
        recondicionado:
            "Recondicionado",
        ruim: "Ruim",
    };

    return nomes[condicao];
};

const formatarSituacao = (
    situacao: Equipamento["situacao"]
): string => {
    const nomes: Record<
        Equipamento["situacao"],
        string
    > = {
        disponivel: "Disponível",
        com_tecnico: "Com técnico",
        manutencao: "Em manutenção",
        baixado: "Baixado",
    };

    return nomes[situacao];
};

const formatarData = (
    valor?: string | null
): string => {
    if (!valor) {
        return "Não informada";
    }

    const data = new Date(valor);

    if (
        Number.isNaN(data.getTime())
    ) {
        return valor;
    }

    return new Intl.DateTimeFormat(
        "pt-BR",
        {
            dateStyle: "short",
            timeStyle: "short",
        }
    ).format(data);
};

const classeCondicao = (
    condicao: CondicaoEquipamento
): string => {
    if (condicao === "novo") {
        return "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-300";
    }

    if (
        condicao ===
        "recondicionado"
    ) {
        return "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300";
    }

    return "border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300";
};

const classeSituacao = (
    situacao: Equipamento["situacao"]
): string => {
    if (
        situacao === "com_tecnico"
    ) {
        return "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300";
    }

    if (
        situacao === "manutencao"
    ) {
        return "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300";
    }

    if (
        situacao === "baixado"
    ) {
        return "border-slate-200 bg-slate-100 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300";
    }

    return "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-300";
};

const StaffEstoque = () => {
    const [
        equipamentos,
        setEquipamentos,
    ] = useState<Equipamento[]>([]);

    const [resumo, setResumo] =
        useState<ResumoMeuEstoqueTecnico>(
            resumoInicial
        );

    const [tipos, setTipos] =
        useState<OpcaoFiltroEstoque[]>(
            []
        );

    const [empresas, setEmpresas] =
        useState<OpcaoFiltroEstoque[]>(
            []
        );

    const [busca, setBusca] =
        useState("");

    const [tipoId, setTipoId] =
        useState("");

    const [clienteId, setClienteId] =
        useState("");

    const [condicao, setCondicao] =
        useState<
            CondicaoEquipamento | "todos"
        >("todos");

    const [pagina, setPagina] =
        useState(1);

    const [total, setTotal] =
        useState(0);

    const [
        totalPaginas,
        setTotalPaginas,
    ] = useState(1);

    const [loading, setLoading] =
        useState(true);

    const [
        atualizando,
        setAtualizando,
    ] = useState(false);

    const [erro, setErro] =
        useState<string | null>(null);

    const [
        detalheSelecionado,
        setDetalheSelecionado,
    ] =
        useState<Equipamento | null>(
            null
        );

    const carregarOpcoes =
        useCallback(async () => {
            const resposta =
                await getMeuEstoqueTecnico(
                    {
                        pagina: 1,
                        porPagina: 1000,
                    }
                );

            const mapaTipos = new Map<
                string,
                string
            >();

            const mapaEmpresas = new Map<
                string,
                string
            >();

            resposta.dados.forEach(
                (equipamento) => {
                    if (
                        equipamento
                            .tipo_equipamento
                            ?.id &&
                        equipamento
                            .tipo_equipamento
                            ?.nome
                    ) {
                        mapaTipos.set(
                            equipamento
                                .tipo_equipamento
                                .id,
                            equipamento
                                .tipo_equipamento
                                .nome
                        );
                    }

                    if (
                        equipamento.cliente
                            ?.id &&
                        equipamento.cliente
                            ?.nome
                    ) {
                        mapaEmpresas.set(
                            equipamento.cliente
                                .id,
                            equipamento.cliente
                                .nome
                        );
                    }
                }
            );

            setTipos(
                Array.from(
                    mapaTipos.entries()
                )
                    .map(
                        ([id, nome]) => ({
                            id,
                            nome,
                        })
                    )
                    .sort((a, b) =>
                        a.nome.localeCompare(
                            b.nome,
                            "pt-BR"
                        )
                    )
            );

            setEmpresas(
                Array.from(
                    mapaEmpresas.entries()
                )
                    .map(
                        ([id, nome]) => ({
                            id,
                            nome,
                        })
                    )
                    .sort((a, b) =>
                        a.nome.localeCompare(
                            b.nome,
                            "pt-BR"
                        )
                    )
            );
        }, []);

    const carregarDados =
        useCallback(
            async (
                mostrarLoading = true
            ) => {
                try {
                    if (mostrarLoading) {
                        setLoading(true);
                    } else {
                        setAtualizando(true);
                    }

                    setErro(null);

                    const [
                        respostaEquipamentos,
                        respostaResumo,
                    ] = await Promise.all([
                        getMeuEstoqueTecnico(
                            {
                                busca,
                                tipoId:
                                    tipoId ||
                                    undefined,
                                clienteId:
                                    clienteId ||
                                    undefined,
                                condicao,
                                pagina,
                                porPagina:
                                    ITENS_POR_PAGINA,
                            }
                        ),
                        getResumoMeuEstoqueTecnico(),
                    ]);

                    setEquipamentos(
                        respostaEquipamentos.dados
                    );

                    setTotal(
                        respostaEquipamentos.total
                    );

                    setTotalPaginas(
                        respostaEquipamentos.totalPaginas
                    );

                    setResumo(
                        respostaResumo
                    );
                } catch (error) {
                    setErro(
                        error instanceof
                            Error
                            ? error.message
                            : "Erro ao carregar o estoque."
                    );
                } finally {
                    setLoading(false);
                    setAtualizando(false);
                }
            },
            [
                busca,
                tipoId,
                clienteId,
                condicao,
                pagina,
            ]
        );

    useEffect(() => {
        void carregarOpcoes();
    }, [carregarOpcoes]);

    useEffect(() => {
        const temporizador =
            window.setTimeout(() => {
                void carregarDados();
            }, 250);

        return () => {
            window.clearTimeout(
                temporizador
            );
        };
    }, [carregarDados]);

    useEffect(() => {
        setPagina(1);
    }, [
        busca,
        tipoId,
        clienteId,
        condicao,
    ]);

    useEffect(() => {
        if (
            pagina > totalPaginas
        ) {
            setPagina(
                totalPaginas
            );
        }
    }, [
        pagina,
        totalPaginas,
    ]);

    const inicioRegistro =
        total === 0
            ? 0
            : (pagina - 1) *
                  ITENS_POR_PAGINA +
              1;

    const fimRegistro = Math.min(
        pagina * ITENS_POR_PAGINA,
        total
    );

    const identificacaoEquipamento =
        useCallback(
            (
                equipamento: Equipamento
            ) => {
                return (
                    equipamento.patrimonio ||
                    equipamento.numero_serie ||
                    equipamento.modelo ||
                    "Sem identificação"
                );
            },
            []
        );

    const filtrosAtivos =
        useMemo(() => {
            return Boolean(
                busca ||
                    tipoId ||
                    clienteId ||
                    condicao !== "todos"
            );
        }, [
            busca,
            tipoId,
            clienteId,
            condicao,
        ]);

    const limparFiltros = () => {
        setBusca("");
        setTipoId("");
        setClienteId("");
        setCondicao("todos");
        setPagina(1);
    };

    const atualizar = async () => {
        await Promise.all([
            carregarDados(false),
            carregarOpcoes(),
        ]);
    };

    const alterarPagina = (
        novaPagina: number
    ) => {
        if (
            novaPagina < 1 ||
            novaPagina > totalPaginas
        ) {
            return;
        }

        setPagina(novaPagina);

        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };

    return (
        <div>
            <StaffHeader
                title="Meu estoque"
                subtitle="Consulte os equipamentos atualmente atribuídos a você."
                action={
                    <button
                        type="button"
                        onClick={() =>
                            void atualizar()
                        }
                        disabled={
                            loading ||
                            atualizando
                        }
                        className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-border bg-background px-4 text-sm font-bold text-foreground shadow-sm hover:bg-secondary disabled:opacity-50"
                    >
                        <RefreshCw
                            className={`h-4 w-4 ${
                                loading ||
                                atualizando
                                    ? "animate-spin"
                                    : ""
                            }`}
                        />

                        Atualizar
                    </button>
                }
            />

            <section className="grid grid-cols-2 gap-3 xl:grid-cols-4">
                <CardResumo
                    titulo="Total"
                    valor={resumo.total}
                    descricao="Equipamentos atribuídos"
                    icon={
                        <Boxes className="h-5 w-5" />
                    }
                    className="bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300"
                />

                <CardResumo
                    titulo="Novos"
                    valor={resumo.novos}
                    descricao="Equipamentos novos"
                    icon={
                        <ShieldCheck className="h-5 w-5" />
                    }
                    className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                />

                <CardResumo
                    titulo="Recondicionados"
                    valor={
                        resumo.recondicionados
                    }
                    descricao="Equipamentos recuperados"
                    icon={
                        <Wrench className="h-5 w-5" />
                    }
                    className="bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300"
                />

                <CardResumo
                    titulo="Condição ruim"
                    valor={resumo.ruins}
                    descricao="Equipamentos com atenção"
                    icon={
                        <Circle className="h-5 w-5" />
                    }
                    className="bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300"
                />
            </section>

            <section className="mt-5 rounded-xl border border-border bg-card p-4 shadow-sm">
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[minmax(240px,1fr)_220px_220px_190px_auto]">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                        <input
                            type="search"
                            value={busca}
                            onChange={(
                                event
                            ) =>
                                setBusca(
                                    event.target
                                        .value
                                )
                            }
                            placeholder="Buscar patrimônio, série ou modelo"
                            className="h-10 w-full rounded-lg border border-border bg-background pl-9 pr-3 text-xs text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                        />
                    </div>

                    <select
                        value={tipoId}
                        onChange={(event) =>
                            setTipoId(
                                event.target.value
                            )
                        }
                        className="h-10 rounded-lg border border-border bg-background px-3 text-xs text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                    >
                        <option value="">
                            Todos os tipos
                        </option>

                        {tipos.map(
                            (tipo) => (
                                <option
                                    key={tipo.id}
                                    value={tipo.id}
                                >
                                    {tipo.nome}
                                </option>
                            )
                        )}
                    </select>

                    <select
                        value={clienteId}
                        onChange={(event) =>
                            setClienteId(
                                event.target.value
                            )
                        }
                        className="h-10 rounded-lg border border-border bg-background px-3 text-xs text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                    >
                        <option value="">
                            Todas as empresas
                        </option>

                        {empresas.map(
                            (empresa) => (
                                <option
                                    key={
                                        empresa.id
                                    }
                                    value={
                                        empresa.id
                                    }
                                >
                                    {
                                        empresa.nome
                                    }
                                </option>
                            )
                        )}
                    </select>

                    <select
                        value={condicao}
                        onChange={(event) =>
                            setCondicao(
                                event.target
                                    .value as
                                    | CondicaoEquipamento
                                    | "todos"
                            )
                        }
                        className="h-10 rounded-lg border border-border bg-background px-3 text-xs text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                    >
                        <option value="todos">
                            Todas as condições
                        </option>

                        <option value="novo">
                            Novo
                        </option>

                        <option value="recondicionado">
                            Recondicionado
                        </option>

                        <option value="ruim">
                            Ruim
                        </option>
                    </select>

                    <button
                        type="button"
                        onClick={limparFiltros}
                        disabled={
                            !filtrosAtivos
                        }
                        className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-border bg-background px-4 text-xs font-bold text-foreground hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-40"
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
                            Carregando seu estoque...
                        </p>
                    </div>
                </div>
            ) : equipamentos.length ===
              0 ? (
                <div className="mt-5 rounded-xl border border-border bg-card p-10 text-center shadow-sm">
                    <PackageCheck className="mx-auto h-10 w-10 text-muted-foreground/50" />

                    <h3 className="mt-4 font-bold text-foreground">
                        Nenhum equipamento encontrado
                    </h3>

                    <p className="mt-1 text-sm text-muted-foreground">
                        Você não possui equipamentos para os filtros selecionados.
                    </p>
                </div>
            ) : (
                <section className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {equipamentos.map(
                        (equipamento) => (
                            <article
                                key={
                                    equipamento.id
                                }
                                className="flex min-h-[320px] flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-shadow hover:shadow-md"
                            >
                                <div className="flex-1 p-4">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0">
                                            <p className="text-[10px] font-bold uppercase tracking-wide text-primary">
                                                {equipamento
                                                    .tipo_equipamento
                                                    ?.nome ||
                                                    "Equipamento"}
                                            </p>

                                            <h3 className="mt-1 truncate text-base font-bold text-foreground">
                                                {identificacaoEquipamento(
                                                    equipamento
                                                )}
                                            </h3>
                                        </div>

                                        <span
                                            className={`shrink-0 rounded-full border px-2 py-1 text-[9px] font-bold ${classeCondicao(
                                                equipamento.condicao
                                            )}`}
                                        >
                                            {formatarCondicao(
                                                equipamento.condicao
                                            )}
                                        </span>
                                    </div>

                                    <div className="mt-4 grid grid-cols-2 gap-2 rounded-xl bg-secondary/30 p-3">
                                        <div className="min-w-0">
                                            <p className="text-[9px] font-bold uppercase tracking-wide text-muted-foreground">
                                                Modelo
                                            </p>

                                            <p className="mt-1 truncate text-xs font-bold text-foreground">
                                                {equipamento.modelo ||
                                                    "Não informado"}
                                            </p>
                                        </div>

                                        <div className="min-w-0">
                                            <p className="text-[9px] font-bold uppercase tracking-wide text-muted-foreground">
                                                Empresa
                                            </p>

                                            <p className="mt-1 truncate text-xs font-bold text-foreground">
                                                {equipamento
                                                    .cliente
                                                    ?.nome ||
                                                    "Não informada"}
                                            </p>
                                        </div>

                                        <div className="min-w-0">
                                            <p className="text-[9px] font-bold uppercase tracking-wide text-muted-foreground">
                                                Patrimônio
                                            </p>

                                            <p className="mt-1 truncate text-xs font-bold text-foreground">
                                                {equipamento.patrimonio ||
                                                    "Não informado"}
                                            </p>
                                        </div>

                                        <div className="min-w-0">
                                            <p className="text-[9px] font-bold uppercase tracking-wide text-muted-foreground">
                                                Número de série
                                            </p>

                                            <p className="mt-1 truncate text-xs font-bold text-foreground">
                                                {equipamento.numero_serie ||
                                                    "Não informado"}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mt-3 flex items-center justify-between rounded-lg border border-border bg-background p-3">
                                        <div>
                                            <p className="text-[9px] font-bold uppercase tracking-wide text-muted-foreground">
                                                Situação
                                            </p>

                                            <span
                                                className={`mt-1 inline-flex rounded-full border px-2 py-1 text-[9px] font-bold ${classeSituacao(
                                                    equipamento.situacao
                                                )}`}
                                            >
                                                {formatarSituacao(
                                                    equipamento.situacao
                                                )}
                                            </span>
                                        </div>

                                        <div className="text-right">
                                            <p className="text-[9px] font-bold uppercase tracking-wide text-muted-foreground">
                                                Atualizado
                                            </p>

                                            <p className="mt-1 text-[10px] font-semibold text-foreground">
                                                {formatarData(
                                                    equipamento.atualizado_em
                                                )}
                                            </p>
                                        </div>
                                    </div>

                                    {equipamento.observacoes && (
                                        <div className="mt-3 rounded-lg border border-border bg-secondary/20 p-3">
                                            <p className="line-clamp-2 text-xs leading-5 text-muted-foreground">
                                                {
                                                    equipamento.observacoes
                                                }
                                            </p>
                                        </div>
                                    )}
                                </div>

                                <div className="border-t border-border bg-secondary/10 p-3">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setDetalheSelecionado(
                                                equipamento
                                            )
                                        }
                                        className="inline-flex h-9 w-full items-center justify-center gap-2 rounded-lg border border-border bg-background text-xs font-bold text-foreground hover:bg-secondary"
                                    >
                                        <Eye className="h-4 w-4" />
                                        Visualizar detalhes
                                    </button>
                                </div>
                            </article>
                        )
                    )}
                </section>
            )}

            {total > 0 && (
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
                            {total}
                        </span>{" "}
                        equipamentos
                    </p>

                    <div className="flex items-center justify-center gap-2">
                        <button
                            type="button"
                            onClick={() =>
                                alterarPagina(
                                    pagina - 1
                                )
                            }
                            disabled={
                                pagina === 1
                            }
                            aria-label="Página anterior"
                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </button>

                        <span className="min-w-[86px] text-center text-sm font-bold text-foreground">
                            {pagina} de{" "}
                            {totalPaginas}
                        </span>

                        <button
                            type="button"
                            onClick={() =>
                                alterarPagina(
                                    pagina + 1
                                )
                            }
                            disabled={
                                pagina ===
                                totalPaginas
                            }
                            aria-label="Próxima página"
                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            <ChevronRight className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            )}

            {detalheSelecionado && (
                <StaffEquipamentoDetalheModal
                    equipamento={
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

export default StaffEstoque;