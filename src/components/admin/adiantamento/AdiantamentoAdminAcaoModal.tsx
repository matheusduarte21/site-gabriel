import { Ban, RefreshCw, X, Link2, Loader2 } from "lucide-react";
import { useState, useEffect, FormEvent } from "react";
import { AdiantamentoAdmin } from "../../../types/diantamento-admin.type";

export type ModoAcaoAdiantamento =
    | "cancelar"
    | "reenviar";

interface AdiantamentoAdminAcaoModalProps {
    modo: ModoAcaoAdiantamento;
    adiantamento: AdiantamentoAdmin;
    processando: boolean;
    onClose: () => void;
    onConfirm: (
        valor: string
    ) => Promise<void>;
}

const AdiantamentoAdminAcaoModal = ({
    modo,
    adiantamento,
    processando,
    onClose,
    onConfirm,
}: AdiantamentoAdminAcaoModalProps) => {
    const [valor, setValor] =
        useState("");

    const [erro, setErro] =
        useState("");

    const cancelando =
        modo === "cancelar";

    useEffect(() => {
        setValor(
            cancelando
                ? ""
                : adiantamento.comprovante_url ||
                      ""
        );

        setErro("");
    }, [
        cancelando,
        adiantamento,
    ]);

    const handleSubmit = async (
        event: FormEvent
    ) => {
        event.preventDefault();

        if (
            cancelando &&
            valor.trim().length < 3
        ) {
            setErro(
                "Informe o motivo do cancelamento."
            );

            return;
        }

        setErro("");

        await onConfirm(valor.trim());
    };

    return (
        <div
            className="fixed inset-0 z-[120] flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center sm:p-4"
            role="dialog"
            aria-modal="true"
        >
            <div className="w-full rounded-t-2xl border border-border bg-card p-5 shadow-2xl sm:max-w-lg sm:rounded-2xl sm:p-6">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                        <span
                            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                                cancelando
                                    ? "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300"
                                    : "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300"
                            }`}
                        >
                            {cancelando ? (
                                <Ban className="h-5 w-5" />
                            ) : (
                                <RefreshCw className="h-5 w-5" />
                            )}
                        </span>

                        <div>
                            <h2 className="text-lg font-bold text-foreground">
                                {cancelando
                                    ? "Cancelar adiantamento"
                                    : "Reenviar confirmação"}
                            </h2>

                            <p className="mt-1 text-sm text-muted-foreground">
                                {cancelando
                                    ? "O registro será encerrado e não poderá ser pago."
                                    : "O técnico receberá novamente a solicitação para confirmar o recebimento."}
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        disabled={processando}
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary disabled:opacity-50"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="mt-5 rounded-xl border border-border bg-secondary/30 p-4">
                    <p className="text-xs text-muted-foreground">
                        Técnico
                    </p>

                    <p className="mt-1 font-bold text-foreground">
                        {adiantamento.tecnico
                            ?.nome ||
                            "Não informado"}
                    </p>

                    <p className="mt-2 text-sm text-muted-foreground">
                        {adiantamento.descricao}
                    </p>
                </div>

                <form
                    onSubmit={handleSubmit}
                    className="mt-5"
                >
                    {erro && (
                        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                            {erro}
                        </div>
                    )}

                    {cancelando ? (
                        <div className="space-y-1.5">
                            <label
                                htmlFor="acao-motivo"
                                className="text-sm font-semibold text-foreground"
                            >
                                Motivo do cancelamento
                            </label>

                            <textarea
                                id="acao-motivo"
                                value={valor}
                                onChange={(
                                    event
                                ) =>
                                    setValor(
                                        event.target
                                            .value
                                    )
                                }
                                rows={5}
                                required
                                placeholder="Informe o motivo do cancelamento."
                                className="w-full resize-none rounded-xl border border-border bg-background p-3 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                            />
                        </div>
                    ) : (
                        <div className="space-y-1.5">
                            <label
                                htmlFor="acao-comprovante"
                                className="text-sm font-semibold text-foreground"
                            >
                                Link atualizado do comprovante
                            </label>

                            <div className="relative">
                                <Link2 className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />

                                <input
                                    id="acao-comprovante"
                                    type="url"
                                    value={valor}
                                    onChange={(
                                        event
                                    ) =>
                                        setValor(
                                            event.target
                                                .value
                                        )
                                    }
                                    placeholder="https://..."
                                    className="h-11 w-full rounded-xl border border-border bg-background pl-10 pr-3 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                                />
                            </div>

                            <p className="text-xs text-muted-foreground">
                                Deixe vazio para manter o comprovante atual.
                            </p>
                        </div>
                    )}

                    <div className="mt-6 grid grid-cols-2 gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={processando}
                            className="h-11 rounded-xl border border-border bg-background text-sm font-bold text-foreground hover:bg-secondary disabled:opacity-50"
                        >
                            Voltar
                        </button>

                        <button
                            type="submit"
                            disabled={processando}
                            className={`inline-flex h-11 items-center justify-center gap-2 rounded-xl text-sm font-bold text-white disabled:opacity-50 ${
                                cancelando
                                    ? "bg-red-600 hover:bg-red-700"
                                    : "bg-primary hover:bg-primary/90"
                            }`}
                        >
                            {processando && (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            )}

                            {processando
                                ? "Processando..."
                                : cancelando
                                  ? "Cancelar adiantamento"
                                  : "Reenviar"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AdiantamentoAdminAcaoModal;