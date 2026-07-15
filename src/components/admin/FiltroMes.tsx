import {
    CalendarDays,
    Check,
} from "lucide-react";

export type ValorFiltroMes =
    | string
    | "todos";

interface FiltroMesProps {
    value: ValorFiltroMes;
    onChange: (
        value: ValorFiltroMes
    ) => void;
    quantidadeMeses?: number;
}

const obterMesAtual = (): string => {
    const hoje = new Date();
    const ano = hoje.getFullYear();
    const mes = String(
        hoje.getMonth() + 1
    ).padStart(2, "0");

    return `${ano}-${mes}`;
};

const gerarMesesRecentes = (
    quantidade: number
): string[] => {
    const hoje = new Date();

    return Array.from(
        { length: quantidade },
        (_, index) => {
            const data = new Date(
                hoje.getFullYear(),
                hoje.getMonth() - index,
                1
            );

            const ano = data.getFullYear();
            const mes = String(
                data.getMonth() + 1
            ).padStart(2, "0");

            return `${ano}-${mes}`;
        }
    );
};

const formatarNomeMes = (
    value: string,
    incluirAno = false
): string => {
    const [ano, mes] = value
        .split("-")
        .map(Number);

    const data = new Date(
        ano,
        mes - 1,
        1
    );

    const nome = new Intl.DateTimeFormat(
        "pt-BR",
        incluirAno
            ? {
                  month: "long",
                  year: "numeric",
              }
            : {
                  month: "short",
              }
    )
        .format(data)
        .replace(".", "");

    return (
        nome.charAt(0).toUpperCase() +
        nome.slice(1)
    );
};

const FiltroMes = ({
    value,
    onChange,
    quantidadeMeses = 6,
}: FiltroMesProps) => {
    const meses = gerarMesesRecentes(
        quantidadeMeses
    );

    const mesAtual = obterMesAtual();

    return (
        <section className="rounded-xl border border-border bg-card p-4 shadow-sm">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                <div className="flex items-start gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-blue-200 bg-blue-50 text-blue-600">
                        <CalendarDays className="h-5 w-5" />
                    </span>

                    <div>
                        <h3 className="text-sm font-bold text-foreground">
                            Período de fechamento
                        </h3>

                        <p className="mt-0.5 text-xs text-muted-foreground">
                            {value === "todos"
                                ? "Exibindo todos os períodos"
                                : `Exibindo ${formatarNomeMes(
                                      value,
                                      true
                                  )}`}
                        </p>
                    </div>
                </div>

                <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
                    <div className="flex flex-wrap gap-2">
                        <button
                            type="button"
                            onClick={() =>
                                onChange("todos")
                            }
                            className={`inline-flex h-9 items-center gap-1.5 rounded-lg border px-3 text-xs font-semibold transition-colors ${
                                value === "todos"
                                    ? "border-blue-600 bg-blue-600 text-white shadow-sm"
                                    : "border-border bg-background text-muted-foreground hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
                            }`}
                        >
                            {value === "todos" && (
                                <Check className="h-3.5 w-3.5" />
                            )}

                            Todos
                        </button>

                        {meses.map((mes) => {
                            const selecionado =
                                value === mes;

                            return (
                                <button
                                    key={mes}
                                    type="button"
                                    onClick={() =>
                                        onChange(mes)
                                    }
                                    className={`inline-flex h-9 items-center gap-1.5 rounded-lg border px-3 text-xs font-semibold transition-colors ${
                                        selecionado
                                            ? "border-blue-600 bg-blue-600 text-white shadow-sm"
                                            : "border-border bg-background text-muted-foreground hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
                                    }`}
                                >
                                    {selecionado && (
                                        <Check className="h-3.5 w-3.5" />
                                    )}

                                    {formatarNomeMes(
                                        mes
                                    )}

                                    {mes ===
                                        mesAtual && (
                                        <span
                                            className={`hidden text-[9px] uppercase sm:inline ${
                                                selecionado
                                                    ? "text-blue-100"
                                                    : "text-blue-500"
                                            }`}
                                        >
                                            Atual
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    <div className="flex items-center gap-2 border-t border-border pt-3 lg:border-l lg:border-t-0 lg:pl-3 lg:pt-0">
                        <label
                            htmlFor="filtro-mes"
                            className="whitespace-nowrap text-xs font-semibold text-muted-foreground"
                        >
                            Outro mês
                        </label>

                        <input
                            id="filtro-mes"
                            type="month"
                            value={
                                value === "todos"
                                    ? ""
                                    : value
                            }
                            onChange={(event) => {
                                if (
                                    event.target.value
                                ) {
                                    onChange(
                                        event.target
                                            .value
                                    );
                                }
                            }}
                            className="h-9 rounded-lg border border-input bg-background px-3 text-xs font-medium text-foreground outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
                        />
                    </div>
                </div>
            </div>
        </section>
    );
};

export default FiltroMes;