import { Banknote, X, CalendarClock, Link2, Loader2 } from "lucide-react";
import { useState, useEffect, FormEvent } from "react";
import { AdiantamentoAdmin } from "../../../types/diantamento-admin.type";

interface PagamentoPayload {
    pagoEm: string;
    comprovanteUrl: string | null;
}

interface AdiantamentoAdminPagamentoModalProps {
    adiantamento: AdiantamentoAdmin;
    salvando: boolean;
    onClose: () => void;
    onSubmit: (
        payload: PagamentoPayload
    ) => Promise<void>;
}

const criarDataLocalAtual = () => {
    const agora = new Date();
    const deslocamento =
        agora.getTimezoneOffset() * 60000;

    return new Date(
        agora.getTime() - deslocamento
    )
        .toISOString()
        .slice(0, 16);
};

const formatarMoeda = (
    valor: number
) => {
    return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
    }).format(valor);
};

const AdiantamentoAdminPagamentoModal = ({
    adiantamento,
    salvando,
    onClose,
    onSubmit,
}: AdiantamentoAdminPagamentoModalProps) => {
    const [pagoEm, setPagoEm] =
        useState(criarDataLocalAtual());

    const [
        comprovanteUrl,
        setComprovanteUrl,
    ] = useState("");

    const [erro, setErro] =
        useState("");

    useEffect(() => {
        setPagoEm(criarDataLocalAtual());

        setComprovanteUrl(
            adiantamento.comprovante_url ||
                ""
        );

        setErro("");
    }, [adiantamento]);

    const handleSubmit = async (
        event: FormEvent
    ) => {
        event.preventDefault();

        if (!pagoEm) {
            setErro(
                "Informe a data do pagamento."
            );

            return;
        }

        const data = new Date(pagoEm);

        if (
            Number.isNaN(data.getTime())
        ) {
            setErro(
                "A data informada é inválida."
            );

            return;
        }

        setErro("");

        await onSubmit({
            pagoEm: data.toISOString(),
            comprovanteUrl:
                comprovanteUrl.trim() ||
                null,
        });
    };

    return (
        <div
            className="fixed inset-0 z-[110] flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center sm:p-4"
            role="dialog"
            aria-modal="true"
        >
            <div className="w-full rounded-t-2xl border border-border bg-card p-5 shadow-2xl sm:max-w-lg sm:rounded-2xl sm:p-6">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                            <Banknote className="h-5 w-5" />
                        </span>

                        <div>
                            <h2 className="text-lg font-bold text-foreground">
                                Registrar pagamento
                            </h2>

                            <p className="mt-1 text-sm text-muted-foreground">
                                O técnico deverá confirmar o recebimento posteriormente.
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        disabled={salvando}
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground disabled:opacity-50"
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

                    <p className="mt-3 text-xs text-muted-foreground">
                        Valor
                    </p>

                    <p className="mt-1 text-xl font-bold text-emerald-700 dark:text-emerald-300">
                        {formatarMoeda(
                            adiantamento.valor_numero
                        )}
                    </p>
                </div>

                <form
                    onSubmit={handleSubmit}
                    className="mt-5 space-y-5"
                >
                    {erro && (
                        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                            {erro}
                        </div>
                    )}

                    <div className="space-y-1.5">
                        <label
                            htmlFor="pagamento-data"
                            className="text-sm font-semibold text-foreground"
                        >
                            Data e horário
                        </label>

                        <div className="relative">
                            <CalendarClock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />

                            <input
                                id="pagamento-data"
                                type="datetime-local"
                                value={pagoEm}
                                onChange={(
                                    event
                                ) =>
                                    setPagoEm(
                                        event.target
                                            .value
                                    )
                                }
                                required
                                className="h-11 w-full rounded-xl border border-border bg-background pl-10 pr-3 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label
                            htmlFor="pagamento-comprovante"
                            className="text-sm font-semibold text-foreground"
                        >
                            Link do comprovante
                        </label>

                        <div className="relative">
                            <Link2 className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />

                            <input
                                id="pagamento-comprovante"
                                type="url"
                                value={
                                    comprovanteUrl
                                }
                                onChange={(
                                    event
                                ) =>
                                    setComprovanteUrl(
                                        event.target
                                            .value
                                    )
                                }
                                placeholder="https://..."
                                className="h-11 w-full rounded-xl border border-border bg-background pl-10 pr-3 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                            />
                        </div>

                        <p className="text-xs text-muted-foreground">
                            O comprovante é opcional nesta etapa.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-1">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={salvando}
                            className="h-11 rounded-xl border border-border bg-background text-sm font-bold text-foreground hover:bg-secondary disabled:opacity-50"
                        >
                            Cancelar
                        </button>

                        <button
                            type="submit"
                            disabled={salvando}
                            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-emerald-600 text-sm font-bold text-white hover:bg-emerald-700 disabled:opacity-50"
                        >
                            {salvando && (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            )}

                            {salvando
                                ? "Registrando..."
                                : "Registrar"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AdiantamentoAdminPagamentoModal;