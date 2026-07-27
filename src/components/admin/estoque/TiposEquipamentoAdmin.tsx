import {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";
import {
    Loader2,
    Pencil,
    Plus,
    Power,
    RefreshCw,
    Search,
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

const TiposEquipamentoAdmin = () => {
    const [tipos, setTipos] = useState<
        TipoEquipamento[]
    >([]);

    const [busca, setBusca] =
        useState("");

    const [loading, setLoading] =
        useState(true);

    const [modal, setModal] =
        useState(false);

    const [editando, setEditando] =
        useState<TipoEquipamento | null>(
            null
        );

    const [nome, setNome] =
        useState("");

    const [descricao, setDescricao] =
        useState("");

    const [salvando, setSalvando] =
        useState(false);

    const carregar = useCallback(
        async () => {
            try {
                setLoading(true);
                setTipos(
                    await getTiposEquipamento(
                        true
                    )
                );
            } catch (error) {
                toast.error(
                    error instanceof Error
                        ? error.message
                        : "Erro ao carregar os tipos."
                );
            } finally {
                setLoading(false);
            }
        },
        []
    );

    useEffect(() => {
        void carregar();
    }, [carregar]);

    const filtrados = useMemo(() => {
        const termo = busca
            .trim()
            .toLocaleLowerCase("pt-BR");

        return tipos.filter(
            (item) =>
                !termo ||
                item.nome
                    .toLocaleLowerCase(
                        "pt-BR"
                    )
                    .includes(termo) ||
                item.descricao
                    ?.toLocaleLowerCase(
                        "pt-BR"
                    )
                    .includes(termo)
        );
    }, [tipos, busca]);

    const abrirNovo = () => {
        setEditando(null);
        setNome("");
        setDescricao("");
        setModal(true);
    };

    const abrirEditar = (
        item: TipoEquipamento
    ) => {
        setEditando(item);
        setNome(item.nome);
        setDescricao(
            item.descricao || ""
        );
        setModal(true);
    };

    const salvar = async () => {
        if (nome.trim().length < 2) {
            toast.error(
                "Informe um nome válido."
            );
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
            } else {
                await criarTipoEquipamento(
                    nome,
                    descricao
                );
            }

            toast.success(
                "Tipo salvo com sucesso."
            );

            setModal(false);
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

    const alternar = async (
        item: TipoEquipamento
    ) => {
        try {
            await alterarStatusTipoEquipamento(
                item.id,
                !item.ativo
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

            <div className="mb-5 flex gap-3 sm:justify-end">
                <button
                    onClick={() => void carregar()}
                    className="inline-flex h-10 items-center gap-2 rounded-lg border border-border bg-card px-4 text-sm font-bold text-foreground"
                >
                    <RefreshCw className="h-4 w-4" />
                    Atualizar
                </button>

                <button
                    onClick={abrirNovo}
                    className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-bold text-primary-foreground"
                >
                    <Plus className="h-4 w-4" />
                    Novo tipo
                </button>
            </div>

            <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                    <input
                        value={busca}
                        onChange={(event) =>
                            setBusca(
                                event.target.value
                            )
                        }
                        placeholder="Digite o nome ou descrição"
                        className="h-11 w-full rounded-lg border border-border bg-background pl-10 pr-4 text-sm text-foreground"
                    />
                </div>
            </div>

            {loading ? (
                <div className="mt-5 flex min-h-[260px] items-center justify-center rounded-xl border border-border bg-card">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : (
                <div className="mt-5 divide-y divide-border overflow-hidden rounded-xl border border-border bg-card shadow-sm">
                    {filtrados.map((item) => (
                        <div
                            key={item.id}
                            className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center"
                        >
                            <div className="min-w-0 flex-1">
                                <p className="font-bold text-foreground">
                                    {item.nome}
                                </p>

                                <p className="mt-1 text-sm text-muted-foreground">
                                    {item.descricao ||
                                        "Sem descrição"}
                                </p>
                            </div>

                            <span
                                className={`w-fit rounded-full border px-2.5 py-1 text-xs font-bold ${
                                    item.ativo
                                        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                        : "border-slate-200 bg-slate-100 text-slate-600"
                                }`}
                            >
                                {item.ativo
                                    ? "Ativo"
                                    : "Inativo"}
                            </span>

                            <div className="flex gap-2">
                                <button
                                    onClick={() =>
                                        abrirEditar(
                                            item
                                        )
                                    }
                                    className="inline-flex h-9 items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 text-xs font-bold text-blue-700"
                                >
                                    <Pencil className="h-4 w-4" />
                                    Editar
                                </button>

                                <button
                                    onClick={() =>
                                        void alternar(
                                            item
                                        )
                                    }
                                    className="inline-flex h-9 items-center gap-2 rounded-lg border border-border bg-background px-3 text-xs font-bold text-foreground"
                                >
                                    <Power className="h-4 w-4" />
                                    {item.ativo
                                        ? "Desativar"
                                        : "Ativar"}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {modal && (
                <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/60 sm:items-center sm:p-4">
                    <div className="w-full rounded-t-2xl border border-border bg-card p-5 shadow-2xl sm:max-w-lg sm:rounded-2xl">
                        <div className="flex items-start justify-between">
                            <h2 className="text-lg font-bold text-foreground">
                                {editando
                                    ? "Editar tipo"
                                    : "Novo tipo"}
                            </h2>

                            <button
                                onClick={() =>
                                    setModal(false)
                                }
                                className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <input
                            value={nome}
                            onChange={(event) =>
                                setNome(
                                    event.target.value
                                )
                            }
                            placeholder="Nome"
                            className="mt-5 h-11 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground"
                        />

                        <textarea
                            value={descricao}
                            onChange={(event) =>
                                setDescricao(
                                    event.target.value
                                )
                            }
                            rows={4}
                            placeholder="Descrição"
                            className="mt-4 w-full resize-none rounded-lg border border-border bg-background p-3 text-sm text-foreground"
                        />

                        <div className="mt-5 grid grid-cols-2 gap-3">
                            <button
                                onClick={() =>
                                    setModal(false)
                                }
                                className="h-11 rounded-lg border border-border bg-background text-sm font-bold text-foreground"
                            >
                                Cancelar
                            </button>

                            <button
                                onClick={() =>
                                    void salvar()
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
        </div>
    );
};

export default TiposEquipamentoAdmin;
