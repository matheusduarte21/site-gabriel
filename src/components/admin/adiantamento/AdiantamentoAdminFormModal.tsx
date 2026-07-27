import { HandCoins, X, UserRound, ClipboardList, Loader2, CircleDollarSign } from "lucide-react";
import { useState, useEffect, useMemo, FormEvent } from "react";
import { getChamadosDoTecnicoParaAdiantamentoAdmin } from "../../../services/Adiantamentos/admin/get-chamados-tecnico-adiantamento-admin.service";
import { AdiantamentoAdmin, TecnicoOpcaoAdiantamento, ChamadoOpcaoAdiantamento } from "../../../types/diantamento-admin.type";

interface AdiantamentoFormPayload {
    tecnicoId: string;
    valor: number;
    descricao: string;
    chamadoId: string | null;
}

interface AdiantamentoAdminFormModalProps {
    adiantamento?: AdiantamentoAdmin | null;
    tecnicos: TecnicoOpcaoAdiantamento[];
    salvando: boolean;
    onClose: () => void;
    onSubmit: (
        payload: AdiantamentoFormPayload
    ) => Promise<void>;
}

const formatarMoeda = (
    valor: number | string | null | undefined
) => {
    const numero = Number(valor || 0);

    return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
    }).format(
        Number.isFinite(numero)
            ? numero
            : 0
    );
};

const AdiantamentoAdminFormModal = ({
    adiantamento,
    tecnicos,
    salvando,
    onClose,
    onSubmit,
}: AdiantamentoAdminFormModalProps) => {
    const [tecnicoId, setTecnicoId] =
        useState("");

    const [chamadoId, setChamadoId] =
        useState("");

    const [valor, setValor] =
        useState("");

    const [descricao, setDescricao] =
        useState("");

    const [chamados, setChamados] =
        useState<ChamadoOpcaoAdiantamento[]>(
            []
        );

    const [
        carregandoChamados,
        setCarregandoChamados,
    ] = useState(false);

    const [erroChamados, setErroChamados] =
        useState<string | null>(null);

    const [erro, setErro] =
        useState("");

    const editando = Boolean(
        adiantamento
    );

    useEffect(() => {
        setTecnicoId(
            adiantamento?.tecnico_id || ""
        );

        setChamadoId(
            adiantamento?.chamado_id || ""
        );

        setValor(
            adiantamento
                ? String(
                      adiantamento.valor_numero.toFixed(
                          2
                      )
                  )
                : ""
        );

        setDescricao(
            adiantamento?.descricao || ""
        );

        setErro("");
    }, [adiantamento]);

    useEffect(() => {
        let ativo = true;

        const carregarChamados =
            async () => {
                if (!tecnicoId) {
                    setChamados([]);
                    setErroChamados(null);
                    return;
                }

                try {
                    setCarregandoChamados(true);
                    setErroChamados(null);

                    const dados =
                        await getChamadosDoTecnicoParaAdiantamentoAdmin(
                            tecnicoId
                        );

                    if (ativo) {
                        setChamados(dados);
                    }
                } catch (error) {
                    if (ativo) {
                        setChamados([]);

                        setErroChamados(
                            error instanceof Error
                                ? error.message
                                : "Erro ao carregar chamados."
                        );
                    }
                } finally {
                    if (ativo) {
                        setCarregandoChamados(
                            false
                        );
                    }
                }
            };

        void carregarChamados();

        return () => {
            ativo = false;
        };
    }, [tecnicoId]);

    const chamadoSelecionado =
        useMemo(() => {
            return chamados.find(
                (chamado) =>
                    chamado.id === chamadoId
            );
        }, [chamados, chamadoId]);

    const handleSubmit = async (
        event: FormEvent
    ) => {
        event.preventDefault();

        const valorNumero = Number(
            valor.replace(",", ".")
        );

        if (!tecnicoId) {
            setErro(
                "Selecione o técnico."
            );

            return;
        }

        if (
            !Number.isFinite(valorNumero) ||
            valorNumero <= 0
        ) {
            setErro(
                "Informe um valor maior que zero."
            );

            return;
        }

        if (
            descricao.trim().length < 3
        ) {
            setErro(
                "Informe uma descrição válida."
            );

            return;
        }

        setErro("");

        await onSubmit({
            tecnicoId,
            valor: valorNumero,
            descricao: descricao.trim(),
            chamadoId:
                chamadoId || null,
        });
    };

    return (
        <div
            className="fixed inset-0 z-[100] flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center sm:p-4"
            role="dialog"
            aria-modal="true"
            onMouseDown={(event) => {
                if (
                    event.target ===
                        event.currentTarget &&
                    !salvando
                ) {
                    onClose();
                }
            }}
        >
            <div className="flex max-h-[96dvh] w-full flex-col overflow-hidden rounded-t-2xl border border-border bg-card shadow-2xl sm:max-w-2xl sm:rounded-2xl">
                <div className="flex shrink-0 items-start justify-between gap-4 border-b border-border p-5 sm:p-6">
                    <div className="flex items-start gap-3">
                        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">
                            <HandCoins className="h-5 w-5" />
                        </span>

                        <div>
                            <h2 className="text-lg font-bold text-foreground">
                                {editando
                                    ? "Editar adiantamento"
                                    : "Novo adiantamento"}
                            </h2>

                            <p className="mt-1 text-sm text-muted-foreground">
                                Cadastre o valor que será enviado para validação do técnico.
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        disabled={salvando}
                        aria-label="Fechar"
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground disabled:opacity-50"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <form
                    onSubmit={handleSubmit}
                    className="overflow-y-auto p-5 sm:p-6"
                >
                    <div className="space-y-5">
                        {erro && (
                            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
                                {erro}
                            </div>
                        )}

                        {editando && (
                            <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300">
                                Ao editar este adiantamento, a aprovação anterior será reiniciada e o técnico deverá validar novamente.
                            </div>
                        )}

                        <div className="space-y-1.5">
                            <label
                                htmlFor="adiantamento-tecnico"
                                className="text-sm font-semibold text-foreground"
                            >
                                Técnico
                            </label>

                            <div className="relative">
                                <UserRound className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />

                                <select
                                    id="adiantamento-tecnico"
                                    value={tecnicoId}
                                    disabled={
                                        editando ||
                                        salvando
                                    }
                                    onChange={(
                                        event
                                    ) => {
                                        setTecnicoId(
                                            event.target
                                                .value
                                        );

                                        setChamadoId(
                                            ""
                                        );
                                    }}
                                    required
                                    className="h-11 w-full appearance-none rounded-xl border border-border bg-background pl-10 pr-4 text-sm text-foreground outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/10 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    <option value="">
                                        Selecione o técnico
                                    </option>

                                    {tecnicos.map(
                                        (tecnico) => (
                                            <option
                                                key={
                                                    tecnico.id
                                                }
                                                value={
                                                    tecnico.id
                                                }
                                            >
                                                {
                                                    tecnico.nome
                                                }
                                            </option>
                                        )
                                    )}
                                </select>
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label
                                htmlFor="adiantamento-chamado"
                                className="text-sm font-semibold text-foreground"
                            >
                                Chamado relacionado
                            </label>

                            <div className="relative">
                                <ClipboardList className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />

                                <select
                                    id="adiantamento-chamado"
                                    value={chamadoId}
                                    disabled={
                                        !tecnicoId ||
                                        carregandoChamados ||
                                        salvando
                                    }
                                    onChange={(
                                        event
                                    ) =>
                                        setChamadoId(
                                            event.target
                                                .value
                                        )
                                    }
                                    className="h-11 w-full appearance-none rounded-xl border border-border bg-background pl-10 pr-4 text-sm text-foreground outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/10 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    <option value="">
                                        Nenhum chamado específico
                                    </option>

                                    {chamados.map(
                                        (chamado) => (
                                            <option
                                                key={
                                                    chamado.id
                                                }
                                                value={
                                                    chamado.id
                                                }
                                            >
                                                {chamado.numero_chamado ||
                                                    "Sem número"}{" "}
                                                {chamado.empresa
                                                    ? `- ${chamado.empresa}`
                                                    : ""}
                                            </option>
                                        )
                                    )}
                                </select>
                            </div>

                            {carregandoChamados && (
                                <p className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                    Carregando chamados...
                                </p>
                            )}

                            {erroChamados && (
                                <p className="text-xs text-red-600">
                                    {erroChamados}
                                </p>
                            )}
                        </div>

                        {chamadoSelecionado && (
                            <div className="grid gap-3 rounded-xl border border-border bg-secondary/30 p-4 text-sm sm:grid-cols-2">
                                <div>
                                    <p className="text-xs text-muted-foreground">
                                        Empresa
                                    </p>

                                    <p className="mt-1 font-bold text-foreground">
                                        {chamadoSelecionado.empresa ||
                                            "Não informada"}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs text-muted-foreground">
                                        Valor do técnico
                                    </p>

                                    <p className="mt-1 font-bold text-emerald-700 dark:text-emerald-300">
                                        {formatarMoeda(
                                            chamadoSelecionado.valor_total_tecnico
                                        )}
                                    </p>
                                </div>
                            </div>
                        )}

                        <div className="space-y-1.5">
                            <label
                                htmlFor="adiantamento-valor"
                                className="text-sm font-semibold text-foreground"
                            >
                                Valor
                            </label>

                            <div className="relative">
                                <CircleDollarSign className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />

                                <input
                                    id="adiantamento-valor"
                                    type="number"
                                    min="0.01"
                                    step="0.01"
                                    value={valor}
                                    onChange={(
                                        event
                                    ) =>
                                        setValor(
                                            event.target
                                                .value
                                        )
                                    }
                                    required
                                    placeholder="0,00"
                                    className="h-11 w-full rounded-xl border border-border bg-background pl-10 pr-4 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/10"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label
                                htmlFor="adiantamento-descricao"
                                className="text-sm font-semibold text-foreground"
                            >
                                Descrição
                            </label>

                            <textarea
                                id="adiantamento-descricao"
                                value={descricao}
                                onChange={(
                                    event
                                ) =>
                                    setDescricao(
                                        event.target
                                            .value
                                    )
                                }
                                required
                                rows={5}
                                placeholder="Exemplo: Adiantamento para despesas de deslocamento."
                                className="w-full resize-none rounded-xl border border-border bg-background p-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/10"
                            />
                        </div>
                    </div>

                    <div className="mt-6 grid grid-cols-2 gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={salvando}
                            className="h-11 rounded-xl border border-border bg-background px-4 text-sm font-bold text-foreground transition-colors hover:bg-secondary disabled:opacity-50"
                        >
                            Cancelar
                        </button>

                        <button
                            type="submit"
                            disabled={salvando}
                            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {salvando && (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            )}

                            {salvando
                                ? "Salvando..."
                                : editando
                                  ? "Salvar alterações"
                                  : "Cadastrar"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AdiantamentoAdminFormModal;