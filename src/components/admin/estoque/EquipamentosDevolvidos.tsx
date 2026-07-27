import {
    useCallback,
    useEffect,
    useState,
} from "react";
import {
    AlertCircle,
    Building2,
    CalendarDays,
    Loader2,
    PackageCheck,
    RotateCcw,
    Undo2,
    UserRound,
} from "lucide-react";
import AdminHeader from "../AdminHeader";
import {
    ClienteEstoque,
    EquipamentoMovimentacao,
    TecnicoEstoque,
} from "../../../types/estoque.type";
import {
    getClientesEstoque,
    getMovimentacoesEstoque,
    getTecnicosEstoque,
} from "../../../services/Estoque/estoque.service";
import EstoquePaginacao from "./EstoquePaginacao";

const LIMITE = 3;

const formatarData = (valor: string) => {
    const data = new Date(valor);

    if (Number.isNaN(data.getTime())) {
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
    valor?: string | null
) => {
    if (!valor) {
        return "Não informado";
    }

    return valor
        .replace("_", " ")
        .replace(
            /\b\w/g,
            (letra) => letra.toUpperCase()
        );
};

const EquipamentosDevolvidos = () => {
    const [registros, setRegistros] =
        useState<EquipamentoMovimentacao[]>([]);

    const [clientes, setClientes] =
        useState<ClienteEstoque[]>([]);

    const [tecnicos, setTecnicos] =
        useState<TecnicoEstoque[]>([]);

    const [clienteId, setClienteId] =
        useState("");

    const [tecnicoId, setTecnicoId] =
        useState("");

    const [mes, setMes] =
        useState("");

    const [pagina, setPagina] =
        useState(1);

    const [total, setTotal] =
        useState(0);

    const [totalPaginas, setTotalPaginas] =
        useState(1);

    const [loading, setLoading] =
        useState(true);

    const [erro, setErro] =
        useState<string | null>(null);

    const carregarListas =
        useCallback(async () => {
            try {
                const [
                    clientesDb,
                    tecnicosDb,
                ] = await Promise.all([
                    getClientesEstoque(),
                    getTecnicosEstoque(),
                ]);

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

    const carregar =
        useCallback(async () => {
            try {
                setLoading(true);
                setErro(null);

                let dataInicio:
                    | string
                    | undefined;

                let dataFim:
                    | string
                    | undefined;

                if (mes) {
                    const [
                        ano,
                        numeroMes,
                    ] = mes
                        .split("-")
                        .map(Number);

                    const ultimoDia =
                        new Date(
                            ano,
                            numeroMes,
                            0
                        ).getDate();

                    dataInicio = `${ano}-${String(
                        numeroMes
                    ).padStart(
                        2,
                        "0"
                    )}-01`;

                    dataFim = `${ano}-${String(
                        numeroMes
                    ).padStart(
                        2,
                        "0"
                    )}-${String(
                        ultimoDia
                    ).padStart(
                        2,
                        "0"
                    )}`;
                }

                const resposta =
                    await getMovimentacoesEstoque(
                        {
                            tipo: "devolucao",
                            clienteId:
                                clienteId ||
                                undefined,
                            tecnicoId:
                                tecnicoId ||
                                undefined,
                            dataInicio,
                            dataFim,
                            pagina,
                            porPagina:
                                LIMITE,
                        }
                    );

                setRegistros(
                    resposta.dados
                );

                setTotal(
                    resposta.total
                );

                setTotalPaginas(
                    resposta.totalPaginas
                );
            } catch (error) {
                setErro(
                    error instanceof Error
                        ? error.message
                        : "Erro ao carregar as devoluções."
                );
            } finally {
                setLoading(false);
            }
        }, [
            clienteId,
            tecnicoId,
            mes,
            pagina,
        ]);

    useEffect(() => {
        void carregarListas();
    }, [carregarListas]);

    useEffect(() => {
        void carregar();
    }, [carregar]);

    useEffect(() => {
        setPagina(1);
    }, [
        clienteId,
        tecnicoId,
        mes,
    ]);

    useEffect(() => {
        if (
            pagina > totalPaginas
        ) {
            setPagina(
                totalPaginas
            );
        }
    }, [
        pagina,
        totalPaginas,
    ]);

    const limpar = () => {
        setClienteId("");
        setTecnicoId("");
        setMes("");
        setPagina(1);
    };

    return (
        <div>
            <AdminHeader
                title="Equipamentos devolvidos"
                subtitle="Consulte o histórico de devoluções."
            />

            <section className="rounded-xl border border-border bg-card p-4 shadow-sm">
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                    <select
                        value={clienteId}
                        onChange={(event) =>
                            setClienteId(
                                event.target.value
                            )
                        }
                        className="h-10 rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                    >
                        <option value="">
                            Todas as empresas
                        </option>

                        {clientes.map(
                            (cliente) => (
                                <option
                                    key={cliente.id}
                                    value={cliente.id}
                                >
                                    {cliente.nome}
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
                        className="h-10 rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                    >
                        <option value="">
                            Todos os técnicos
                        </option>

                        {tecnicos.map(
                            (tecnico) => (
                                <option
                                    key={tecnico.id}
                                    value={tecnico.id}
                                >
                                    {tecnico.nome}
                                </option>
                            )
                        )}
                    </select>

                    <input
                        type="month"
                        value={mes}
                        onChange={(event) =>
                            setMes(
                                event.target.value
                            )
                        }
                        className="h-10 rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                    />

                    <button
                        type="button"
                        onClick={limpar}
                        className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-border bg-background px-4 text-sm font-bold text-foreground hover:bg-secondary"
                    >
                        <RotateCcw className="h-4 w-4" />
                        Limpar filtros
                    </button>
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
            ) : registros.length === 0 ? (
                <div className="mt-5 rounded-xl border border-border bg-card p-10 text-center shadow-sm">
                    <PackageCheck className="mx-auto h-10 w-10 text-muted-foreground/40" />

                    <h3 className="mt-4 font-bold text-foreground">
                        Nenhuma devolução encontrada
                    </h3>

                    <p className="mt-1 text-sm text-muted-foreground">
                        Ajuste os filtros para consultar outro período.
                    </p>
                </div>
            ) : (
                <div className="mt-5 rounded-xl border border-border bg-card p-4 shadow-sm sm:p-5">
                    <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                        {registros.map(
                            (registro) => {
                                const equipamento =
                                    registro.equipamento;

                                const identificacao =
                                    equipamento
                                        ?.patrimonio ||
                                    equipamento
                                        ?.numero_serie ||
                                    equipamento
                                        ?.modelo ||
                                    "Sem identificação";

                                return (
                                    <article
                                        key={
                                            registro.id
                                        }
                                        className="flex min-h-[230px] flex-col overflow-hidden rounded-xl border border-amber-200 bg-background shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
                                    >
                                        <div className="flex items-start justify-between gap-3 border-b border-amber-100 bg-gradient-to-r from-amber-50 to-orange-50 p-3">
                                            <div className="flex min-w-0 items-center gap-2.5">
                                                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-500 text-white">
                                                    <Undo2 className="h-4 w-4" />
                                                </span>

                                                <div className="min-w-0">
                                                    <p className="text-[9px] font-bold uppercase tracking-wide text-amber-700">
                                                        Devolvido
                                                    </p>

                                                    <h3 className="mt-0.5 truncate text-sm font-bold text-foreground">
                                                        {equipamento
                                                            ?.tipo_equipamento
                                                            ?.nome ||
                                                            "Equipamento"}
                                                    </h3>

                                                    <p className="mt-0.5 truncate text-xs text-muted-foreground">
                                                        {
                                                            identificacao
                                                        }
                                                    </p>
                                                </div>
                                            </div>

                                            <span className="shrink-0 rounded-full border border-amber-200 bg-white px-2 py-1 text-[9px] font-bold text-amber-700">
                                                {formatarData(
                                                    registro.criado_em
                                                )}
                                            </span>
                                        </div>

                                        <div className="flex flex-1 flex-col p-3">
                                            <div className="grid grid-cols-2 gap-x-3 gap-y-2 rounded-lg bg-secondary/40 p-2.5">
                                                <div className="min-w-0">
                                                    <div className="flex items-center gap-1 text-muted-foreground">
                                                        <UserRound className="h-3 w-3" />

                                                        <p className="text-[8px] uppercase tracking-wide">
                                                            Técnico
                                                        </p>
                                                    </div>

                                                    <p className="mt-0.5 truncate text-[11px] font-bold text-foreground">
                                                        {registro
                                                            .tecnico_origem
                                                            ?.nome ||
                                                            "Não informado"}
                                                    </p>
                                                </div>

                                                <div className="min-w-0">
                                                    <div className="flex items-center gap-1 text-muted-foreground">
                                                        <Building2 className="h-3 w-3" />

                                                        <p className="text-[8px] uppercase tracking-wide">
                                                            Empresa
                                                        </p>
                                                    </div>

                                                    <p className="mt-0.5 truncate text-[11px] font-bold text-foreground">
                                                        {registro
                                                            .cliente_origem
                                                            ?.nome ||
                                                            registro
                                                                .cliente_destino
                                                                ?.nome ||
                                                            "Não informada"}
                                                    </p>
                                                </div>

                                                <div className="min-w-0">
                                                    <p className="text-[8px] uppercase tracking-wide text-muted-foreground">
                                                        Modelo
                                                    </p>

                                                    <p className="mt-0.5 truncate text-[11px] font-bold text-foreground">
                                                        {equipamento
                                                            ?.modelo ||
                                                            "Não informado"}
                                                    </p>
                                                </div>

                                                <div className="min-w-0">
                                                    <p className="text-[8px] uppercase tracking-wide text-muted-foreground">
                                                        Condição
                                                    </p>

                                                    <p className="mt-0.5 truncate text-[11px] font-bold text-foreground">
                                                        {formatarTexto(
                                                            registro.condicao_anterior ||
                                                                equipamento
                                                                    ?.condicao
                                                        )}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="mt-2.5 rounded-lg border border-amber-100 bg-amber-50/60 px-3 py-2.5">
                                                <div className="flex items-center gap-1.5 text-amber-700">
                                                    <CalendarDays className="h-3.5 w-3.5" />

                                                    <p className="text-[9px] font-bold uppercase tracking-wide">
                                                        Motivo
                                                    </p>
                                                </div>

                                                <p
                                                    className="mt-1 truncate text-xs font-semibold text-foreground"
                                                    title={
                                                        registro.motivo ||
                                                        "Devolução registrada"
                                                    }
                                                >
                                                    {registro.motivo ||
                                                        "Devolução registrada"}
                                                </p>

                                                {registro.observacoes && (
                                                    <p
                                                        className="mt-1 truncate text-[10px] text-muted-foreground"
                                                        title={
                                                            registro.observacoes
                                                        }
                                                    >
                                                        {
                                                            registro.observacoes
                                                        }
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </article>
                                );
                            }
                        )}
                    </section>

                    <EstoquePaginacao
                        paginaAtual={pagina}
                        totalPaginas={
                            totalPaginas
                        }
                        totalResultados={
                            total
                        }
                        limite={LIMITE}
                        onChange={setPagina}
                    />
                </div>
            )}
        </div>
    );
};

export default EquipamentosDevolvidos;