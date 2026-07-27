import {
    useEffect,
    useState,
} from "react";
import {
    Boxes,
    History,
    Loader2,
    X,
} from "lucide-react";
import {
    Equipamento,
    EquipamentoMovimentacao,
} from "../../types/estoque.type";
import { getHistoricoEquipamentoTecnico } from "../../services/Tecnicos/Estoque-tecnico/get-historico-equipamento-tecnico.service";

interface StaffEquipamentoDetalheModalProps {
    equipamento: Equipamento;
    onClose: () => void;
}

const formatarData = (
    valor?: string | null
) => {
    if (!valor) {
        return "Não informado";
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

const formatarTexto = (
    valor: string
) => {
    return valor
        .replace("_", " ")
        .replace(
            /\b\w/g,
            (letra) =>
                letra.toUpperCase()
        );
};

const StaffEquipamentoDetalheModal = ({
    equipamento,
    onClose,
}: StaffEquipamentoDetalheModalProps) => {
    const [
        historico,
        setHistorico,
    ] = useState<
        EquipamentoMovimentacao[]
    >([]);

    const [loading, setLoading] =
        useState(true);

    const [erro, setErro] =
        useState<string | null>(null);

    useEffect(() => {
        const carregarHistorico =
            async () => {
                try {
                    setLoading(true);
                    setErro(null);

                    const dados =
                        await getHistoricoEquipamentoTecnico(
                            equipamento.id
                        );

                    setHistorico(dados);
                } catch (error) {
                    setErro(
                        error instanceof
                            Error
                            ? error.message
                            : "Erro ao carregar o histórico."
                    );
                } finally {
                    setLoading(false);
                }
            };

        void carregarHistorico();
    }, [equipamento.id]);

    return (
        <div className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm sm:flex sm:items-center sm:justify-center sm:p-5">
            <div className="flex h-[100dvh] w-full flex-col overflow-hidden bg-card sm:h-auto sm:max-h-[94vh] sm:max-w-3xl sm:rounded-2xl sm:border sm:border-border sm:shadow-2xl">
                <div className="flex items-start justify-between gap-4 border-b border-border p-5">
                    <div className="flex items-start gap-3">
                        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                            <Boxes className="h-5 w-5" />
                        </span>

                        <div>
                            <h2 className="text-lg font-bold text-foreground">
                                {equipamento
                                    .tipo_equipamento
                                    ?.nome ||
                                    "Equipamento"}
                            </h2>

                            <p className="mt-1 text-sm text-muted-foreground">
                                {equipamento.patrimonio ||
                                    equipamento.numero_serie ||
                                    equipamento.modelo ||
                                    "Sem identificação"}
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border bg-background text-muted-foreground hover:bg-secondary"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-5">
                    <div className="grid grid-cols-2 gap-3">
                        <div className="rounded-xl border border-border bg-background p-3">
                            <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                                Modelo
                            </p>

                            <p className="mt-1 text-sm font-bold text-foreground">
                                {equipamento.modelo ||
                                    "Não informado"}
                            </p>
                        </div>

                        <div className="rounded-xl border border-border bg-background p-3">
                            <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                                Patrimônio
                            </p>

                            <p className="mt-1 text-sm font-bold text-foreground">
                                {equipamento.patrimonio ||
                                    "Não informado"}
                            </p>
                        </div>

                        <div className="rounded-xl border border-border bg-background p-3">
                            <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                                Número de série
                            </p>

                            <p className="mt-1 break-all text-sm font-bold text-foreground">
                                {equipamento.numero_serie ||
                                    "Não informado"}
                            </p>
                        </div>

                        <div className="rounded-xl border border-border bg-background p-3">
                            <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                                Empresa
                            </p>

                            <p className="mt-1 text-sm font-bold text-foreground">
                                {equipamento.cliente
                                    ?.nome ||
                                    "Não informada"}
                            </p>
                        </div>

                        <div className="rounded-xl border border-border bg-background p-3">
                            <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                                Condição
                            </p>

                            <p className="mt-1 text-sm font-bold text-foreground">
                                {formatarTexto(
                                    equipamento.condicao
                                )}
                            </p>
                        </div>

                        <div className="rounded-xl border border-border bg-background p-3">
                            <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                                Situação
                            </p>

                            <p className="mt-1 text-sm font-bold text-foreground">
                                {formatarTexto(
                                    equipamento.situacao
                                )}
                            </p>
                        </div>
                    </div>

                    {equipamento.observacoes && (
                        <div className="mt-4 rounded-xl border border-border bg-secondary/30 p-4">
                            <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                                Observações
                            </p>

                            <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-foreground">
                                {
                                    equipamento.observacoes
                                }
                            </p>
                        </div>
                    )}

                    <div className="mt-6 flex items-center gap-2">
                        <History className="h-5 w-5 text-primary" />

                        <h3 className="font-bold text-foreground">
                            Histórico
                        </h3>
                    </div>

                    {loading ? (
                        <div className="flex min-h-[160px] items-center justify-center">
                            <Loader2 className="h-7 w-7 animate-spin text-primary" />
                        </div>
                    ) : erro ? (
                        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                            {erro}
                        </div>
                    ) : historico.length ===
                      0 ? (
                        <div className="mt-4 rounded-xl border border-border bg-background p-6 text-center text-sm text-muted-foreground">
                            Nenhuma movimentação encontrada.
                        </div>
                    ) : (
                        <div className="mt-4 space-y-3">
                            {historico.map(
                                (movimentacao) => (
                                    <article
                                        key={
                                            movimentacao.id
                                        }
                                        className="rounded-xl border border-border bg-background p-4"
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div>
                                                <p className="text-sm font-bold text-foreground">
                                                    {formatarTexto(
                                                        movimentacao.tipo_movimentacao
                                                    )}
                                                </p>

                                                <p className="mt-1 text-xs text-muted-foreground">
                                                    {movimentacao.motivo ||
                                                        "Sem motivo informado"}
                                                </p>
                                            </div>

                                            <span className="shrink-0 text-[10px] text-muted-foreground">
                                                {formatarData(
                                                    movimentacao.criado_em
                                                )}
                                            </span>
                                        </div>
                                    </article>
                                )
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StaffEquipamentoDetalheModal;