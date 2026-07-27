import {
    useCallback,
    useEffect,
    useState,
} from "react";
import {
    AlertCircle,
    Boxes,
    Loader2,
    PackagePlus,
    RefreshCw,
    RotateCcw,
    Search,
    Undo2,
    X,
} from "lucide-react";
import toast from "react-hot-toast";
import { useSearchParams } from "react-router-dom";
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
import EstoquePaginacao from "./EstoquePaginacao";

const LIMITE = 3;

const formatarTexto = (valor: string) => {
    return valor
        .replace("_", " ")
        .replace(
            /\b\w/g,
            (letra) => letra.toUpperCase()
        );
};

const classeCondicao = (
    condicao: CondicaoEquipamento
) => {
    if (condicao === "novo") {
        return "border-blue-200 bg-blue-50 text-blue-700";
    }

    if (condicao === "recondicionado") {
        return "border-amber-200 bg-amber-50 text-amber-700";
    }

    return "border-red-200 bg-red-50 text-red-700";
};

const classeSituacao = (
    situacao: SituacaoEquipamento
) => {
    if (situacao === "disponivel") {
        return "border-emerald-200 bg-emerald-50 text-emerald-700";
    }

    if (situacao === "com_tecnico") {
        return "border-indigo-200 bg-indigo-50 text-indigo-700";
    }

    if (situacao === "manutencao") {
        return "border-orange-200 bg-orange-50 text-orange-700";
    }

    return "border-slate-200 bg-slate-100 text-slate-600";
};

const EquipamentosAdmin = () => {
    const [searchParams] = useSearchParams();
    const [equipamentos, setEquipamentos] =
        useState<Equipamento[]>([]);
    const [tipos, setTipos] =
        useState<TipoEquipamento[]>([]);
    const [clientes, setClientes] =
        useState<ClienteEstoque[]>([]);
    const [tecnicos, setTecnicos] =
        useState<TecnicoEstoque[]>([]);
    const [busca, setBusca] = useState("");
    const [clienteId, setClienteId] = useState("");
    const [tecnicoId, setTecnicoId] = useState("");
    const [tipoId, setTipoId] = useState("");
    const [condicao, setCondicao] =
        useState<CondicaoEquipamento | "todos">("todos");
    const [situacao, setSituacao] =
        useState<SituacaoEquipamento | "todos">("todos");
    const [pagina, setPagina] = useState(1);
    const [total, setTotal] = useState(0);
    const [totalPaginas, setTotalPaginas] = useState(1);
    const [loading, setLoading] = useState(true);
    const [erro, setErro] = useState<string | null>(null);
    const [modalCadastroAberto, setModalCadastroAberto] = useState(false);
    const [equipamentoMovimentacao, setEquipamentoMovimentacao] =
        useState<Equipamento | null>(null);
    const [salvando, setSalvando] = useState(false);
    const [tipoNovo, setTipoNovo] = useState("");
    const [clienteNovo, setClienteNovo] = useState("");
    const [tecnicoNovo, setTecnicoNovo] = useState("");
    const [modelo, setModelo] = useState("");
    const [numeroSerie, setNumeroSerie] = useState("");
    const [patrimonio, setPatrimonio] = useState("");
    const [condicaoNova, setCondicaoNova] =
        useState<CondicaoEquipamento>("novo");
    const [observacoes, setObservacoes] = useState("");
    const [clienteDestinoId, setClienteDestinoId] = useState("");
    const [tecnicoDestinoId, setTecnicoDestinoId] = useState("");
    const [motivoMovimentacao, setMotivoMovimentacao] = useState("");
    const [observacaoMovimentacao, setObservacaoMovimentacao] = useState("");
    const [
        equipamentoDevolucao,
        setEquipamentoDevolucao,
    ] = useState<Equipamento | null>(
        null
    );
    const [
        motivoDevolucao,
        setMotivoDevolucao,
    ] = useState(
        "Devolução registrada pelo administrador"
    );
    const [
        observacaoDevolucao,
        setObservacaoDevolucao,
    ] = useState("");

    const [
        devolvendo,
        setDevolvendo,
    ] = useState(false);

    const carregarListas = useCallback(async () => {
        try {
            const [tiposDb, clientesDb, tecnicosDb] =
                await Promise.all([
                    getTiposEquipamento(),
                    getClientesEstoque(),
                    getTecnicosEstoque(),
                ]);

            setTipos(tiposDb);
            setClientes(clientesDb);
            setTecnicos(tecnicosDb);
        } catch (error) {
            setErro(
                error instanceof Error
                    ? error.message
                    : "Erro ao carregar os filtros."
            );
        }
    }, []);

    const carregarEquipamentos = useCallback(async () => {
        try {
            setLoading(true);
            setErro(null);

            const resposta = await getEquipamentos({
                busca,
                clienteId: clienteId || undefined,
                tecnicoId: tecnicoId || undefined,
                tipoId: tipoId || undefined,
                condicao,
                situacao,
                pagina,
                porPagina: LIMITE,
            });

            setEquipamentos(resposta.dados);
            setTotal(resposta.total);
            setTotalPaginas(resposta.totalPaginas);
        } catch (error) {
            setErro(
                error instanceof Error
                    ? error.message
                    : "Erro ao carregar os equipamentos."
            );
        } finally {
            setLoading(false);
        }
    }, [
        busca,
        clienteId,
        tecnicoId,
        tipoId,
        condicao,
        situacao,
        pagina,
    ]);

    useEffect(() => {
        void carregarListas();
    }, [carregarListas]);

    useEffect(() => {
        if (searchParams.get("novo") === "1") {
            setModalCadastroAberto(true);
        }
    }, [searchParams]);

    useEffect(() => {
        const temporizador = window.setTimeout(() => {
            void carregarEquipamentos();
        }, 250);

        return () => window.clearTimeout(temporizador);
    }, [carregarEquipamentos]);

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

    useEffect(() => {
        if (pagina > totalPaginas) {
            setPagina(totalPaginas);
        }
    }, [pagina, totalPaginas]);

    const limparFiltros = () => {
        setBusca("");
        setClienteId("");
        setTecnicoId("");
        setTipoId("");
        setCondicao("todos");
        setSituacao("todos");
    };

    const limparCadastro = () => {
        setTipoNovo("");
        setClienteNovo("");
        setTecnicoNovo("");
        setModelo("");
        setNumeroSerie("");
        setPatrimonio("");
        setCondicaoNova("novo");
        setObservacoes("");
    };

    const salvarEquipamento = async () => {
        if (!tipoNovo || !clienteNovo) {
            toast.error("Selecione o tipo e a empresa.");
            return;
        }

        try {
            setSalvando(true);

            await criarEquipamento({
                tipoEquipamentoId: tipoNovo,
                clienteId: clienteNovo,
                tecnicoId: tecnicoNovo || null,
                modelo: modelo.trim() || null,
                numeroSerie: numeroSerie.trim() || null,
                patrimonio: patrimonio.trim() || null,
                condicao: condicaoNova,
                observacoes: observacoes.trim() || null,
            });

            toast.success("Equipamento cadastrado.");
            setModalCadastroAberto(false);
            limparCadastro();
            await carregarEquipamentos();
        } catch (error) {
            toast.error(
                error instanceof Error
                    ? error.message
                    : "Erro ao cadastrar o equipamento."
            );
        } finally {
            setSalvando(false);
        }
    };

    const abrirMovimentacao = (equipamento: Equipamento) => {
        setEquipamentoMovimentacao(equipamento);
        setClienteDestinoId(equipamento.cliente_id);
        setTecnicoDestinoId(equipamento.tecnico_id || "");
        setMotivoMovimentacao("");
        setObservacaoMovimentacao("");
    };

    const salvarMovimentacao = async () => {
        if (!equipamentoMovimentacao || !clienteDestinoId) {
            return;
        }

        try {
            setSalvando(true);

            await movimentarEquipamento({
                equipamentoId: equipamentoMovimentacao.id,
                clienteDestinoId,
                tecnicoDestinoId: tecnicoDestinoId || null,
                motivo: motivoMovimentacao.trim() || null,
                observacoes: observacaoMovimentacao.trim() || null,
            });

            toast.success("Equipamento movimentado.");
            setEquipamentoMovimentacao(null);
            await carregarEquipamentos();
        } catch (error) {
            toast.error(
                error instanceof Error
                    ? error.message
                    : "Erro ao movimentar o equipamento."
            );
        } finally {
            setSalvando(false);
        }
    };

   const abrirModalDevolucao = (
    equipamento: Equipamento
) => {
    setEquipamentoDevolucao(
        equipamento
    );

    setMotivoDevolucao(
        "Devolução registrada pelo administrador"
    );

    setObservacaoDevolucao("");
};

const fecharModalDevolucao = () => {
    if (devolvendo) {
        return;
    }

    setEquipamentoDevolucao(null);
    setMotivoDevolucao("");
    setObservacaoDevolucao("");
};

    const confirmarDevolucao =
        async () => {
            if (!equipamentoDevolucao) {
                return;
            }

            if (
                motivoDevolucao.trim().length <
                3
            ) {
                toast.error(
                    "Informe o motivo da devolução."
                );

                return;
            }

            try {
                setDevolvendo(true);

                await devolverEquipamento({
                    equipamentoId:
                        equipamentoDevolucao.id,
                    motivo:
                        motivoDevolucao.trim(),
                    observacoes:
                        observacaoDevolucao.trim() ||
                        null,
                });

                toast.success(
                    "Devolução registrada."
                );

                setEquipamentoDevolucao(null);
                setMotivoDevolucao("");
                setObservacaoDevolucao("");

                await carregarEquipamentos();
            } catch (error) {
                toast.error(
                    error instanceof Error
                        ? error.message
                        : "Erro ao registrar a devolução."
                );
            } finally {
                setDevolvendo(false);
            }
    };

    return (
        <div>
            <AdminHeader
                title="Equipamentos"
                subtitle="Consulte, cadastre e movimente os equipamentos."
            />

            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:justify-end">
                <button
                    type="button"
                    onClick={() => void carregarEquipamentos()}
                    disabled={loading}
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-border bg-card px-4 text-sm font-bold text-foreground shadow-sm hover:bg-secondary disabled:opacity-50"
                >
                    <RefreshCw
                        className={`h-4 w-4 ${
                            loading ? "animate-spin" : ""
                        }`}
                    />
                    Atualizar
                </button>

                <button
                    type="button"
                    onClick={() => setModalCadastroAberto(true)}
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-bold text-primary-foreground shadow-sm hover:bg-primary/90"
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
                            type="search"
                            value={busca}
                            onChange={(event) => setBusca(event.target.value)}
                            placeholder="Patrimônio, série ou modelo"
                            className="h-10 w-full rounded-lg border border-border bg-background pl-9 pr-3 text-xs text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                        />
                    </div>

                    <select
                        value={clienteId}
                        onChange={(event) => setClienteId(event.target.value)}
                        className="h-10 rounded-lg border border-border bg-background px-3 text-xs text-foreground"
                    >
                        <option value="">Todas as empresas</option>
                        {clientes.map((cliente) => (
                            <option key={cliente.id} value={cliente.id}>
                                {cliente.nome}
                            </option>
                        ))}
                    </select>

                    <select
                        value={tecnicoId}
                        onChange={(event) => setTecnicoId(event.target.value)}
                        className="h-10 rounded-lg border border-border bg-background px-3 text-xs text-foreground"
                    >
                        <option value="">Todos os técnicos</option>
                        {tecnicos.map((tecnico) => (
                            <option key={tecnico.id} value={tecnico.id}>
                                {tecnico.nome}
                            </option>
                        ))}
                    </select>

                    <select
                        value={tipoId}
                        onChange={(event) => setTipoId(event.target.value)}
                        className="h-10 rounded-lg border border-border bg-background px-3 text-xs text-foreground"
                    >
                        <option value="">Todos os tipos</option>
                        {tipos.map((tipo) => (
                            <option key={tipo.id} value={tipo.id}>
                                {tipo.nome}
                            </option>
                        ))}
                    </select>

                    <select
                        value={condicao}
                        onChange={(event) =>
                            setCondicao(
                                event.target.value as
                                    | CondicaoEquipamento
                                    | "todos"
                            )
                        }
                        className="h-10 rounded-lg border border-border bg-background px-3 text-xs text-foreground"
                    >
                        <option value="todos">Todas as condições</option>
                        <option value="novo">Novo</option>
                        <option value="recondicionado">Recondicionado</option>
                        <option value="ruim">Ruim</option>
                    </select>

                    <div className="flex gap-2">
                        <select
                            value={situacao}
                            onChange={(event) =>
                                setSituacao(
                                    event.target.value as
                                        | SituacaoEquipamento
                                        | "todos"
                                )
                            }
                            className="h-10 min-w-0 flex-1 rounded-lg border border-border bg-background px-3 text-xs text-foreground"
                        >
                            <option value="todos">Todas as situações</option>
                            <option value="disponivel">Disponível</option>
                            <option value="com_tecnico">Com técnico</option>
                            <option value="manutencao">Manutenção</option>
                            <option value="baixado">Baixado</option>
                        </select>

                        <button
                            type="button"
                            onClick={limparFiltros}
                            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground hover:bg-secondary"
                        >
                            <RotateCcw className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </section>

            {erro && (
                <div className="mt-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                    <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
                    {erro}
                </div>
            )}

            {loading ? (
                <div className="mt-5 flex min-h-[320px] items-center justify-center rounded-xl border border-border bg-card">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : equipamentos.length === 0 ? (
                <div className="mt-5 rounded-xl border border-border bg-card p-10 text-center shadow-sm">
                    <Boxes className="mx-auto h-10 w-10 text-muted-foreground/40" />
                    <h3 className="mt-4 font-bold text-foreground">
                        Nenhum equipamento encontrado
                    </h3>
                </div>
            ) : (
                <div className="mt-5 rounded-xl border border-border bg-card p-4 shadow-sm sm:p-5">
                    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                        {equipamentos.map((equipamento) => (
                            <article
                                key={equipamento.id}
                                className="flex min-h-[280px] flex-col overflow-hidden rounded-xl border border-border bg-background shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
                            >
                                <div className="flex-1 p-4">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0">
                                            <p className="text-[10px] font-bold uppercase tracking-wide text-primary">
                                                {equipamento.tipo_equipamento?.nome ||
                                                    "Equipamento"}
                                            </p>

                                            <h3 className="mt-1 truncate text-base font-bold text-foreground">
                                                {equipamento.patrimonio ||
                                                    equipamento.numero_serie ||
                                                    equipamento.modelo ||
                                                    "Sem identificação"}
                                            </h3>
                                        </div>

                                        <span
                                            className={`shrink-0 rounded-full border px-2 py-1 text-[9px] font-bold ${classeSituacao(
                                                equipamento.situacao
                                            )}`}
                                        >
                                            {formatarTexto(equipamento.situacao)}
                                        </span>
                                    </div>

                                    <div className="mt-4 grid grid-cols-2 gap-3 rounded-xl bg-secondary/40 p-3">
                                        <div className="min-w-0">
                                            <p className="text-[9px] uppercase tracking-wide text-muted-foreground">
                                                Empresa
                                            </p>
                                            <p className="mt-1 truncate text-xs font-bold text-foreground">
                                                {equipamento.cliente?.nome ||
                                                    "Não informada"}
                                            </p>
                                        </div>

                                        <div className="min-w-0">
                                            <p className="text-[9px] uppercase tracking-wide text-muted-foreground">
                                                Técnico
                                            </p>
                                            <p className="mt-1 truncate text-xs font-bold text-foreground">
                                                {equipamento.tecnico?.nome ||
                                                    "Sem responsável"}
                                            </p>
                                        </div>

                                        <div>
                                            <p className="text-[9px] uppercase tracking-wide text-muted-foreground">
                                                Condição
                                            </p>
                                            <span
                                                className={`mt-1 inline-flex rounded-full border px-2 py-1 text-[9px] font-bold ${classeCondicao(
                                                    equipamento.condicao
                                                )}`}
                                            >
                                                {formatarTexto(equipamento.condicao)}
                                            </span>
                                        </div>

                                        <div className="min-w-0">
                                            <p className="text-[9px] uppercase tracking-wide text-muted-foreground">
                                                Modelo
                                            </p>
                                            <p className="mt-1 truncate text-xs font-bold text-foreground">
                                                {equipamento.modelo || "Não informado"}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-2 border-t border-border bg-secondary/20 p-3">
                                    <button
                                        type="button"
                                        onClick={() => abrirMovimentacao(equipamento)}
                                        disabled={equipamento.situacao === "baixado"}
                                        className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-primary text-xs font-bold text-primary-foreground hover:bg-primary/90 disabled:opacity-40"
                                    >
                                        <RotateCcw className="h-4 w-4" />
                                        Movimentar
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => void abrirModalDevolucao(equipamento)}
                                        disabled={
                                            !equipamento.tecnico_id ||
                                            equipamento.situacao === "baixado"
                                        }
                                        className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-amber-200 bg-amber-50 text-xs font-bold text-amber-700 hover:bg-amber-100 disabled:opacity-40"
                                    >
                                        <Undo2 className="h-4 w-4" />
                                        Devolver
                                    </button>
                                </div>
                            </article>
                        ))}
                    </section>

                    <EstoquePaginacao
                        paginaAtual={pagina}
                        totalPaginas={totalPaginas}
                        totalResultados={total}
                        limite={LIMITE}
                        onChange={setPagina}
                    />
                </div>
            )}

            {modalCadastroAberto && (
                <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center sm:p-4">
                    <div className="max-h-[96dvh] w-full overflow-y-auto rounded-t-2xl border border-border bg-card p-5 shadow-2xl sm:max-w-2xl sm:rounded-2xl sm:p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-lg font-bold text-foreground">
                                    Novo equipamento
                                </h2>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    Cadastre um item no estoque.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() => setModalCadastroAberto(false)}
                                className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="mt-5 grid gap-4 md:grid-cols-2">
                            <select
                                value={tipoNovo}
                                onChange={(event) => setTipoNovo(event.target.value)}
                                className="h-11 rounded-lg border border-border bg-background px-3"
                            >
                                <option value="">Selecione o tipo</option>
                                {tipos.map((tipo) => (
                                    <option key={tipo.id} value={tipo.id}>
                                        {tipo.nome}
                                    </option>
                                ))}
                            </select>

                            <select
                                value={clienteNovo}
                                onChange={(event) => setClienteNovo(event.target.value)}
                                className="h-11 rounded-lg border border-border bg-background px-3"
                            >
                                <option value="">Selecione a empresa</option>
                                {clientes.map((cliente) => (
                                    <option key={cliente.id} value={cliente.id}>
                                        {cliente.nome}
                                    </option>
                                ))}
                            </select>

                            <select
                                value={tecnicoNovo}
                                onChange={(event) => setTecnicoNovo(event.target.value)}
                                className="h-11 rounded-lg border border-border bg-background px-3"
                            >
                                <option value="">Sem técnico responsável</option>
                                {tecnicos.map((tecnico) => (
                                    <option key={tecnico.id} value={tecnico.id}>
                                        {tecnico.nome}
                                    </option>
                                ))}
                            </select>

                            <select
                                value={condicaoNova}
                                onChange={(event) =>
                                    setCondicaoNova(
                                        event.target.value as CondicaoEquipamento
                                    )
                                }
                                className="h-11 rounded-lg border border-border bg-background px-3"
                            >
                                <option value="novo">Novo</option>
                                <option value="recondicionado">Recondicionado</option>
                                <option value="ruim">Ruim</option>
                            </select>

                            <input
                                value={modelo}
                                onChange={(event) => setModelo(event.target.value)}
                                placeholder="Modelo"
                                className="h-11 rounded-lg border border-border bg-background px-3"
                            />

                            <input
                                value={numeroSerie}
                                onChange={(event) => setNumeroSerie(event.target.value)}
                                placeholder="Número de série"
                                className="h-11 rounded-lg border border-border bg-background px-3"
                            />

                            <input
                                value={patrimonio}
                                onChange={(event) => setPatrimonio(event.target.value)}
                                placeholder="Patrimônio"
                                className="h-11 rounded-lg border border-border bg-background px-3 md:col-span-2"
                            />

                            <textarea
                                value={observacoes}
                                onChange={(event) => setObservacoes(event.target.value)}
                                placeholder="Observações"
                                rows={4}
                                className="rounded-lg border border-border bg-background p-3 md:col-span-2"
                            />
                        </div>

                        <div className="mt-5 grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={() => setModalCadastroAberto(false)}
                                className="h-11 rounded-lg border border-border bg-background font-bold text-foreground hover:bg-secondary"
                            >
                                Cancelar
                            </button>

                            <button
                                type="button"
                                onClick={() => void salvarEquipamento()}
                                disabled={salvando}
                                className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-primary font-bold text-primary-foreground disabled:opacity-50"
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

            {equipamentoDevolucao && (
    <div
        className="fixed inset-0 z-[110] flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center sm:p-4"
        onMouseDown={(
            event
        ) => {
            if (
                event.target ===
                event.currentTarget
            ) {
                fecharModalDevolucao();
            }
        }}
    >
        <div className="w-full overflow-hidden rounded-t-2xl border border-border bg-card shadow-2xl sm:max-w-xl sm:rounded-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-border p-5 sm:p-6">
                <div className="flex items-start gap-3">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                        <Undo2 className="h-5 w-5" />
                    </span>

                    <div>
                        <h2 className="text-lg font-bold text-foreground">
                            Registrar devolução
                        </h2>

                        <p className="mt-1 text-sm text-muted-foreground">
                            Confirme os dados antes de devolver o equipamento.
                        </p>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={
                        fecharModalDevolucao
                    }
                    disabled={devolvendo}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary disabled:opacity-50"
                >
                    <X className="h-5 w-5" />
                </button>
            </div>

            <div className="p-5 sm:p-6">
                <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-4">
                    <p className="text-[10px] font-bold uppercase tracking-wide text-amber-700">
                        Equipamento selecionado
                    </p>

                    <h3 className="mt-2 font-bold text-foreground">
                        {equipamentoDevolucao
                            .tipo_equipamento
                            ?.nome ||
                            "Equipamento"}
                    </h3>

                    <p className="mt-1 text-sm text-muted-foreground">
                        {equipamentoDevolucao.patrimonio ||
                            equipamentoDevolucao.numero_serie ||
                            equipamentoDevolucao.modelo ||
                            "Sem identificação"}
                    </p>

                    <div className="mt-4 grid grid-cols-2 gap-3">
                        <div>
                            <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                                Técnico atual
                            </p>

                            <p className="mt-1 text-sm font-bold text-foreground">
                                {equipamentoDevolucao
                                    .tecnico
                                    ?.nome ||
                                    "Não informado"}
                            </p>
                        </div>

                        <div>
                            <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                                Empresa
                            </p>

                            <p className="mt-1 text-sm font-bold text-foreground">
                                {equipamentoDevolucao
                                    .cliente
                                    ?.nome ||
                                    "Não informada"}
                            </p>
                        </div>

                        <div>
                            <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                                Modelo
                            </p>

                            <p className="mt-1 text-sm font-bold text-foreground">
                                {equipamentoDevolucao.modelo ||
                                    "Não informado"}
                            </p>
                        </div>

                        <div>
                            <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                                Número de série
                            </p>

                            <p className="mt-1 break-all text-sm font-bold text-foreground">
                                {equipamentoDevolucao.numero_serie ||
                                    "Não informado"}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="mt-5">
                    <label className="text-sm font-semibold text-foreground">
                        Motivo da devolução
                    </label>

                    <input
                        value={
                            motivoDevolucao
                        }
                        onChange={(event) =>
                            setMotivoDevolucao(
                                event.target
                                    .value
                            )
                        }
                        disabled={devolvendo}
                        className="mt-1.5 h-11 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 disabled:opacity-60"
                        placeholder="Informe o motivo"
                    />
                </div>

                <div className="mt-4">
                    <label className="text-sm font-semibold text-foreground">
                        Observações
                    </label>

                    <textarea
                        value={
                            observacaoDevolucao
                        }
                        onChange={(event) =>
                            setObservacaoDevolucao(
                                event.target
                                    .value
                            )
                        }
                        disabled={devolvendo}
                        rows={4}
                        className="mt-1.5 w-full resize-none rounded-lg border border-border bg-background p-3 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 disabled:opacity-60"
                        placeholder="Informe detalhes adicionais, estado do equipamento ou alguma ocorrência"
                    />
                </div>

                <div className="mt-6 rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-700">
                    Após a confirmação, o equipamento ficará sem técnico responsável e voltará para a situação disponível.
                </div>

                <div className="mt-6 grid grid-cols-2 gap-3">
                    <button
                        type="button"
                        onClick={
                            fecharModalDevolucao
                        }
                        disabled={devolvendo}
                        className="h-11 rounded-lg border border-border bg-background text-sm font-bold text-foreground hover:bg-secondary disabled:opacity-50"
                    >
                        Cancelar
                    </button>

                    <button
                        type="button"
                        onClick={() =>
                            void confirmarDevolucao()
                        }
                        disabled={
                            devolvendo ||
                            motivoDevolucao
                                .trim()
                                .length < 3
                        }
                        className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-amber-500 text-sm font-bold text-white hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {devolvendo ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Undo2 className="h-4 w-4" />
                        )}

                        {devolvendo
                            ? "Registrando..."
                            : "Confirmar devolução"}
                    </button>
                </div>
            </div>
        </div>
    </div>
)}

            {equipamentoMovimentacao && (
                <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center sm:p-4">
                    <div className="w-full rounded-t-2xl border border-border bg-card p-5 shadow-2xl sm:max-w-xl sm:rounded-2xl sm:p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-lg font-bold text-foreground">
                                    Movimentar equipamento
                                </h2>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    {equipamentoMovimentacao.patrimonio ||
                                        equipamentoMovimentacao.numero_serie ||
                                        equipamentoMovimentacao.modelo ||
                                        "Sem identificação"}
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() => setEquipamentoMovimentacao(null)}
                                className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="mt-5 space-y-4">
                            <select
                                value={clienteDestinoId}
                                onChange={(event) => setClienteDestinoId(event.target.value)}
                                className="h-11 w-full rounded-lg border border-border bg-background px-3"
                            >
                                <option value="">Selecione a empresa</option>
                                {clientes.map((cliente) => (
                                    <option key={cliente.id} value={cliente.id}>
                                        {cliente.nome}
                                    </option>
                                ))}
                            </select>

                            <select
                                value={tecnicoDestinoId}
                                onChange={(event) => setTecnicoDestinoId(event.target.value)}
                                className="h-11 w-full rounded-lg border border-border bg-background px-3"
                            >
                                <option value="">Sem técnico responsável</option>
                                {tecnicos.map((tecnico) => (
                                    <option key={tecnico.id} value={tecnico.id}>
                                        {tecnico.nome}
                                    </option>
                                ))}
                            </select>

                            <input
                                value={motivoMovimentacao}
                                onChange={(event) => setMotivoMovimentacao(event.target.value)}
                                placeholder="Motivo"
                                className="h-11 w-full rounded-lg border border-border bg-background px-3"
                            />

                            <textarea
                                value={observacaoMovimentacao}
                                onChange={(event) => setObservacaoMovimentacao(event.target.value)}
                                rows={4}
                                placeholder="Observações"
                                className="w-full rounded-lg border border-border bg-background p-3"
                            />
                        </div>

                        <div className="mt-5 grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={() => setEquipamentoMovimentacao(null)}
                                className="h-11 rounded-lg border border-border bg-background font-bold text-foreground hover:bg-secondary"
                            >
                                Cancelar
                            </button>

                            <button
                                type="button"
                                onClick={() => void salvarMovimentacao()}
                                disabled={salvando}
                                className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-primary font-bold text-primary-foreground disabled:opacity-50"
                            >
                                {salvando && (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                )}
                                Movimentar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EquipamentosAdmin;
