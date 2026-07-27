import {
    type KeyboardEvent,
    useEffect,
    useMemo,
    useState,
} from "react";
import {
    Building2,
    ChevronLeft,
    ChevronRight,
    ClipboardList,
    DollarSign,
    Eye,
    TrendingUp,
    Users,
    Wallet,
} from "lucide-react";
import AdminHeader from "./AdminHeader";
import ChamadoDetalheModal from "./ChamadoDetalheModal";
import TecnicoDetalheModal from "./TecnicoDetalheModal";
import FiltroMes, {
    ValorFiltroMes,
} from "./FiltroMes";
import { Button } from "../ui/Button";
import { Chamado } from "../../types/chamado.type";
import { getTodosChamados } from "../../services/Chamados/get-all-chamados.service";
import { getTodosTecnicos } from "../../services/Tecnicos/get-all-tecnicos.service";
import {
    ChamadosPorEmpresa,
    DesempenhoTecnico,
} from "../../services/dashboard/dashboard.service";

const limit = 5;

interface PaginacaoProps {
    paginaAtual: number;
    totalPaginas: number;
    totalResultados: number;
    onChange: (pagina: number) => void;
}

const formatCurrency = (
    value: number
): string => {
    return value.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
    });
};

const parseValue = (
    value:
        | number
        | string
        | null
        | undefined
): number => {
    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {
        return 0;
    }

    if (typeof value === "number") {
        return Number.isFinite(value)
            ? value
            : 0;
    }

    const valorNormalizado = value
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

const obterMesAtual = (): string => {
    const hoje = new Date();

    const ano = hoje.getFullYear();

    const mes = String(
        hoje.getMonth() + 1
    ).padStart(2, "0");

    return `${ano}-${mes}`;
};

const obterDataReferencia = (
    chamado: Chamado
): string | null => {
    return (
        chamado.data_agendamento ||
        chamado.data_criacao ||
        null
    );
};

const obterMesReferencia = (
    chamado: Chamado
): string | null => {
    const dataReferencia =
        obterDataReferencia(chamado);

    if (!dataReferencia) {
        return null;
    }

    const mesReferencia =
        dataReferencia.slice(0, 7);

    if (
        !/^\d{4}-\d{2}$/.test(
            mesReferencia
        )
    ) {
        return null;
    }

    return mesReferencia;
};

const obterEstadoTecnico = (
    tecnico: any
): string => {
    if (!tecnico) {
        return "Não informado";
    }

    if (
        typeof tecnico.estado ===
        "string"
    ) {
        return tecnico.estado;
    }

    if (tecnico.estado?.sigla) {
        return tecnico.estado.sigla;
    }

    if (tecnico.estado?.nome) {
        return tecnico.estado.nome;
    }

    if (tecnico.uf) {
        return tecnico.uf;
    }

    if (tecnico.estado_nome) {
        return tecnico.estado_nome;
    }

    return "Não informado";
};

const Paginacao = ({
    paginaAtual,
    totalPaginas,
    totalResultados,
    onChange,
}: PaginacaoProps) => {
    if (totalResultados === 0) {
        return null;
    }

    const inicio =
        (paginaAtual - 1) * limit + 1;

    const fim = Math.min(
        paginaAtual * limit,
        totalResultados
    );

    return (
        <div className="mt-5 flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-sm text-muted-foreground">
                Mostrando{" "}
                <span className="font-medium text-foreground">
                    {inicio}
                </span>{" "}
                a{" "}
                <span className="font-medium text-foreground">
                    {fim}
                </span>{" "}
                de{" "}
                <span className="font-medium text-foreground">
                    {totalResultados}
                </span>{" "}
                resultados
            </span>

            <div className="flex flex-wrap items-center gap-1.5">
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={
                        paginaAtual === 1
                    }
                    onClick={() =>
                        onChange(
                            Math.max(
                                1,
                                paginaAtual - 1
                            )
                        )
                    }
                    className="h-8 w-8 rounded-lg p-0"
                >
                    <ChevronLeft className="h-4 w-4" />
                </Button>

                {Array.from(
                    {
                        length: Math.max(
                            totalPaginas,
                            1
                        ),
                    },
                    (_, index) => index + 1
                ).map((pagina) => (
                    <Button
                        key={pagina}
                        type="button"
                        variant={
                            pagina === paginaAtual
                                ? "default"
                                : "outline"
                        }
                        size="sm"
                        onClick={() =>
                            onChange(pagina)
                        }
                        className="h-8 w-8 rounded-lg p-0 text-xs"
                    >
                        {pagina}
                    </Button>
                ))}

                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={
                        paginaAtual >=
                        totalPaginas
                    }
                    onClick={() =>
                        onChange(
                            Math.min(
                                totalPaginas,
                                paginaAtual + 1
                            )
                        )
                    }
                    className="h-8 w-8 rounded-lg p-0"
                >
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
};

const AdminHome = () => {
    const [
        chamadosOriginais,
        setChamadosOriginais,
    ] = useState<Chamado[]>([]);

    const [
        tecnicosOriginais,
        setTecnicosOriginais,
    ] = useState<any[]>([]);

    const [loading, setLoading] =
        useState(true);

    const [
        mesSelecionado,
        setMesSelecionado,
    ] = useState<ValorFiltroMes>(
        obterMesAtual()
    );

    const [
        pageChamados,
        setPageChamados,
    ] = useState(1);

    const [
        pageEmpresas,
        setPageEmpresas,
    ] = useState(1);

    const [
        pageTecnicos,
        setPageTecnicos,
    ] = useState(1);

    const [
        modalChamadoAberto,
        setModalChamadoAberto,
    ] = useState(false);

    const [
        chamadoSelecionadoId,
        setChamadoSelecionadoId,
    ] = useState<string | null>(null);

    const [
        empresaSelecionada,
        setEmpresaSelecionada,
    ] = useState<string | null>(null);

    const [
        modalTecnicoAberto,
        setModalTecnicoAberto,
    ] = useState(false);

    const [
        tecnicoSelecionado,
        setTecnicoSelecionado,
    ] =
        useState<DesempenhoTecnico | null>(
            null
        );

    useEffect(() => {
        const carregarDados =
            async () => {
                try {
                    setLoading(true);

                    const [
                        chamadosDB,
                        tecnicosDB,
                    ] = await Promise.all([
                        getTodosChamados(),
                        getTodosTecnicos(),
                    ]);

                    setChamadosOriginais(
                        chamadosDB as unknown as Chamado[]
                    );

                    setTecnicosOriginais(
                        tecnicosDB
                    );
                } catch (error) {
                    console.error(
                        "Erro ao carregar o dashboard:",
                        error
                    );
                } finally {
                    setLoading(false);
                }
            };

        carregarDados();
    }, []);

    useEffect(() => {
        setPageChamados(1);
        setPageEmpresas(1);
        setPageTecnicos(1);
    }, [mesSelecionado]);

    const chamadosFiltrados =
        useMemo(() => {
            if (
                mesSelecionado ===
                "todos"
            ) {
                return chamadosOriginais;
            }

            return chamadosOriginais.filter(
                (chamado) =>
                    obterMesReferencia(
                        chamado
                    ) === mesSelecionado
            );
        }, [
            chamadosOriginais,
            mesSelecionado,
        ]);

    const chamadosAgendados =
        useMemo(() => {
            return chamadosFiltrados.filter(
                (chamado) =>
                    Number(
                        chamado.status_id
                    ) === 2
            );
        }, [chamadosFiltrados]);

    const empresas = useMemo(() => {
        const mapaEmpresas = new Map<
            string,
            {
                empresa: string;
                chamados: number;
            }
        >();

        chamadosFiltrados.forEach(
            (chamado) => {
                const nomeEmpresa =
                    chamado.empresa?.trim() ||
                    "Empresa não informada";

                const empresaAtual =
                    mapaEmpresas.get(
                        nomeEmpresa
                    );

                if (empresaAtual) {
                    empresaAtual.chamados +=
                        1;
                } else {
                    mapaEmpresas.set(
                        nomeEmpresa,
                        {
                            empresa:
                                nomeEmpresa,
                            chamados: 1,
                        }
                    );
                }
            }
        );

        const listaEmpresas =
            Array.from(
                mapaEmpresas.values()
            ).sort(
                (empresaA, empresaB) =>
                    empresaB.chamados -
                    empresaA.chamados
            );

        return listaEmpresas.map(
            (empresa) => ({
                ...empresa,
                total_registros:
                    listaEmpresas.length,
            })
        ) as ChamadosPorEmpresa[];
    }, [chamadosFiltrados]);

    const tecnicos = useMemo(() => {
        const tecnicosPorId = new Map<
            string,
            any
        >();

        tecnicosOriginais.forEach(
            (tecnico) => {
                if (tecnico?.id) {
                    tecnicosPorId.set(
                        String(tecnico.id),
                        tecnico
                    );
                }
            }
        );

        const mapaDesempenho =
            new Map<
                string,
                {
                    tecnico_id: string;
                    nome: string;
                    estado: string;
                    chamados: number;
                    faturado: number;
                    pago: number;
                    lucro: number;
                }
            >();

        chamadosFiltrados.forEach(
            (chamado) => {
                if (!chamado.tecnico_id) {
                    return;
                }

                const tecnicoId = String(
                    chamado.tecnico_id
                );

                const tecnicoBanco =
                    tecnicosPorId.get(
                        tecnicoId
                    );

                const faturado =
                    parseValue(
                        chamado.valor_total_cliente
                    );

                const pago = parseValue(
                    chamado.valor_total_tecnico
                );

                const desempenhoAtual =
                    mapaDesempenho.get(
                        tecnicoId
                    );

                if (desempenhoAtual) {
                    desempenhoAtual.chamados +=
                        1;

                    desempenhoAtual.faturado +=
                        faturado;

                    desempenhoAtual.pago +=
                        pago;

                    desempenhoAtual.lucro +=
                        faturado - pago;
                } else {
                    mapaDesempenho.set(
                        tecnicoId,
                        {
                            tecnico_id:
                                tecnicoId,
                            nome:
                                tecnicoBanco?.nome ||
                                "Técnico não informado",
                            estado:
                                obterEstadoTecnico(
                                    tecnicoBanco
                                ),
                            chamados: 1,
                            faturado,
                            pago,
                            lucro:
                                faturado -
                                pago,
                        }
                    );
                }
            }
        );

        const listaTecnicos =
            Array.from(
                mapaDesempenho.values()
            ).sort(
                (
                    tecnicoA,
                    tecnicoB
                ) =>
                    tecnicoB.faturado -
                    tecnicoA.faturado
            );

        return listaTecnicos.map(
            (tecnico) => ({
                ...tecnico,
                total_registros:
                    listaTecnicos.length,
            })
        ) as DesempenhoTecnico[];
    }, [
        chamadosFiltrados,
        tecnicosOriginais,
    ]);

    const totalFaturado =
        useMemo(() => {
            return chamadosFiltrados.reduce(
                (total, chamado) =>
                    total +
                    parseValue(
                        chamado.valor_total_cliente
                    ),
                0
            );
        }, [chamadosFiltrados]);

    const totalPagoTecnico =
        useMemo(() => {
            return chamadosFiltrados.reduce(
                (total, chamado) =>
                    total +
                    parseValue(
                        chamado.valor_total_tecnico
                    ),
                0
            );
        }, [chamadosFiltrados]);

    const lucroTotal =
        totalFaturado -
        totalPagoTecnico;

    const totalChamados =
        chamadosAgendados.length;

    const totalEmpresas =
        empresas.length;

    const totalTecnicos =
        tecnicos.length;

    const totalPagesChamados =
        Math.max(
            1,
            Math.ceil(
                totalChamados / limit
            )
        );

    const totalPagesEmpresas =
        Math.max(
            1,
            Math.ceil(
                totalEmpresas / limit
            )
        );

    const totalPagesTecnicos =
        Math.max(
            1,
            Math.ceil(
                totalTecnicos / limit
            )
        );

    const chamadosAgendadosPaginados =
        chamadosAgendados.slice(
            (pageChamados - 1) *
                limit,
            pageChamados * limit
        );

    const empresasPaginadas =
        empresas.slice(
            (pageEmpresas - 1) *
                limit,
            pageEmpresas * limit
        );

    const tecnicosPaginados =
        tecnicos.slice(
            (pageTecnicos - 1) *
                limit,
            pageTecnicos * limit
        );

    useEffect(() => {
        if (
            pageChamados >
            totalPagesChamados
        ) {
            setPageChamados(
                totalPagesChamados
            );
        }
    }, [
        pageChamados,
        totalPagesChamados,
    ]);

    useEffect(() => {
        if (
            pageEmpresas >
            totalPagesEmpresas
        ) {
            setPageEmpresas(
                totalPagesEmpresas
            );
        }
    }, [
        pageEmpresas,
        totalPagesEmpresas,
    ]);

    useEffect(() => {
        if (
            pageTecnicos >
            totalPagesTecnicos
        ) {
            setPageTecnicos(
                totalPagesTecnicos
            );
        }
    }, [
        pageTecnicos,
        totalPagesTecnicos,
    ]);

    const abrirChamado = (
        id: string
    ) => {
        setEmpresaSelecionada(null);
        setChamadoSelecionadoId(id);
        setModalChamadoAberto(true);
    };

    const abrirChamadosEmpresa = (
        empresa: string
    ) => {
        setChamadoSelecionadoId(
            null
        );

        setEmpresaSelecionada(
            empresa
        );

        setModalChamadoAberto(true);
    };

    const fecharModalChamado = () => {
        setModalChamadoAberto(false);
        setChamadoSelecionadoId(
            null
        );
        setEmpresaSelecionada(null);
    };

    const abrirTecnico = (
        tecnico: DesempenhoTecnico
    ) => {
        setTecnicoSelecionado(
            tecnico
        );

        setModalTecnicoAberto(true);
    };

    const fecharModalTecnico = () => {
        setModalTecnicoAberto(false);
        setTecnicoSelecionado(null);
    };

    const executarComTeclado = (
        event: KeyboardEvent<HTMLDivElement>,
        callback: () => void
    ) => {
        if (
            event.key === "Enter" ||
            event.key === " "
        ) {
            event.preventDefault();
            callback();
        }
    };

    return (
        <div className="space-y-6">
            <AdminHeader
                title="Dashboard Administrativo"
                subtitle="Visão geral da operação e métricas de desempenho"
            />

            <FiltroMes
                value={mesSelecionado}
                onChange={
                    setMesSelecionado
                }
            />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="flex flex-col rounded-xl bg-blue-600 p-6 text-white shadow-md transition-transform hover:-translate-y-1">
                    <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-blue-100">
                            Chamados Agendados
                        </p>

                        <ClipboardList className="h-5 w-5 text-blue-200" />
                    </div>

                    <p className="mt-4 text-3xl font-bold tracking-tight">
                        {loading
                            ? "..."
                            : String(
                                  totalChamados
                              )}
                    </p>

                    <p className="mt-1 text-xs text-blue-200">
                        Chamados em andamento no período
                    </p>
                </div>

                <div className="flex flex-col rounded-xl bg-indigo-600 p-6 text-white shadow-md transition-transform hover:-translate-y-1">
                    <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-indigo-100">
                            Valor Total
                        </p>

                        <DollarSign className="h-5 w-5 text-indigo-200" />
                    </div>

                    <p className="mt-4 text-3xl font-bold tracking-tight">
                        {loading
                            ? "..."
                            : formatCurrency(
                                  totalFaturado
                              )}
                    </p>

                    <p className="mt-1 text-xs text-indigo-200">
                        Valor faturado no período
                    </p>
                </div>

                <div className="flex flex-col rounded-xl bg-amber-500 p-6 text-white shadow-md transition-transform hover:-translate-y-1">
                    <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-amber-100">
                            Valor Pago
                        </p>

                        <Wallet className="h-5 w-5 text-amber-200" />
                    </div>

                    <p className="mt-4 text-3xl font-bold tracking-tight">
                        {loading
                            ? "..."
                            : formatCurrency(
                                  totalPagoTecnico
                              )}
                    </p>

                    <p className="mt-1 text-xs text-amber-100">
                        Pago aos técnicos no período
                    </p>
                </div>

                <div
                    className={`flex flex-col rounded-xl p-6 text-white shadow-md transition-transform hover:-translate-y-1 ${
                        lucroTotal >= 0
                            ? "bg-emerald-600"
                            : "bg-red-600"
                    }`}
                >
                    <div className="flex items-center justify-between">
                        <p
                            className={`text-sm font-medium ${
                                lucroTotal >= 0
                                    ? "text-emerald-100"
                                    : "text-red-100"
                            }`}
                        >
                            {lucroTotal >= 0
                                ? "Valor Ganho"
                                : "Prejuízo"}
                        </p>

                        <TrendingUp
                            className={`h-5 w-5 ${
                                lucroTotal >= 0
                                    ? "text-emerald-200"
                                    : "text-red-200"
                            }`}
                        />
                    </div>

                    <p className="mt-4 text-3xl font-bold tracking-tight">
                        {loading
                            ? "..."
                            : formatCurrency(
                                  lucroTotal
                              )}
                    </p>

                    <p
                        className={`mt-1 text-xs ${
                            lucroTotal >= 0
                                ? "text-emerald-200"
                                : "text-red-200"
                        }`}
                    >
                        Resultado da operação no período
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                    <div className="mb-6 flex items-center gap-2 border-b border-border pb-4">
                        <ClipboardList className="h-5 w-5 text-blue-600" />

                        <h2 className="text-lg font-bold text-foreground">
                            Chamados Agendados
                        </h2>
                    </div>

                    <div className="space-y-3">
                        {loading && (
                            <p className="text-sm text-muted-foreground">
                                Carregando chamados...
                            </p>
                        )}

                        {!loading &&
                            chamadosAgendados.length ===
                                0 && (
                                <p className="rounded-lg border border-dashed border-border bg-muted/20 px-4 py-8 text-center text-sm text-muted-foreground">
                                    Nenhum chamado em andamento encontrado no período.
                                </p>
                            )}

                        {!loading &&
                            chamadosAgendadosPaginados.map(
                                (
                                    chamado,
                                    index
                                ) => {
                                    const chamadoId =
                                        chamado.id;

                                    const abrir =
                                        chamadoId
                                            ? () =>
                                                  abrirChamado(
                                                      chamadoId
                                                  )
                                            : undefined;

                                    return (
                                        <div
                                            key={
                                                chamadoId ??
                                                `${chamado.numero_chamado}-${index}`
                                            }
                                            role={
                                                chamadoId
                                                    ? "button"
                                                    : undefined
                                            }
                                            tabIndex={
                                                chamadoId
                                                    ? 0
                                                    : -1
                                            }
                                            onClick={
                                                abrir
                                            }
                                            onKeyDown={(
                                                event
                                            ) => {
                                                if (
                                                    abrir
                                                ) {
                                                    executarComTeclado(
                                                        event,
                                                        abrir
                                                    );
                                                }
                                            }}
                                            className={`group flex items-center justify-between rounded-lg border border-border bg-background px-4 py-3 shadow-sm transition-all ${
                                                chamadoId
                                                    ? "cursor-pointer hover:border-blue-300 hover:bg-blue-50/40 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                                                    : "cursor-not-allowed opacity-60"
                                            }`}
                                        >
                                            <div className="space-y-1">
                                                <p className="text-sm font-bold text-blue-600">
                                                    {chamado.numero_chamado ||
                                                        "Sem número"}
                                                </p>

                                                <p className="text-xs font-medium text-foreground">
                                                    {chamado.empresa ||
                                                        "Empresa não informada"}
                                                </p>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600">
                                                    Em andamento
                                                </span>

                                                <button
                                                    type="button"
                                                    disabled={
                                                        !chamadoId
                                                    }
                                                    title="Visualizar chamado"
                                                    aria-label="Visualizar chamado"
                                                    onClick={(
                                                        event
                                                    ) => {
                                                        event.stopPropagation();

                                                        if (
                                                            chamadoId
                                                        ) {
                                                            abrirChamado(
                                                                chamadoId
                                                            );
                                                        }
                                                    }}
                                                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-blue-200 bg-blue-50 text-blue-600 transition-colors hover:bg-blue-600 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                }
                            )}
                    </div>

                    {!loading && (
                        <Paginacao
                            paginaAtual={
                                pageChamados
                            }
                            totalPaginas={
                                totalPagesChamados
                            }
                            totalResultados={
                                totalChamados
                            }
                            onChange={
                                setPageChamados
                            }
                        />
                    )}
                </div>

                <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                    <div className="mb-6 flex items-center gap-2 border-b border-border pb-4">
                        <Building2 className="h-5 w-5 text-indigo-600" />

                        <h2 className="text-lg font-bold text-foreground">
                            Chamados por Empresa
                        </h2>
                    </div>

                    <div className="space-y-3">
                        {loading && (
                            <p className="text-sm text-muted-foreground">
                                Carregando empresas...
                            </p>
                        )}

                        {!loading &&
                            empresas.length ===
                                0 && (
                                <p className="rounded-lg border border-dashed border-border bg-muted/20 px-4 py-8 text-center text-sm text-muted-foreground">
                                    Nenhuma empresa encontrada no período.
                                </p>
                            )}

                        {!loading &&
                            empresasPaginadas.map(
                                (
                                    empresa,
                                    index
                                ) => (
                                    <div
                                        key={
                                            empresa.empresa
                                        }
                                        role="button"
                                        tabIndex={0}
                                        onClick={() =>
                                            abrirChamadosEmpresa(
                                                empresa.empresa
                                            )
                                        }
                                        onKeyDown={(
                                            event
                                        ) =>
                                            executarComTeclado(
                                                event,
                                                () =>
                                                    abrirChamadosEmpresa(
                                                        empresa.empresa
                                                    )
                                            )
                                        }
                                        className="group flex cursor-pointer items-center justify-between rounded-lg border border-border bg-background px-4 py-3 shadow-sm transition-all hover:border-indigo-300 hover:bg-indigo-50/40 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white shadow-sm">
                                                {(pageEmpresas -
                                                    1) *
                                                    limit +
                                                    index +
                                                    1}
                                            </span>

                                            <span className="text-sm font-semibold text-foreground">
                                                {
                                                    empresa.empresa
                                                }
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <span className="rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-600">
                                                {
                                                    empresa.chamados
                                                }{" "}
                                                {empresa.chamados ===
                                                1
                                                    ? "chamado"
                                                    : "chamados"}
                                            </span>

                                            <button
                                                type="button"
                                                title="Visualizar chamados da empresa"
                                                aria-label="Visualizar chamados da empresa"
                                                onClick={(
                                                    event
                                                ) => {
                                                    event.stopPropagation();

                                                    abrirChamadosEmpresa(
                                                        empresa.empresa
                                                    );
                                                }}
                                                className="flex h-9 w-9 items-center justify-center rounded-lg border border-indigo-200 bg-indigo-50 text-indigo-600 transition-colors hover:bg-indigo-600 hover:text-white"
                                            >
                                                <Eye className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                )
                            )}
                    </div>

                    {!loading && (
                        <Paginacao
                            paginaAtual={
                                pageEmpresas
                            }
                            totalPaginas={
                                totalPagesEmpresas
                            }
                            totalResultados={
                                totalEmpresas
                            }
                            onChange={
                                setPageEmpresas
                            }
                        />
                    )}
                </div>

                <div className="rounded-xl border border-border bg-card p-6 shadow-sm lg:col-span-2">
                    <div className="mb-6 flex items-center gap-2 border-b border-border pb-4">
                        <Users className="h-5 w-5 text-emerald-600" />

                        <h2 className="text-lg font-bold text-foreground">
                            Desempenho dos Técnicos
                        </h2>
                    </div>

                    <div className="space-y-3">
                        {loading && (
                            <p className="text-sm text-muted-foreground">
                                Carregando técnicos...
                            </p>
                        )}

                        {!loading &&
                            tecnicos.length ===
                                0 && (
                                <p className="rounded-lg border border-dashed border-border bg-muted/20 px-4 py-8 text-center text-sm text-muted-foreground">
                                    Nenhum técnico com chamados no período.
                                </p>
                            )}

                        {!loading &&
                            tecnicosPaginados.map(
                                (
                                    tecnico,
                                    index
                                ) => {
                                    const tecnicoId =
                                        tecnico.tecnico_id;

                                    const abrir =
                                        tecnicoId
                                            ? () =>
                                                  abrirTecnico(
                                                      tecnico
                                                  )
                                            : undefined;

                                    return (
                                        <div
                                            key={
                                                tecnicoId ??
                                                `${tecnico.nome}-${index}`
                                            }
                                            role={
                                                tecnicoId
                                                    ? "button"
                                                    : undefined
                                            }
                                            tabIndex={
                                                tecnicoId
                                                    ? 0
                                                    : -1
                                            }
                                            onClick={
                                                abrir
                                            }
                                            onKeyDown={(
                                                event
                                            ) => {
                                                if (
                                                    abrir
                                                ) {
                                                    executarComTeclado(
                                                        event,
                                                        abrir
                                                    );
                                                }
                                            }}
                                            className={`group flex flex-col gap-4 rounded-lg border border-border bg-background px-4 py-4 shadow-sm transition-all sm:flex-row sm:items-center sm:justify-between ${
                                                tecnicoId
                                                    ? "cursor-pointer hover:border-emerald-300 hover:bg-emerald-50/30 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
                                                    : "cursor-not-allowed opacity-60"
                                            }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-700">
                                                    {tecnico.nome
                                                        ?.trim()
                                                        .charAt(
                                                            0
                                                        )
                                                        .toUpperCase() ||
                                                        "T"}
                                                </span>

                                                <div>
                                                    <p className="text-sm font-bold text-foreground">
                                                        {
                                                            tecnico.nome
                                                        }
                                                    </p>

                                                    <p className="mt-0.5 text-xs font-medium text-muted-foreground">
                                                        {
                                                            tecnico.estado
                                                        }{" "}
                                                        ·{" "}
                                                        {
                                                            tecnico.chamados
                                                        }{" "}
                                                        {tecnico.chamados ===
                                                        1
                                                            ? "chamado"
                                                            : "chamados"}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-4">
                                                <div className="grid flex-1 grid-cols-3 gap-5 text-right sm:gap-10">
                                                    <div>
                                                        <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                                                            Faturado
                                                        </p>

                                                        <p className="mt-1 text-sm font-bold text-indigo-600">
                                                            {formatCurrency(
                                                                tecnico.faturado
                                                            )}
                                                        </p>
                                                    </div>

                                                    <div>
                                                        <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                                                            Pago
                                                        </p>

                                                        <p className="mt-1 text-sm font-bold text-amber-500">
                                                            {formatCurrency(
                                                                tecnico.pago
                                                            )}
                                                        </p>
                                                    </div>

                                                    <div>
                                                        <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                                                            Lucro
                                                        </p>

                                                        <p
                                                            className={`mt-1 text-sm font-bold ${
                                                                tecnico.lucro >=
                                                                0
                                                                    ? "text-emerald-600"
                                                                    : "text-red-600"
                                                            }`}
                                                        >
                                                            {formatCurrency(
                                                                tecnico.lucro
                                                            )}
                                                        </p>
                                                    </div>
                                                </div>

                                                <button
                                                    type="button"
                                                    disabled={
                                                        !tecnicoId
                                                    }
                                                    title="Visualizar desempenho do técnico"
                                                    aria-label="Visualizar desempenho do técnico"
                                                    onClick={(
                                                        event
                                                    ) => {
                                                        event.stopPropagation();

                                                        if (
                                                            tecnicoId
                                                        ) {
                                                            abrirTecnico(
                                                                tecnico
                                                            );
                                                        }
                                                    }}
                                                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-600 transition-colors hover:bg-emerald-600 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                }
                            )}
                    </div>

                    {!loading && (
                        <Paginacao
                            paginaAtual={
                                pageTecnicos
                            }
                            totalPaginas={
                                totalPagesTecnicos
                            }
                            totalResultados={
                                totalTecnicos
                            }
                            onChange={
                                setPageTecnicos
                            }
                        />
                    )}
                </div>
            </div>

            <ChamadoDetalheModal
                isOpen={
                    modalChamadoAberto
                }
                onClose={
                    fecharModalChamado
                }
                chamadoId={
                    chamadoSelecionadoId
                }
                empresa={
                    empresaSelecionada
                }
            />

            <TecnicoDetalheModal
                isOpen={
                    modalTecnicoAberto
                }
                onClose={
                    fecharModalTecnico
                }
                tecnico={
                    tecnicoSelecionado
                }
            />
        </div>
    );
};

export default AdminHome;