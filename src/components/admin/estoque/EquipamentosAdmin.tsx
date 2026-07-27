import {
    useCallback,
    useEffect,
    useState,
} from "react";
import {
    ChevronLeft,
    ChevronRight,
    Loader2,
    PackagePlus,
    RefreshCw,
    RotateCcw,
    Search,
    Undo2,
    X,
} from "lucide-react";
import toast from "react-hot-toast";
import AdminHeader from "../AdminHeader";
import {
    ClienteEstoque,
    CondicaoEquipamento,
    Equipamento,
    SituacaoEquipamento,
    TecnicoEstoque,
    TipoEquipamento,
} from "../../../types/estoque.type";
import {
    criarEquipamento,
    devolverEquipamento,
    getClientesEstoque,
    getEquipamentos,
    getTecnicosEstoque,
    getTiposEquipamento,
    movimentarEquipamento,
} from "../../../services/Estoque/estoque.service";

const EquipamentosAdmin = () => {
    const [
        equipamentos,
        setEquipamentos,
    ] = useState<Equipamento[]>([]);

    const [tipos, setTipos] = useState<
        TipoEquipamento[]
    >([]);

    const [clientes, setClientes] =
        useState<ClienteEstoque[]>([]);

    const [tecnicos, setTecnicos] =
        useState<TecnicoEstoque[]>([]);

    const [busca, setBusca] =
        useState("");

    const [clienteId, setClienteId] =
        useState("");

    const [tecnicoId, setTecnicoId] =
        useState("");

    const [tipoId, setTipoId] =
        useState("");

    const [condicao, setCondicao] =
        useState<
            CondicaoEquipamento | "todos"
        >("todos");

    const [situacao, setSituacao] =
        useState<
            SituacaoEquipamento | "todos"
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

    const [modalNovo, setModalNovo] =
        useState(false);

    const [
        movimentando,
        setMovimentando,
    ] = useState<Equipamento | null>(
        null
    );

    const [salvando, setSalvando] =
        useState(false);

    const [
        formNovo,
        setFormNovo,
    ] = useState({
        tipoId: "",
        clienteId: "",
        tecnicoId: "",
        modelo: "",
        numeroSerie: "",
        patrimonio: "",
        condicao:
            "novo" as CondicaoEquipamento,
        observacoes: "",
    });

    const [
        formMovimentacao,
        setFormMovimentacao,
    ] = useState({
        clienteId: "",
        tecnicoId: "",
        motivo: "",
        observacoes: "",
    });

    const carregarListas = useCallback(
        async () => {
            const [
                tiposDb,
                clientesDb,
                tecnicosDb,
            ] = await Promise.all([
                getTiposEquipamento(),
                getClientesEstoque(),
                getTecnicosEstoque(),
            ]);

            setTipos(tiposDb);
            setClientes(clientesDb);
            setTecnicos(tecnicosDb);
        },
        []
    );

    const carregar = useCallback(
        async () => {
            try {
                setLoading(true);

                const resposta =
                    await getEquipamentos({
                        busca,
                        clienteId:
                            clienteId || undefined,
                        tecnicoId:
                            tecnicoId || undefined,
                        tipoId:
                            tipoId || undefined,
                        condicao,
                        situacao,
                        pagina,
                        porPagina: 9,
                    });

                setEquipamentos(
                    resposta.dados
                );

                setTotal(resposta.total);

                setTotalPaginas(
                    resposta.totalPaginas
                );
            } catch (error) {
                toast.error(
                    error instanceof Error
                        ? error.message
                        : "Erro ao carregar os equipamentos."
                );
            } finally {
                setLoading(false);
            }
        },
        [
            busca,
            clienteId,
            tecnicoId,
            tipoId,
            condicao,
            situacao,
            pagina,
        ]
    );

    useEffect(() => {
        void carregarListas();
    }, [carregarListas]);

    useEffect(() => {
        const timer =
            window.setTimeout(() => {
                void carregar();
            }, 250);

        return () =>
            window.clearTimeout(timer);
    }, [carregar]);

    useEffect(() => {
        setPagina(1);
    }, [
        busca,
        clienteId,
        tecnicoId,
        tipoId,
        condicao,
        situacao,
    ]);

    const salvarNovo = async () => {
        if (
            !formNovo.tipoId ||
            !formNovo.clienteId
        ) {
            toast.error(
                "Informe o tipo e a empresa."
            );
            return;
        }

        try {
            setSalvando(true);

            await criarEquipamento({
                tipoEquipamentoId:
                    formNovo.tipoId,
                clienteId:
                    formNovo.clienteId,
                tecnicoId:
                    formNovo.tecnicoId ||
                    null,
                modelo:
                    formNovo.modelo || null,
                numeroSerie:
                    formNovo.numeroSerie ||
                    null,
                patrimonio:
                    formNovo.patrimonio ||
                    null,
                condicao:
                    formNovo.condicao,
                observacoes:
                    formNovo.observacoes ||
                    null,
            });

            toast.success(
                "Equipamento cadastrado."
            );

            setModalNovo(false);

            setFormNovo({
                tipoId: "",
                clienteId: "",
                tecnicoId: "",
                modelo: "",
                numeroSerie: "",
                patrimonio: "",
                condicao: "novo",
                observacoes: "",
            });

            await carregar();
        } catch (error) {
            toast.error(
                error instanceof Error
                    ? error.message
                    : "Erro ao cadastrar."
            );
        } finally {
            setSalvando(false);
        }
    };

    const abrirMovimentacao = (
        item: Equipamento
    ) => {
        setMovimentando(item);

        setFormMovimentacao({
            clienteId: item.cliente_id,
            tecnicoId:
                item.tecnico_id || "",
            motivo: "",
            observacoes: "",
        });
    };

    const salvarMovimentacao =
        async () => {
            if (!movimentando) {
                return;
            }

            try {
                setSalvando(true);

                await movimentarEquipamento({
                    equipamentoId:
                        movimentando.id,
                    clienteDestinoId:
                        formMovimentacao.clienteId,
                    tecnicoDestinoId:
                        formMovimentacao.tecnicoId ||
                        null,
                    motivo:
                        formMovimentacao.motivo ||
                        null,
                    observacoes:
                        formMovimentacao.observacoes ||
                        null,
                });

                toast.success(
                    "Equipamento movimentado."
                );

                setMovimentando(null);
                await carregar();
            } catch (error) {
                toast.error(
                    error instanceof Error
                        ? error.message
                        : "Erro ao movimentar."
                );
            } finally {
                setSalvando(false);
            }
        };

    const devolver = async (
        item: Equipamento
    ) => {
        if (
            !window.confirm(
                "Registrar a devolução deste equipamento?"
            )
        ) {
            return;
        }

        try {
            await devolverEquipamento(
                item.id
            );

            toast.success(
                "Devolução registrada."
            );

            await carregar();
        } catch (error) {
            toast.error(
                error instanceof Error
                    ? error.message
                    : "Erro ao devolver."
            );
        }
    };

    return (
        <div>
            <AdminHeader
                title="Equipamentos"
                subtitle="Consulte, cadastre e movimente os itens."
            />

            <div className="mb-5 flex gap-3 sm:justify-end">
                <button
                    onClick={() => void carregar()}
                    className="inline-flex h-10 items-center gap-2 rounded-lg border border-border bg-card px-4 text-sm font-bold text-foreground"
                >
                    <RefreshCw className="h-4 w-4" />
                    Atualizar
                </button>

                <button
                    onClick={() =>
                        setModalNovo(true)
                    }
                    className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-bold text-primary-foreground"
                >
                    <PackagePlus className="h-4 w-4" />
                    Novo equipamento
                </button>
            </div>

            <section className="rounded-xl border border-border bg-card p-4 shadow-sm">
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                        <input
                            value={busca}
                            onChange={(event) =>
                                setBusca(
                                    event.target.value
                                )
                            }
                            placeholder="Patrimônio, série ou modelo"
                            className="h-10 w-full rounded-lg border border-border bg-background pl-9 pr-3 text-sm text-foreground"
                        />
                    </div>

                    <select
                        value={clienteId}
                        onChange={(event) =>
                            setClienteId(
                                event.target.value
                            )
                        }
                        className="h-10 rounded-lg border border-border bg-background px-3 text-sm text-foreground"
                    >
                        <option value="">
                            Todas as empresas
                        </option>

                        {clientes.map(
                            (item) => (
                                <option
                                    key={item.id}
                                    value={item.id}
                                >
                                    {item.nome}
                                </option>
                            )
                        )}
                    </select>

                    <select
                        value={tecnicoId}
                        onChange={(event) =>
                            setTecnicoId(
                                event.target.value
                            )
                        }
                        className="h-10 rounded-lg border border-border bg-background px-3 text-sm text-foreground"
                    >
                        <option value="">
                            Todos os técnicos
                        </option>

                        {tecnicos.map(
                            (item) => (
                                <option
                                    key={item.id}
                                    value={item.id}
                                >
                                    {item.nome}
                                </option>
                            )
                        )}
                    </select>

                    <select
                        value={tipoId}
                        onChange={(event) =>
                            setTipoId(
                                event.target.value
                            )
                        }
                        className="h-10 rounded-lg border border-border bg-background px-3 text-sm text-foreground"
                    >
                        <option value="">
                            Todos os tipos
                        </option>

                        {tipos.map((item) => (
                            <option
                                key={item.id}
                                value={item.id}
                            >
                                {item.nome}
                            </option>
                        ))}
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
                        className="h-10 rounded-lg border border-border bg-background px-3 text-sm text-foreground"
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

                    <select
                        value={situacao}
                        onChange={(event) =>
                            setSituacao(
                                event.target
                                    .value as
                                    | SituacaoEquipamento
                                    | "todos"
                            )
                        }
                        className="h-10 rounded-lg border border-border bg-background px-3 text-sm text-foreground"
                    >
                        <option value="todos">
                            Todas as situações
                        </option>

                        <option value="disponivel">
                            Disponível
                        </option>

                        <option value="com_tecnico">
                            Com técnico
                        </option>

                        <option value="manutencao">
                            Manutenção
                        </option>

                        <option value="baixado">
                            Baixado
                        </option>
                    </select>
                </div>
            </section>

            {loading ? (
                <div className="mt-5 flex min-h-[320px] items-center justify-center rounded-xl border border-border bg-card">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : (
                <section className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {equipamentos.map(
                        (item) => (
                            <article
                                key={item.id}
                                className="overflow-hidden rounded-xl border border-border bg-card shadow-sm"
                            >
                                <div className="p-4">
                                    <p className="text-[10px] font-bold uppercase tracking-wide text-primary">
                                        {item
                                            .tipo_equipamento
                                            ?.nome ||
                                            "Equipamento"}
                                    </p>

                                    <h3 className="mt-1 font-bold text-foreground">
                                        {item.patrimonio ||
                                            item.numero_serie ||
                                            item.modelo ||
                                            "Sem identificação"}
                                    </h3>

                                    <div className="mt-4 grid grid-cols-2 gap-3 rounded-xl bg-secondary/30 p-3 text-sm">
                                        <div>
                                            <p className="text-xs text-muted-foreground">
                                                Empresa
                                            </p>

                                            <p className="mt-1 font-bold text-foreground">
                                                {item.cliente
                                                    ?.nome ||
                                                    "Não informada"}
                                            </p>
                                        </div>

                                        <div>
                                            <p className="text-xs text-muted-foreground">
                                                Técnico
                                            </p>

                                            <p className="mt-1 font-bold text-foreground">
                                                {item.tecnico
                                                    ?.nome ||
                                                    "Sem responsável"}
                                            </p>
                                        </div>

                                        <div>
                                            <p className="text-xs text-muted-foreground">
                                                Condição
                                            </p>

                                            <p className="mt-1 font-bold text-foreground">
                                                {
                                                    item.condicao
                                                }
                                            </p>
                                        </div>

                                        <div>
                                            <p className="text-xs text-muted-foreground">
                                                Situação
                                            </p>

                                            <p className="mt-1 font-bold text-foreground">
                                                {
                                                    item.situacao
                                                }
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-2 border-t border-border bg-secondary/10 p-3">
                                    <button
                                        onClick={() =>
                                            abrirMovimentacao(
                                                item
                                            )
                                        }
                                        className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-primary text-xs font-bold text-primary-foreground"
                                    >
                                        <RotateCcw className="h-4 w-4" />
                                        Movimentar
                                    </button>

                                    <button
                                        onClick={() =>
                                            void devolver(
                                                item
                                            )
                                        }
                                        disabled={
                                            !item.tecnico_id
                                        }
                                        className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-amber-200 bg-amber-50 text-xs font-bold text-amber-700 disabled:opacity-40"
                                    >
                                        <Undo2 className="h-4 w-4" />
                                        Devolver
                                    </button>
                                </div>
                            </article>
                        )
                    )}
                </section>
            )}

            {total > 0 && (
                <div className="mt-5 flex items-center justify-between rounded-xl border border-border bg-card p-4 shadow-sm">
                    <span className="text-sm text-muted-foreground">
                        {total} equipamentos
                    </span>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() =>
                                setPagina(
                                    Math.max(
                                        1,
                                        pagina - 1
                                    )
                                )
                            }
                            disabled={pagina === 1}
                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-background disabled:opacity-40"
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </button>

                        <span className="text-sm font-bold text-foreground">
                            {pagina} de{" "}
                            {totalPaginas}
                        </span>

                        <button
                            onClick={() =>
                                setPagina(
                                    Math.min(
                                        totalPaginas,
                                        pagina + 1
                                    )
                                )
                            }
                            disabled={
                                pagina ===
                                totalPaginas
                            }
                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-background disabled:opacity-40"
                        >
                            <ChevronRight className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            )}

            {modalNovo && (
                <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/60 sm:items-center sm:p-4">
                    <div className="max-h-[96dvh] w-full overflow-y-auto rounded-t-2xl border border-border bg-card p-5 shadow-2xl sm:max-w-2xl sm:rounded-2xl">
                        <div className="flex items-start justify-between">
                            <h2 className="text-lg font-bold text-foreground">
                                Novo equipamento
                            </h2>

                            <button
                                onClick={() =>
                                    setModalNovo(false)
                                }
                                className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="mt-5 grid gap-4 md:grid-cols-2">
                            <select
                                value={
                                    formNovo.tipoId
                                }
                                onChange={(event) =>
                                    setFormNovo({
                                        ...formNovo,
                                        tipoId:
                                            event
                                                .target
                                                .value,
                                    })
                                }
                                className="h-11 rounded-lg border border-border bg-background px-3 text-sm text-foreground"
                            >
                                <option value="">
                                    Selecione o tipo
                                </option>

                                {tipos.map(
                                    (item) => (
                                        <option
                                            key={
                                                item.id
                                            }
                                            value={
                                                item.id
                                            }
                                        >
                                            {
                                                item.nome
                                            }
                                        </option>
                                    )
                                )}
                            </select>

                            <select
                                value={
                                    formNovo.condicao
                                }
                                onChange={(event) =>
                                    setFormNovo({
                                        ...formNovo,
                                        condicao:
                                            event
                                                .target
                                                .value as CondicaoEquipamento,
                                    })
                                }
                                className="h-11 rounded-lg border border-border bg-background px-3 text-sm text-foreground"
                            >
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

                            <input
                                value={
                                    formNovo.modelo
                                }
                                onChange={(event) =>
                                    setFormNovo({
                                        ...formNovo,
                                        modelo:
                                            event
                                                .target
                                                .value,
                                    })
                                }
                                placeholder="Modelo"
                                className="h-11 rounded-lg border border-border bg-background px-3 text-sm text-foreground"
                            />

                            <input
                                value={
                                    formNovo.numeroSerie
                                }
                                onChange={(event) =>
                                    setFormNovo({
                                        ...formNovo,
                                        numeroSerie:
                                            event
                                                .target
                                                .value,
                                    })
                                }
                                placeholder="Número de série"
                                className="h-11 rounded-lg border border-border bg-background px-3 text-sm text-foreground"
                            />

                            <input
                                value={
                                    formNovo.patrimonio
                                }
                                onChange={(event) =>
                                    setFormNovo({
                                        ...formNovo,
                                        patrimonio:
                                            event
                                                .target
                                                .value,
                                    })
                                }
                                placeholder="Patrimônio"
                                className="h-11 rounded-lg border border-border bg-background px-3 text-sm text-foreground"
                            />

                            <select
                                value={
                                    formNovo.clienteId
                                }
                                onChange={(event) =>
                                    setFormNovo({
                                        ...formNovo,
                                        clienteId:
                                            event
                                                .target
                                                .value,
                                    })
                                }
                                className="h-11 rounded-lg border border-border bg-background px-3 text-sm text-foreground"
                            >
                                <option value="">
                                    Selecione a empresa
                                </option>

                                {clientes.map(
                                    (item) => (
                                        <option
                                            key={
                                                item.id
                                            }
                                            value={
                                                item.id
                                            }
                                        >
                                            {
                                                item.nome
                                            }
                                        </option>
                                    )
                                )}
                            </select>

                            <select
                                value={
                                    formNovo.tecnicoId
                                }
                                onChange={(event) =>
                                    setFormNovo({
                                        ...formNovo,
                                        tecnicoId:
                                            event
                                                .target
                                                .value,
                                    })
                                }
                                className="h-11 rounded-lg border border-border bg-background px-3 text-sm text-foreground md:col-span-2"
                            >
                                <option value="">
                                    Sem técnico responsável
                                </option>

                                {tecnicos.map(
                                    (item) => (
                                        <option
                                            key={
                                                item.id
                                            }
                                            value={
                                                item.id
                                            }
                                        >
                                            {
                                                item.nome
                                            }
                                        </option>
                                    )
                                )}
                            </select>

                            <textarea
                                value={
                                    formNovo.observacoes
                                }
                                onChange={(event) =>
                                    setFormNovo({
                                        ...formNovo,
                                        observacoes:
                                            event
                                                .target
                                                .value,
                                    })
                                }
                                rows={4}
                                placeholder="Observações"
                                className="resize-none rounded-lg border border-border bg-background p-3 text-sm text-foreground md:col-span-2"
                            />
                        </div>

                        <div className="mt-5 grid grid-cols-2 gap-3">
                            <button
                                onClick={() =>
                                    setModalNovo(false)
                                }
                                className="h-11 rounded-lg border border-border bg-background text-sm font-bold text-foreground"
                            >
                                Cancelar
                            </button>

                            <button
                                onClick={() =>
                                    void salvarNovo()
                                }
                                disabled={salvando}
                                className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-primary text-sm font-bold text-primary-foreground disabled:opacity-50"
                            >
                                {salvando && (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                )}
                                Salvar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {movimentando && (
                <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/60 sm:items-center sm:p-4">
                    <div className="w-full rounded-t-2xl border border-border bg-card p-5 shadow-2xl sm:max-w-lg sm:rounded-2xl">
                        <div className="flex items-start justify-between">
                            <h2 className="text-lg font-bold text-foreground">
                                Movimentar equipamento
                            </h2>

                            <button
                                onClick={() =>
                                    setMovimentando(
                                        null
                                    )
                                }
                                className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <select
                            value={
                                formMovimentacao.clienteId
                            }
                            onChange={(event) =>
                                setFormMovimentacao({
                                    ...formMovimentacao,
                                    clienteId:
                                        event.target
                                            .value,
                                })
                            }
                            className="mt-5 h-11 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground"
                        >
                            {clientes.map(
                                (item) => (
                                    <option
                                        key={item.id}
                                        value={item.id}
                                    >
                                        {item.nome}
                                    </option>
                                )
                            )}
                        </select>

                        <select
                            value={
                                formMovimentacao.tecnicoId
                            }
                            onChange={(event) =>
                                setFormMovimentacao({
                                    ...formMovimentacao,
                                    tecnicoId:
                                        event.target
                                            .value,
                                })
                            }
                            className="mt-4 h-11 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground"
                        >
                            <option value="">
                                Sem técnico responsável
                            </option>

                            {tecnicos.map(
                                (item) => (
                                    <option
                                        key={item.id}
                                        value={item.id}
                                    >
                                        {item.nome}
                                    </option>
                                )
                            )}
                        </select>

                        <input
                            value={
                                formMovimentacao.motivo
                            }
                            onChange={(event) =>
                                setFormMovimentacao({
                                    ...formMovimentacao,
                                    motivo:
                                        event.target
                                            .value,
                                })
                            }
                            placeholder="Motivo"
                            className="mt-4 h-11 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground"
                        />

                        <textarea
                            value={
                                formMovimentacao.observacoes
                            }
                            onChange={(event) =>
                                setFormMovimentacao({
                                    ...formMovimentacao,
                                    observacoes:
                                        event.target
                                            .value,
                                })
                            }
                            rows={4}
                            placeholder="Observações"
                            className="mt-4 w-full resize-none rounded-lg border border-border bg-background p-3 text-sm text-foreground"
                        />

                        <div className="mt-5 grid grid-cols-2 gap-3">
                            <button
                                onClick={() =>
                                    setMovimentando(
                                        null
                                    )
                                }
                                className="h-11 rounded-lg border border-border bg-background text-sm font-bold text-foreground"
                            >
                                Cancelar
                            </button>

                            <button
                                onClick={() =>
                                    void salvarMovimentacao()
                                }
                                disabled={salvando}
                                className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-primary text-sm font-bold text-primary-foreground disabled:opacity-50"
                            >
                                {salvando && (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                )}
                                Transferir
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EquipamentosAdmin;
