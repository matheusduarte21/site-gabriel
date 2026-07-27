import {
    useEffect,
    useMemo,
    useState,
} from "react";
import {
    AlertCircle,
    Building2,
    CalendarDays,
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    ClipboardList,
    Clock3,
    DollarSign,
    Percent,
    TrendingUp,
    User,
    Wallet,
} from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "../ui/dialog";
import { Button } from "../ui/Button";
import { Chamado } from "../../types/chamado.type";
import { ValorFiltroMes } from "./FiltroMes";

export interface TecnicoResumoMensal {
    id: string | number;
    nome: string;
    email_contato?: string | null;
    telefone?: string | null;
    nome_municipio?: string;
    nome_estado?: string;
    chamados: number;
    pendentes: number;
    em_andamento: number;
    finalizados: number;
    faturado: number;
    pago: number;
    lucro: number;
    margem: number;
    [key: string]: any;
}

interface TecnicoFinanceiroModalProps {
    isOpen: boolean;
    onClose: () => void;
    tecnico: TecnicoResumoMensal | null;
    chamados: Chamado[];
    mesSelecionado: ValorFiltroMes;
}

const STATUS_PADRAO: Record<string, string> = {
    "1": "Pendente",
    "2": "Em andamento",
    "3": "Finalizado",
};

const ITENS_POR_PAGINA = 5;

const formatadorMoeda = new Intl.NumberFormat(
    "pt-BR",
    {
        style: "currency",
        currency: "BRL",
    }
);

const converterNumero = (
    valor:
        | number
        | string
        | null
        | undefined
): number => {
    if (
        valor === null ||
        valor === undefined ||
        valor === ""
    ) {
        return 0;
    }

    if (typeof valor === "number") {
        return Number.isFinite(valor)
            ? valor
            : 0;
    }

    const valorNormalizado = valor
        .trim()
        .replace(/\s/g, "")
        .replace(
            /\.(?=\d{3}(?:\D|$))/g,
            ""
        )
        .replace(",", ".");

    const numero = Number(
        valorNormalizado
    );

    return Number.isFinite(numero)
        ? numero
        : 0;
};

const formatarMoeda = (
    valor:
        | number
        | string
        | null
        | undefined
): string => {
    return formatadorMoeda.format(
        converterNumero(valor)
    );
};

const formatarData = (
    valor:
        | string
        | null
        | undefined
): string => {
    if (!valor) {
        return "Não informado";
    }

    const dataSemHorario =
        valor.split("T")[0];

    const partes =
        dataSemHorario.split("-");

    if (partes.length !== 3) {
        return valor;
    }

    const [ano, mes, dia] = partes;

    return `${dia}/${mes}/${ano}`;
};

const formatarPeriodo = (
    periodo: ValorFiltroMes
): string => {
    if (periodo === "todos") {
        return "Todos os períodos";
    }

    const [ano, mes] = periodo
        .split("-")
        .map(Number);

    const data = new Date(
        ano,
        mes - 1,
        1
    );

    const texto =
        new Intl.DateTimeFormat(
            "pt-BR",
            {
                month: "long",
                year: "numeric",
            }
        ).format(data);

    return (
        texto.charAt(0).toUpperCase() +
        texto.slice(1)
    );
};

const obterNomeStatus = (
    statusId:
        | string
        | number
        | null
        | undefined
): string => {
    if (
        statusId === null ||
        statusId === undefined
    ) {
        return "Não informado";
    }

    return (
        STATUS_PADRAO[
            String(statusId)
        ] ?? `Status ${statusId}`
    );
};

const obterClasseStatus = (
    statusId:
        | string
        | number
        | null
        | undefined
): string => {
    const status = Number(statusId);

    if (status === 1) {
        return "border-amber-200 bg-amber-50 text-amber-700";
    }

    if (status === 2) {
        return "border-blue-200 bg-blue-50 text-blue-700";
    }

    if (status === 3) {
        return "border-emerald-200 bg-emerald-50 text-emerald-700";
    }

    return "border-border bg-muted text-muted-foreground";
};

const TecnicoFinanceiroModal = ({
    isOpen,
    onClose,
    tecnico,
    chamados,
    mesSelecionado,
}: TecnicoFinanceiroModalProps) => {
    const [
        paginaAtual,
        setPaginaAtual,
    ] = useState(1);

    const resumoCliente = useMemo(() => {
        return chamados.reduce(
            (acumulado, chamado) => {
                acumulado.valorChamados +=
                    converterNumero(
                        chamado.valor_chamado_cliente
                    );

                acumulado.horaExtra +=
                    converterNumero(
                        chamado.hora_extra_cliente
                    );

                acumulado.deslocamento +=
                    converterNumero(
                        chamado.deslocamento_cliente
                    );

                acumulado.reembolso +=
                    converterNumero(
                        chamado.reembolso_cliente
                    );

                acumulado.total +=
                    converterNumero(
                        chamado.valor_total_cliente
                    );

                return acumulado;
            },
            {
                valorChamados: 0,
                horaExtra: 0,
                deslocamento: 0,
                reembolso: 0,
                total: 0,
            }
        );
    }, [chamados]);

    const resumoTecnico = useMemo(() => {
        return chamados.reduce(
            (acumulado, chamado) => {
                acumulado.valorChamados +=
                    converterNumero(
                        chamado.valor_chamado_tecnico
                    );

                acumulado.horaExtra +=
                    converterNumero(
                        chamado.hora_extra_tecnico
                    );

                acumulado.deslocamento +=
                    converterNumero(
                        chamado.deslocamento_tecnico
                    );

                acumulado.reembolso +=
                    converterNumero(
                        chamado.reembolso_tecnico
                    );

                acumulado.total +=
                    converterNumero(
                        chamado.valor_total_tecnico
                    );

                return acumulado;
            },
            {
                valorChamados: 0,
                horaExtra: 0,
                deslocamento: 0,
                reembolso: 0,
                total: 0,
            }
        );
    }, [chamados]);

    const totalPaginas = Math.max(
        1,
        Math.ceil(
            chamados.length /
                ITENS_POR_PAGINA
        )
    );

    const chamadosPaginados =
        useMemo(() => {
            const inicio =
                (paginaAtual - 1) *
                ITENS_POR_PAGINA;

            const fim =
                inicio +
                ITENS_POR_PAGINA;

            return chamados.slice(
                inicio,
                fim
            );
        }, [chamados, paginaAtual]);

    useEffect(() => {
        setPaginaAtual(1);
    }, [
        tecnico?.id,
        mesSelecionado,
        isOpen,
    ]);

    useEffect(() => {
        if (
            paginaAtual >
            totalPaginas
        ) {
            setPaginaAtual(
                totalPaginas
            );
        }
    }, [
        paginaAtual,
        totalPaginas,
    ]);

    if (!tecnico) {
        return null;
    }

    const inicioResultado =
        chamados.length > 0
            ? (paginaAtual - 1) *
                  ITENS_POR_PAGINA +
              1
            : 0;

    const fimResultado = Math.min(
        paginaAtual *
            ITENS_POR_PAGINA,
        chamados.length
    );

    return (
        <Dialog
            open={isOpen}
            onOpenChange={(open) => {
                if (!open) {
                    onClose();
                }
            }}
        >
            <DialogContent className="max-h-[92vh] max-w-6xl overflow-hidden p-0">
                <div className="flex max-h-[92vh] flex-col">
                    <DialogHeader className="border-b border-border bg-gradient-to-r from-emerald-50 to-blue-50 px-6 py-5 pr-12 dark:from-emerald-950/30 dark:to-blue-950/30">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                            <div className="flex items-start gap-3">
                                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-emerald-200 bg-emerald-100 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                                    <User className="h-5 w-5" />
                                </span>

                                <div>
                                    <DialogTitle className="text-xl font-bold text-foreground">
                                        Desempenho do técnico
                                    </DialogTitle>

                                    <DialogDescription className="mt-1 text-sm text-muted-foreground">
                                        Indicadores operacionais e financeiros de{" "}
                                        {tecnico.nome}.
                                    </DialogDescription>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-2">
                                <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                                    {tecnico.nome}
                                </span>

                                <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-300">
                                    {formatarPeriodo(
                                        mesSelecionado
                                    )}
                                </span>
                            </div>
                        </div>
                    </DialogHeader>

                    <div className="min-h-0 flex-1 overflow-y-auto bg-muted/10 p-4 sm:p-6">
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                            <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-950/30">
                                <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
                                    <ClipboardList className="h-4 w-4" />

                                    <p className="text-xs font-bold uppercase tracking-wide">
                                        Chamados
                                    </p>
                                </div>

                                <p className="mt-2 text-2xl font-bold text-blue-700 dark:text-blue-300">
                                    {tecnico.chamados}
                                </p>
                            </div>

                            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950/30">
                                <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300">
                                    <AlertCircle className="h-4 w-4" />

                                    <p className="text-xs font-bold uppercase tracking-wide">
                                        Pendentes
                                    </p>
                                </div>

                                <p className="mt-2 text-2xl font-bold text-amber-700 dark:text-amber-300">
                                    {tecnico.pendentes}
                                </p>
                            </div>

                            <div className="rounded-xl border border-sky-200 bg-sky-50 p-4 dark:border-sky-900 dark:bg-sky-950/30">
                                <div className="flex items-center gap-2 text-sky-700 dark:text-sky-300">
                                    <Clock3 className="h-4 w-4" />

                                    <p className="text-xs font-bold uppercase tracking-wide">
                                        Em andamento
                                    </p>
                                </div>

                                <p className="mt-2 text-2xl font-bold text-sky-700 dark:text-sky-300">
                                    {tecnico.em_andamento}
                                </p>
                            </div>

                            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-900 dark:bg-emerald-950/30">
                                <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300">
                                    <CheckCircle2 className="h-4 w-4" />

                                    <p className="text-xs font-bold uppercase tracking-wide">
                                        Finalizados
                                    </p>
                                </div>

                                <p className="mt-2 text-2xl font-bold text-emerald-700 dark:text-emerald-300">
                                    {tecnico.finalizados}
                                </p>
                            </div>

                            <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-4 dark:border-indigo-900 dark:bg-indigo-950/30">
                                <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-300">
                                    <DollarSign className="h-4 w-4" />

                                    <p className="text-xs font-bold uppercase tracking-wide">
                                        Faturado
                                    </p>
                                </div>

                                <p className="mt-2 text-xl font-bold text-indigo-700 dark:text-indigo-300">
                                    {formatarMoeda(
                                        tecnico.faturado
                                    )}
                                </p>
                            </div>

                            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950/30">
                                <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300">
                                    <Wallet className="h-4 w-4" />

                                    <p className="text-xs font-bold uppercase tracking-wide">
                                        Valor a pagar
                                    </p>
                                </div>

                                <p className="mt-2 text-xl font-bold text-amber-700 dark:text-amber-300">
                                    {formatarMoeda(
                                        tecnico.pago
                                    )}
                                </p>
                            </div>

                            <div
                                className={`rounded-xl border p-4 ${
                                    tecnico.lucro >= 0
                                        ? "border-emerald-200 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950/30"
                                        : "border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/30"
                                }`}
                            >
                                <div
                                    className={`flex items-center gap-2 ${
                                        tecnico.lucro >= 0
                                            ? "text-emerald-700 dark:text-emerald-300"
                                            : "text-red-700 dark:text-red-300"
                                    }`}
                                >
                                    <TrendingUp className="h-4 w-4" />

                                    <p className="text-xs font-bold uppercase tracking-wide">
                                        Lucro
                                    </p>
                                </div>

                                <p
                                    className={`mt-2 text-xl font-bold ${
                                        tecnico.lucro >= 0
                                            ? "text-emerald-700 dark:text-emerald-300"
                                            : "text-red-700 dark:text-red-300"
                                    }`}
                                >
                                    {formatarMoeda(
                                        tecnico.lucro
                                    )}
                                </p>
                            </div>

                            <div className="rounded-xl border border-violet-200 bg-violet-50 p-4 dark:border-violet-900 dark:bg-violet-950/30">
                                <div className="flex items-center gap-2 text-violet-700 dark:text-violet-300">
                                    <Percent className="h-4 w-4" />

                                    <p className="text-xs font-bold uppercase tracking-wide">
                                        Margem
                                    </p>
                                </div>

                                <p className="mt-2 text-xl font-bold text-violet-700 dark:text-violet-300">
                                    {tecnico.margem.toLocaleString(
                                        "pt-BR",
                                        {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2,
                                        }
                                    )}
                                    %
                                </p>
                            </div>
                        </div>

                        <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-2">
                            <section className="rounded-xl border border-indigo-200 bg-indigo-50/40 p-5 shadow-sm dark:border-indigo-900 dark:bg-indigo-950/20">
                                <div className="mb-4 flex items-center gap-2 border-b border-indigo-200 pb-4 dark:border-indigo-900">
                                    <DollarSign className="h-5 w-5 text-indigo-700 dark:text-indigo-300" />

                                    <div>
                                        <h3 className="text-sm font-bold text-indigo-700 dark:text-indigo-300">
                                            Faturamento dos chamados
                                        </h3>

                                        <p className="mt-0.5 text-xs text-indigo-600/80 dark:text-indigo-300/70">
                                            Valores cobrados dos clientes
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="rounded-lg border border-indigo-200 bg-background p-3 dark:border-indigo-900">
                                        <p className="text-[11px] font-bold uppercase text-muted-foreground">
                                            Valor chamados
                                        </p>

                                        <p className="mt-1 text-sm font-bold text-indigo-700 dark:text-indigo-300">
                                            {formatarMoeda(
                                                resumoCliente.valorChamados
                                            )}
                                        </p>
                                    </div>

                                    <div className="rounded-lg border border-indigo-200 bg-background p-3 dark:border-indigo-900">
                                        <p className="text-[11px] font-bold uppercase text-muted-foreground">
                                            Hora extra
                                        </p>

                                        <p className="mt-1 text-sm font-bold text-indigo-700 dark:text-indigo-300">
                                            {formatarMoeda(
                                                resumoCliente.horaExtra
                                            )}
                                        </p>
                                    </div>

                                    <div className="rounded-lg border border-indigo-200 bg-background p-3 dark:border-indigo-900">
                                        <p className="text-[11px] font-bold uppercase text-muted-foreground">
                                            Deslocamento
                                        </p>

                                        <p className="mt-1 text-sm font-bold text-indigo-700 dark:text-indigo-300">
                                            {formatarMoeda(
                                                resumoCliente.deslocamento
                                            )}
                                        </p>
                                    </div>

                                    <div className="rounded-lg border border-indigo-200 bg-background p-3 dark:border-indigo-900">
                                        <p className="text-[11px] font-bold uppercase text-muted-foreground">
                                            Reembolso
                                        </p>

                                        <p className="mt-1 text-sm font-bold text-indigo-700 dark:text-indigo-300">
                                            {formatarMoeda(
                                                resumoCliente.reembolso
                                            )}
                                        </p>
                                    </div>

                                    <div className="col-span-2 rounded-lg border border-indigo-200 bg-indigo-100/70 p-4 dark:border-indigo-900 dark:bg-indigo-950/50">
                                        <p className="text-[11px] font-bold uppercase text-indigo-600 dark:text-indigo-300">
                                            Total faturado
                                        </p>

                                        <p className="mt-1 text-xl font-bold text-indigo-700 dark:text-indigo-300">
                                            {formatarMoeda(
                                                resumoCliente.total
                                            )}
                                        </p>
                                    </div>
                                </div>
                            </section>

                            <section className="rounded-xl border border-amber-200 bg-amber-50/40 p-5 shadow-sm dark:border-amber-900 dark:bg-amber-950/20">
                                <div className="mb-4 flex items-center gap-2 border-b border-amber-200 pb-4 dark:border-amber-900">
                                    <Wallet className="h-5 w-5 text-amber-700 dark:text-amber-300" />

                                    <div>
                                        <h3 className="text-sm font-bold text-amber-700 dark:text-amber-300">
                                            Repasse ao técnico
                                        </h3>

                                        <p className="mt-0.5 text-xs text-amber-600/80 dark:text-amber-300/70">
                                            Valores a pagar ao profissional
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="rounded-lg border border-amber-200 bg-background p-3 dark:border-amber-900">
                                        <p className="text-[11px] font-bold uppercase text-muted-foreground">
                                            Valor chamados
                                        </p>

                                        <p className="mt-1 text-sm font-bold text-amber-700 dark:text-amber-300">
                                            {formatarMoeda(
                                                resumoTecnico.valorChamados
                                            )}
                                        </p>
                                    </div>

                                    <div className="rounded-lg border border-amber-200 bg-background p-3 dark:border-amber-900">
                                        <p className="text-[11px] font-bold uppercase text-muted-foreground">
                                            Hora extra
                                        </p>

                                        <p className="mt-1 text-sm font-bold text-amber-700 dark:text-amber-300">
                                            {formatarMoeda(
                                                resumoTecnico.horaExtra
                                            )}
                                        </p>
                                    </div>

                                    <div className="rounded-lg border border-amber-200 bg-background p-3 dark:border-amber-900">
                                        <p className="text-[11px] font-bold uppercase text-muted-foreground">
                                            Deslocamento
                                        </p>

                                        <p className="mt-1 text-sm font-bold text-amber-700 dark:text-amber-300">
                                            {formatarMoeda(
                                                resumoTecnico.deslocamento
                                            )}
                                        </p>
                                    </div>

                                    <div className="rounded-lg border border-amber-200 bg-background p-3 dark:border-amber-900">
                                        <p className="text-[11px] font-bold uppercase text-muted-foreground">
                                            Reembolso
                                        </p>

                                        <p className="mt-1 text-sm font-bold text-amber-700 dark:text-amber-300">
                                            {formatarMoeda(
                                                resumoTecnico.reembolso
                                            )}
                                        </p>
                                    </div>

                                    <div className="col-span-2 rounded-lg border border-amber-200 bg-amber-100/70 p-4 dark:border-amber-900 dark:bg-amber-950/50">
                                        <p className="text-[11px] font-bold uppercase text-amber-600 dark:text-amber-300">
                                            Total a pagar
                                        </p>

                                        <p className="mt-1 text-xl font-bold text-amber-700 dark:text-amber-300">
                                            {formatarMoeda(
                                                resumoTecnico.total
                                            )}
                                        </p>
                                    </div>
                                </div>
                            </section>
                        </div>

                        <section className="mt-5 rounded-xl border border-border bg-card p-5 shadow-sm">
                            <div className="mb-4 flex flex-col gap-2 border-b border-border pb-4 sm:flex-row sm:items-center sm:justify-between">
                                <div className="flex items-center gap-2">
                                    <ClipboardList className="h-5 w-5 text-blue-600" />

                                    <div>
                                        <h3 className="text-sm font-bold text-foreground">
                                            Chamados do técnico
                                        </h3>

                                        <p className="mt-0.5 text-xs text-muted-foreground">
                                            {formatarPeriodo(
                                                mesSelecionado
                                            )}
                                        </p>
                                    </div>
                                </div>

                                <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-300">
                                    {chamados.length}{" "}
                                    {chamados.length === 1
                                        ? "chamado"
                                        : "chamados"}
                                </span>
                            </div>

                            {chamados.length === 0 ? (
                                <div className="rounded-lg border border-dashed border-border bg-muted/20 px-4 py-10 text-center">
                                    <ClipboardList className="mx-auto h-8 w-8 text-muted-foreground/50" />

                                    <p className="mt-3 text-sm font-semibold text-foreground">
                                        Nenhum chamado encontrado
                                    </p>

                                    <p className="mt-1 text-xs text-muted-foreground">
                                        Este técnico não possui chamados no período selecionado.
                                    </p>
                                </div>
                            ) : (
                                <>
                                    <div className="max-h-[460px] space-y-3 overflow-y-auto pr-1">
                                        {chamadosPaginados.map(
                                            (
                                                chamado,
                                                index
                                            ) => {
                                                const faturado =
                                                    converterNumero(
                                                        chamado.valor_total_cliente
                                                    );

                                                const pago =
                                                    converterNumero(
                                                        chamado.valor_total_tecnico
                                                    );

                                                const lucro =
                                                    faturado -
                                                    pago;

                                                return (
                                                    <div
                                                        key={
                                                            chamado.id ??
                                                            `${chamado.numero_chamado}-${paginaAtual}-${index}`
                                                        }
                                                        className="grid grid-cols-1 gap-4 rounded-lg border border-border bg-background p-4 md:grid-cols-[1.2fr_1fr]"
                                                    >
                                                        <div>
                                                            <div className="flex flex-wrap items-center gap-2">
                                                                <p className="text-sm font-bold text-blue-700 dark:text-blue-300">
                                                                    {chamado.numero_chamado ||
                                                                        "Sem número"}
                                                                </p>

                                                                <span
                                                                    className={`rounded-full border px-2.5 py-1 text-[10px] font-bold ${obterClasseStatus(
                                                                        chamado.status_id
                                                                    )}`}
                                                                >
                                                                    {obterNomeStatus(
                                                                        chamado.status_id
                                                                    )}
                                                                </span>
                                                            </div>

                                                            <p className="mt-2 flex items-center gap-1.5 text-sm font-medium text-foreground">
                                                                <Building2 className="h-4 w-4 text-muted-foreground" />

                                                                {chamado.empresa ||
                                                                    "Empresa não informada"}
                                                            </p>

                                                            <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                                                                <CalendarDays className="h-3.5 w-3.5" />

                                                                {formatarData(
                                                                    chamado.data_agendamento ||
                                                                        chamado.data_criacao
                                                                )}
                                                            </p>
                                                        </div>

                                                        <div className="grid grid-cols-3 gap-3">
                                                            <div>
                                                                <p className="text-[10px] font-bold uppercase text-muted-foreground">
                                                                    Faturado
                                                                </p>

                                                                <p className="mt-1 text-xs font-bold text-indigo-700 dark:text-indigo-300">
                                                                    {formatarMoeda(
                                                                        faturado
                                                                    )}
                                                                </p>
                                                            </div>

                                                            <div>
                                                                <p className="text-[10px] font-bold uppercase text-muted-foreground">
                                                                    Pago
                                                                </p>

                                                                <p className="mt-1 text-xs font-bold text-amber-700 dark:text-amber-300">
                                                                    {formatarMoeda(
                                                                        pago
                                                                    )}
                                                                </p>
                                                            </div>

                                                            <div>
                                                                <p className="text-[10px] font-bold uppercase text-muted-foreground">
                                                                    Lucro
                                                                </p>

                                                                <p
                                                                    className={`mt-1 text-xs font-bold ${
                                                                        lucro >=
                                                                        0
                                                                            ? "text-emerald-700 dark:text-emerald-300"
                                                                            : "text-red-700 dark:text-red-300"
                                                                    }`}
                                                                >
                                                                    {formatarMoeda(
                                                                        lucro
                                                                    )}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            }
                                        )}
                                    </div>

                                    <div className="mt-5 flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
                                        <span className="text-sm text-muted-foreground">
                                            Mostrando{" "}
                                            <span className="font-medium text-foreground">
                                                {inicioResultado}
                                            </span>{" "}
                                            a{" "}
                                            <span className="font-medium text-foreground">
                                                {fimResultado}
                                            </span>{" "}
                                            de{" "}
                                            <span className="font-medium text-foreground">
                                                {chamados.length}
                                            </span>{" "}
                                            resultados
                                        </span>

                                        {totalPaginas >
                                            1 && (
                                            <div className="flex flex-wrap items-center gap-1.5">
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    disabled={
                                                        paginaAtual ===
                                                        1
                                                    }
                                                    onClick={() =>
                                                        setPaginaAtual(
                                                            (
                                                                pagina
                                                            ) =>
                                                                Math.max(
                                                                    1,
                                                                    pagina -
                                                                        1
                                                                )
                                                        )
                                                    }
                                                    className="h-8 w-8 rounded-lg p-0"
                                                >
                                                    <ChevronLeft className="h-4 w-4" />
                                                </Button>

                                                {Array.from(
                                                    {
                                                        length:
                                                            totalPaginas,
                                                    },
                                                    (
                                                        _,
                                                        index
                                                    ) =>
                                                        index +
                                                        1
                                                ).map(
                                                    (
                                                        pagina
                                                    ) => (
                                                        <Button
                                                            key={
                                                                pagina
                                                            }
                                                            type="button"
                                                            variant={
                                                                pagina ===
                                                                paginaAtual
                                                                    ? "default"
                                                                    : "outline"
                                                            }
                                                            size="sm"
                                                            onClick={() =>
                                                                setPaginaAtual(
                                                                    pagina
                                                                )
                                                            }
                                                            className="h-8 w-8 rounded-lg p-0 text-xs"
                                                        >
                                                            {
                                                                pagina
                                                            }
                                                        </Button>
                                                    )
                                                )}

                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    disabled={
                                                        paginaAtual ===
                                                        totalPaginas
                                                    }
                                                    onClick={() =>
                                                        setPaginaAtual(
                                                            (
                                                                pagina
                                                            ) =>
                                                                Math.min(
                                                                    totalPaginas,
                                                                    pagina +
                                                                        1
                                                                )
                                                        )
                                                    }
                                                    className="h-8 w-8 rounded-lg p-0"
                                                >
                                                    <ChevronRight className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </>
                            )}
                        </section>

                        <div className="mt-5 flex justify-end border-t border-border pt-5">
                            <Button
                                type="button"
                                onClick={onClose}
                                className="min-w-[110px]"
                            >
                                Fechar
                            </Button>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default TecnicoFinanceiroModal;