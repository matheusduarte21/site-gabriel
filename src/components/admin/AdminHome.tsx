import {
    type KeyboardEvent,
    useEffect,
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
import { Button } from "../ui/Button";
import { Chamado } from "../../types/chamado.type";
import { getChamadosAgendados } from "../../services/Chamados/get-chamados.service";
import {
    ChamadosPorEmpresa,
    DesempenhoTecnico,
    getChamadosPorEmpresa,
    getDesempenhoTecnicos,
} from "../../services/dashboard/dashboard.service";

const limit = 5;

const formatCurrency = (value: number) => {
    return value.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
    });
};

const parseValue = (
    value: number | string | null | undefined
): number => {
    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {
        return 0;
    }

    if (typeof value === "number") {
        return Number.isFinite(value) ? value : 0;
    }

    const valorNormalizado = value
        .trim()
        .replace(/\s/g, "")
        .replace(/\.(?=\d{3}(?:\D|$))/g, "")
        .replace(",", ".");

    const numero = Number(valorNormalizado);

    return Number.isFinite(numero) ? numero : 0;
};

const AdminHome = () => {
    const [chamadosAgendados, setChamadosAgendados] =
        useState<Chamado[]>([]);
    const [empresas, setEmpresas] =
        useState<ChamadosPorEmpresa[]>([]);
    const [tecnicos, setTecnicos] =
        useState<DesempenhoTecnico[]>([]);

    const [loadingChamados, setLoadingChamados] =
        useState(true);
    const [loadingEmpresas, setLoadingEmpresas] =
        useState(true);
    const [loadingTecnicos, setLoadingTecnicos] =
        useState(true);

    const [pageChamados, setPageChamados] = useState(1);
    const [pageEmpresas, setPageEmpresas] = useState(1);
    const [pageTecnicos, setPageTecnicos] = useState(1);

    const [modalChamadoAberto, setModalChamadoAberto] =
        useState(false);
    const [
        chamadoSelecionadoId,
        setChamadoSelecionadoId,
    ] = useState<string | null>(null);
    const [empresaSelecionada, setEmpresaSelecionada] =
        useState<string | null>(null);

    const [modalTecnicoAberto, setModalTecnicoAberto] =
        useState(false);
    const [tecnicoSelecionado, setTecnicoSelecionado] =
        useState<DesempenhoTecnico | null>(null);

    useEffect(() => {
        const carregarChamadosAgendados = async () => {
            try {
                setLoadingChamados(true);

                const data =
                    await getChamadosAgendados("2");

                setChamadosAgendados(data);
            } catch (error) {
                console.error(
                    "Erro ao carregar chamados agendados:",
                    error
                );
            } finally {
                setLoadingChamados(false);
            }
        };

        carregarChamadosAgendados();
    }, []);

    useEffect(() => {
        const carregarEmpresas = async () => {
            try {
                setLoadingEmpresas(true);

                const data = await getChamadosPorEmpresa(
                    pageEmpresas,
                    limit
                );

                setEmpresas(data);
            } catch (error) {
                console.error(
                    "Erro ao carregar empresas:",
                    error
                );
            } finally {
                setLoadingEmpresas(false);
            }
        };

        carregarEmpresas();
    }, [pageEmpresas]);

    useEffect(() => {
        const carregarTecnicos = async () => {
            try {
                setLoadingTecnicos(true);

                const data = await getDesempenhoTecnicos(
                    pageTecnicos,
                    limit
                );

                setTecnicos(data);
            } catch (error) {
                console.error(
                    "Erro ao carregar técnicos:",
                    error
                );
            } finally {
                setLoadingTecnicos(false);
            }
        };

        carregarTecnicos();
    }, [pageTecnicos]);

    const abrirChamado = (id: string) => {
        setEmpresaSelecionada(null);
        setChamadoSelecionadoId(id);
        setModalChamadoAberto(true);
    };

    const abrirChamadosEmpresa = (empresa: string) => {
        setChamadoSelecionadoId(null);
        setEmpresaSelecionada(empresa);
        setModalChamadoAberto(true);
    };

    const fecharModalChamado = () => {
        setModalChamadoAberto(false);
        setChamadoSelecionadoId(null);
        setEmpresaSelecionada(null);
    };

    const abrirTecnico = (
        tecnico: DesempenhoTecnico
    ) => {
        setTecnicoSelecionado(tecnico);
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

    const totalFaturado = chamadosAgendados.reduce(
        (total, chamado) =>
            total +
            parseValue(
                chamado.valor_total_cliente
            ),
        0
    );

    const totalPagoTecnico =
        chamadosAgendados.reduce(
            (total, chamado) =>
                total +
                parseValue(
                    chamado.valor_total_tecnico
                ),
            0
        );

    const lucroTotal =
        totalFaturado - totalPagoTecnico;

    const totalChamados =
        chamadosAgendados.length;
    const totalEmpresas =
        empresas[0]?.total_registros ?? 0;
    const totalTecnicos =
        tecnicos[0]?.total_registros ?? 0;

    const totalPagesChamados = Math.ceil(
        totalChamados / limit
    );
    const totalPagesEmpresas = Math.ceil(
        totalEmpresas / limit
    );
    const totalPagesTecnicos = Math.ceil(
        totalTecnicos / limit
    );

    const chamadosAgendadosPaginados =
        chamadosAgendados.slice(
            (pageChamados - 1) * limit,
            pageChamados * limit
        );

    return (
        <div className="space-y-6">
            <AdminHeader
                title="Dashboard Administrativo"
                subtitle="Visão geral da operação e métricas de desempenho"
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
                        {loadingChamados
                            ? "..."
                            : String(
                                  chamadosAgendados.length
                              )}
                    </p>

                    <p className="mt-1 text-xs text-blue-200">
                        Chamados em andamento
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
                        {loadingChamados
                            ? "..."
                            : formatCurrency(
                                  totalFaturado
                              )}
                    </p>

                    <p className="mt-1 text-xs text-indigo-200">
                        Valor faturado
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
                        {loadingChamados
                            ? "..."
                            : formatCurrency(
                                  totalPagoTecnico
                              )}
                    </p>

                    <p className="mt-1 text-xs text-amber-100">
                        Pago ao técnico
                    </p>
                </div>

                <div className="flex flex-col rounded-xl bg-emerald-600 p-6 text-white shadow-md transition-transform hover:-translate-y-1">
                    <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-emerald-100">
                            Valor Ganho
                        </p>

                        <TrendingUp className="h-5 w-5 text-emerald-200" />
                    </div>

                    <p className="mt-4 text-3xl font-bold tracking-tight">
                        {loadingChamados
                            ? "..."
                            : formatCurrency(lucroTotal)}
                    </p>

                    <p className="mt-1 text-xs text-emerald-200">
                        Lucro da operação
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
                        {loadingChamados && (
                            <p className="text-sm text-muted-foreground">
                                Carregando chamados...
                            </p>
                        )}

                        {!loadingChamados &&
                            chamadosAgendados.length ===
                                0 && (
                                <p className="text-sm text-muted-foreground">
                                    Nenhum chamado em
                                    andamento encontrado.
                                </p>
                            )}

                        {!loadingChamados &&
                            chamadosAgendadosPaginados.map(
                                (chamado, index) => {
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
                                            onClick={abrir}
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
                                                <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-600">
                                                    Em andamento
                                                </span>

                                                <button
                                                    type="button"
                                                    disabled={
                                                        !chamadoId
                                                    }
                                                    title="Visualizar chamado"
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

                    {!loadingChamados &&
                        totalPagesChamados > 1 && (
                            <div className="mt-5 flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
                                <span className="text-sm text-muted-foreground">
                                    Mostrando{" "}
                                    <span className="font-medium text-foreground">
                                        {(pageChamados -
                                            1) *
                                            limit +
                                            1}
                                    </span>{" "}
                                    a{" "}
                                    <span className="font-medium text-foreground">
                                        {Math.min(
                                            pageChamados *
                                                limit,
                                            totalChamados
                                        )}
                                    </span>{" "}
                                    de{" "}
                                    <span className="font-medium text-foreground">
                                        {totalChamados}
                                    </span>{" "}
                                    resultados
                                </span>

                                <div className="flex items-center gap-1.5">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={
                                            pageChamados ===
                                            1
                                        }
                                        onClick={() =>
                                            setPageChamados(
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
                                            length: totalPagesChamados,
                                        },
                                        (_, index) =>
                                            index + 1
                                    ).map(
                                        (pagina) => (
                                            <Button
                                                key={
                                                    pagina
                                                }
                                                variant={
                                                    pagina ===
                                                    pageChamados
                                                        ? "default"
                                                        : "outline"
                                                }
                                                size="sm"
                                                onClick={() =>
                                                    setPageChamados(
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
                                        variant="outline"
                                        size="sm"
                                        disabled={
                                            pageChamados ===
                                            totalPagesChamados
                                        }
                                        onClick={() =>
                                            setPageChamados(
                                                (
                                                    pagina
                                                ) =>
                                                    Math.min(
                                                        totalPagesChamados,
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
                            </div>
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
                        {loadingEmpresas && (
                            <p className="text-sm text-muted-foreground">
                                Carregando empresas...
                            </p>
                        )}

                        {!loadingEmpresas &&
                            empresas.length === 0 && (
                                <p className="text-sm text-muted-foreground">
                                    Nenhuma empresa
                                    encontrada.
                                </p>
                            )}

                        {!loadingEmpresas &&
                            empresas.map(
                                (empresa, index) => (
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

                    {!loadingEmpresas &&
                        totalPagesEmpresas > 1 && (
                            <div className="mt-5 flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
                                <span className="text-sm text-muted-foreground">
                                    Mostrando{" "}
                                    <span className="font-medium text-foreground">
                                        {(pageEmpresas -
                                            1) *
                                            limit +
                                            1}
                                    </span>{" "}
                                    a{" "}
                                    <span className="font-medium text-foreground">
                                        {Math.min(
                                            pageEmpresas *
                                                limit,
                                            totalEmpresas
                                        )}
                                    </span>{" "}
                                    de{" "}
                                    <span className="font-medium text-foreground">
                                        {totalEmpresas}
                                    </span>{" "}
                                    resultados
                                </span>

                                <div className="flex items-center gap-1.5">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={
                                            pageEmpresas ===
                                            1
                                        }
                                        onClick={() =>
                                            setPageEmpresas(
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
                                            length: totalPagesEmpresas,
                                        },
                                        (_, index) =>
                                            index + 1
                                    ).map(
                                        (pagina) => (
                                            <Button
                                                key={
                                                    pagina
                                                }
                                                variant={
                                                    pagina ===
                                                    pageEmpresas
                                                        ? "default"
                                                        : "outline"
                                                }
                                                size="sm"
                                                onClick={() =>
                                                    setPageEmpresas(
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
                                        variant="outline"
                                        size="sm"
                                        disabled={
                                            pageEmpresas ===
                                            totalPagesEmpresas
                                        }
                                        onClick={() =>
                                            setPageEmpresas(
                                                (
                                                    pagina
                                                ) =>
                                                    Math.min(
                                                        totalPagesEmpresas,
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
                            </div>
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
                        {loadingTecnicos && (
                            <p className="text-sm text-muted-foreground">
                                Carregando técnicos...
                            </p>
                        )}

                        {!loadingTecnicos &&
                            tecnicos.length === 0 && (
                                <p className="text-sm text-muted-foreground">
                                    Nenhum técnico
                                    encontrado.
                                </p>
                            )}

                        {!loadingTecnicos &&
                            tecnicos.map(
                                (tecnico, index) => {
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
                                            onClick={abrir}
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
                                                        chamados
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

                                                        <p className="mt-1 text-sm font-bold text-emerald-600">
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

                    {!loadingTecnicos &&
                        totalPagesTecnicos > 1 && (
                            <div className="mt-5 flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
                                <span className="text-sm text-muted-foreground">
                                    Mostrando{" "}
                                    <span className="font-medium text-foreground">
                                        {(pageTecnicos -
                                            1) *
                                            limit +
                                            1}
                                    </span>{" "}
                                    a{" "}
                                    <span className="font-medium text-foreground">
                                        {Math.min(
                                            pageTecnicos *
                                                limit,
                                            totalTecnicos
                                        )}
                                    </span>{" "}
                                    de{" "}
                                    <span className="font-medium text-foreground">
                                        {totalTecnicos}
                                    </span>{" "}
                                    resultados
                                </span>

                                <div className="flex items-center gap-1.5">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={
                                            pageTecnicos ===
                                            1
                                        }
                                        onClick={() =>
                                            setPageTecnicos(
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
                                            length: totalPagesTecnicos,
                                        },
                                        (_, index) =>
                                            index + 1
                                    ).map(
                                        (pagina) => (
                                            <Button
                                                key={
                                                    pagina
                                                }
                                                variant={
                                                    pagina ===
                                                    pageTecnicos
                                                        ? "default"
                                                        : "outline"
                                                }
                                                size="sm"
                                                onClick={() =>
                                                    setPageTecnicos(
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
                                        variant="outline"
                                        size="sm"
                                        disabled={
                                            pageTecnicos ===
                                            totalPagesTecnicos
                                        }
                                        onClick={() =>
                                            setPageTecnicos(
                                                (
                                                    pagina
                                                ) =>
                                                    Math.min(
                                                        totalPagesTecnicos,
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
                            </div>
                        )}
                </div>
            </div>

            <ChamadoDetalheModal
                isOpen={modalChamadoAberto}
                onClose={fecharModalChamado}
                chamadoId={chamadoSelecionadoId}
                empresa={empresaSelecionada}
            />

            <TecnicoDetalheModal
                isOpen={modalTecnicoAberto}
                onClose={fecharModalTecnico}
                tecnico={tecnicoSelecionado}
            />
        </div>
    );
};

export default AdminHome;