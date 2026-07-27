import {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";
import {
    AlertCircle,
    CheckCircle2,
    Loader2,
    Pencil,
    Plus,
    Power,
    RefreshCw,
    Search,
    Tags,
    X,
} from "lucide-react";
import toast from "react-hot-toast";
import AdminHeader from "../AdminHeader";
import { TipoEquipamento } from "../../../types/estoque.type";
import {
    alterarStatusTipoEquipamento,
    criarTipoEquipamento,
    editarTipoEquipamento,
    getTiposEquipamento,
} from "../../../services/Estoque/estoque.service";
import EstoquePaginacao from "./EstoquePaginacao";

const LIMITE = 8;

const TiposEquipamentoAdmin = () => {
    const [tipos, setTipos] = useState<TipoEquipamento[]>([]);
    const [busca, setBusca] = useState("");
    const [pagina, setPagina] = useState(1);
    const [loading, setLoading] = useState(true);
    const [erro, setErro] = useState<string | null>(null);
    const [modalAberto, setModalAberto] = useState(false);
    const [editando, setEditando] = useState<TipoEquipamento | null>(null);
    const [nome, setNome] = useState("");
    const [descricao, setDescricao] = useState("");
    const [salvando, setSalvando] = useState(false);

    const carregar = useCallback(async () => {
        try {
            setLoading(true);
            setErro(null);

            const dados = await getTiposEquipamento(true);

            setTipos(dados);
        } catch (error) {
            setErro(
                error instanceof Error
                    ? error.message
                    : "Erro ao carregar os tipos."
            );
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void carregar();
    }, [carregar]);

    const filtrados = useMemo(() => {
        const termo = busca.trim().toLocaleLowerCase("pt-BR");

        const resultado = !termo
            ? tipos
            : tipos.filter(
                  (tipo) =>
                      tipo.nome
                          .toLocaleLowerCase("pt-BR")
                          .includes(termo) ||
                      tipo.descricao
                          ?.toLocaleLowerCase("pt-BR")
                          .includes(termo)
              );

        return [...resultado].sort((a, b) =>
            a.nome.localeCompare(b.nome, "pt-BR")
        );
    }, [tipos, busca]);

    const totalPaginas = Math.max(
        1,
        Math.ceil(filtrados.length / LIMITE)
    );

    const tiposPaginados = useMemo(() => {
        return filtrados.slice(
            (pagina - 1) * LIMITE,
            pagina * LIMITE
        );
    }, [filtrados, pagina]);

    useEffect(() => {
        setPagina(1);
    }, [busca]);

    useEffect(() => {
        if (pagina > totalPaginas) {
            setPagina(totalPaginas);
        }
    }, [pagina, totalPaginas]);

    const abrirNovo = () => {
        setEditando(null);
        setNome("");
        setDescricao("");
        setModalAberto(true);
    };

    const abrirEdicao = (tipo: TipoEquipamento) => {
        setEditando(tipo);
        setNome(tipo.nome);
        setDescricao(tipo.descricao || "");
        setModalAberto(true);
    };

    const salvar = async () => {
        if (nome.trim().length < 2) {
            toast.error("Informe um nome válido.");
            return;
        }

        try {
            setSalvando(true);

            if (editando) {
                await editarTipoEquipamento(
                    editando.id,
                    nome,
                    descricao
                );

                toast.success("Tipo atualizado.");
            } else {
                await criarTipoEquipamento(
                    nome,
                    descricao
                );

                toast.success("Tipo cadastrado.");
            }

            setModalAberto(false);
            await carregar();
        } catch (error) {
            toast.error(
                error instanceof Error
                    ? error.message
                    : "Erro ao salvar o tipo."
            );
        } finally {
            setSalvando(false);
        }
    };

    const alterarStatus = async (tipo: TipoEquipamento) => {
        try {
            await alterarStatusTipoEquipamento(
                tipo.id,
                !tipo.ativo
            );

            toast.success(
                tipo.ativo
                    ? "Tipo desativado."
                    : "Tipo ativado."
            );

            await carregar();
        } catch (error) {
            toast.error(
                error instanceof Error
                    ? error.message
                    : "Erro ao alterar o tipo."
            );
        }
    };

    return (
        <div>
            <AdminHeader
                title="Tipos de equipamento"
                subtitle="Cadastre os tipos usados no estoque."
            />

            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:justify-end">
                <button
                    type="button"
                    onClick={() => void carregar()}
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
                    onClick={abrirNovo}
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-bold text-primary-foreground shadow-sm hover:bg-primary/90"
                >
                    <Plus className="h-4 w-4" />
                    Novo tipo
                </button>
            </div>

            <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />

                    <input
                        type="search"
                        value={busca}
                        onChange={(event) => setBusca(event.target.value)}
                        placeholder="Digite o nome ou descrição"
                        className="h-11 w-full rounded-lg border border-border bg-background pl-10 pr-4 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                    />
                </div>
            </div>

            {erro && (
                <div className="mt-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                    <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
                    {erro}
                </div>
            )}

            {loading ? (
                <div className="mt-5 flex min-h-[280px] items-center justify-center rounded-xl border border-border bg-card">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : filtrados.length === 0 ? (
                <div className="mt-5 rounded-xl border border-border bg-card p-10 text-center shadow-sm">
                    <Tags className="mx-auto h-10 w-10 text-muted-foreground/40" />

                    <h3 className="mt-4 font-bold text-foreground">
                        Nenhum tipo encontrado
                    </h3>
                </div>
            ) : (
                <div className="mt-5 rounded-xl border border-border bg-card p-4 shadow-sm sm:p-5">
                    <div className="divide-y divide-border overflow-hidden rounded-xl border border-border">
                        {tiposPaginados.map((tipo) => (
                            <article
                                key={tipo.id}
                                className="flex flex-col gap-4 bg-background p-4 transition-colors hover:bg-secondary/30 sm:flex-row sm:items-center sm:justify-between"
                            >
                                <div className="flex min-w-0 items-start gap-3">
                                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                                        <Tags className="h-5 w-5" />
                                    </span>

                                    <div className="min-w-0">
                                        <h3 className="font-bold text-foreground">
                                            {tipo.nome}
                                        </h3>

                                        <p className="mt-1 text-sm text-muted-foreground">
                                            {tipo.descricao || "Sem descrição"}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex flex-wrap items-center gap-2">
                                    <span
                                        className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-bold ${
                                            tipo.ativo
                                                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                                : "border-slate-200 bg-slate-100 text-slate-600"
                                        }`}
                                    >
                                        {tipo.ativo ? "Ativo" : "Inativo"}
                                    </span>

                                    <button
                                        type="button"
                                        onClick={() => abrirEdicao(tipo)}
                                        className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 text-xs font-bold text-blue-700 hover:bg-blue-100"
                                    >
                                        <Pencil className="h-4 w-4" />
                                        Editar
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => void alterarStatus(tipo)}
                                        className={`inline-flex h-9 items-center justify-center gap-2 rounded-lg border px-3 text-xs font-bold ${
                                            tipo.ativo
                                                ? "border-slate-200 bg-background text-foreground hover:bg-secondary"
                                                : "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                                        }`}
                                    >
                                        {tipo.ativo ? (
                                            <Power className="h-4 w-4" />
                                        ) : (
                                            <CheckCircle2 className="h-4 w-4" />
                                        )}

                                        {tipo.ativo ? "Desativar" : "Ativar"}
                                    </button>
                                </div>
                            </article>
                        ))}
                    </div>

                    <EstoquePaginacao
                        paginaAtual={pagina}
                        totalPaginas={totalPaginas}
                        totalResultados={filtrados.length}
                        limite={LIMITE}
                        onChange={setPagina}
                    />
                </div>
            )}

            {modalAberto && (
                <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center sm:p-4">
                    <div className="w-full rounded-t-2xl border border-border bg-card p-5 shadow-2xl sm:max-w-lg sm:rounded-2xl sm:p-6">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <h2 className="text-lg font-bold text-foreground">
                                    {editando ? "Editar tipo" : "Novo tipo"}
                                </h2>

                                <p className="mt-1 text-sm text-muted-foreground">
                                    Informe os dados do tipo de equipamento.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() => setModalAberto(false)}
                                disabled={salvando}
                                className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="mt-5 space-y-4">
                            <div>
                                <label className="text-sm font-semibold text-foreground">
                                    Nome
                                </label>

                                <input
                                    value={nome}
                                    onChange={(event) => setNome(event.target.value)}
                                    className="mt-1.5 h-11 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                                    placeholder="Exemplo: Notebook"
                                />
                            </div>

                            <div>
                                <label className="text-sm font-semibold text-foreground">
                                    Descrição
                                </label>

                                <textarea
                                    value={descricao}
                                    onChange={(event) => setDescricao(event.target.value)}
                                    rows={4}
                                    className="mt-1.5 w-full resize-none rounded-lg border border-border bg-background p-3 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                                    placeholder="Descrição opcional"
                                />
                            </div>
                        </div>

                        <div className="mt-6 grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={() => setModalAberto(false)}
                                disabled={salvando}
                                className="h-11 rounded-lg border border-border bg-background text-sm font-bold text-foreground hover:bg-secondary"
                            >
                                Cancelar
                            </button>

                            <button
                                type="button"
                                onClick={() => void salvar()}
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
        </div>
    );
};

export default TiposEquipamentoAdmin;
