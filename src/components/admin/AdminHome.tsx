import { useEffect, useState } from "react";
import {
    ClipboardList,
    DollarSign,
    Wallet,
    TrendingUp,
    Building2,
    Users,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";
import AdminHeader from "./AdminHeader";
import StatCard from "./StatCard";
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

const parseValue = (value: number | string | null | undefined) => {
    if (!value) return 0;
    return Number(value) || 0;
};

const AdminHome = () => {
    const [chamadosAgendados, setChamadosAgendados] = useState<Chamado[]>([]);
    const [empresas, setEmpresas] = useState<ChamadosPorEmpresa[]>([]);
    const [tecnicos, setTecnicos] = useState<DesempenhoTecnico[]>([]);

    const [loadingChamados, setLoadingChamados] = useState(true);
    const [loadingEmpresas, setLoadingEmpresas] = useState(true);
    const [loadingTecnicos, setLoadingTecnicos] = useState(true);

    const [pageChamados, setPageChamados] = useState(1);
    const [pageEmpresas, setPageEmpresas] = useState(1);
    const [pageTecnicos, setPageTecnicos] = useState(1);

    useEffect(() => {
        async function carregarChamadosAgendados() {
            try {
                setLoadingChamados(true);
                const data = await getChamadosAgendados("2");
                setChamadosAgendados(data);
            } catch (error) {
                console.error("Erro ao carregar chamados agendados:", error);
            } finally {
                setLoadingChamados(false);
            }
        }

        carregarChamadosAgendados();
    }, []);

    useEffect(() => {
        async function carregarEmpresas() {
            try {
                setLoadingEmpresas(true);
                const data = await getChamadosPorEmpresa(pageEmpresas, limit);
                setEmpresas(data);
            } catch (error) {
                console.error("Erro ao carregar empresas:", error);
            } finally {
                setLoadingEmpresas(false);
            }
        }

        carregarEmpresas();
    }, [pageEmpresas]);

    useEffect(() => {
        async function carregarTecnicos() {
            try {
                setLoadingTecnicos(true);
                const data = await getDesempenhoTecnicos(pageTecnicos, limit);
                setTecnicos(data);
            } catch (error) {
                console.error("Erro ao carregar técnicos:", error);
            } finally {
                setLoadingTecnicos(false);
            }
        }

        carregarTecnicos();
    }, [pageTecnicos]);

    const totalFaturado = chamadosAgendados.reduce((total, chamado) => {
        return total + parseValue(chamado.valor_total_cliente);
    }, 0);

    const totalPagoTecnico = chamadosAgendados.reduce((total, chamado) => {
        return total + parseValue(chamado.valor_total_tecnico);
    }, 0);

    const lucroTotal = totalFaturado - totalPagoTecnico;

    const totalChamados = chamadosAgendados.length;
    const totalEmpresas = empresas[0]?.total_registros || 0;
    const totalTecnicos = tecnicos[0]?.total_registros || 0;

    const totalPagesChamados = Math.ceil(totalChamados / limit);
    const totalPagesEmpresas = Math.ceil(totalEmpresas / limit);
    const totalPagesTecnicos = Math.ceil(totalTecnicos / limit);

    const chamadosAgendadosPaginados = chamadosAgendados.slice(
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
                <StatCard
                    title="Chamados Agendados"
                    value={loadingChamados ? "..." : String(chamadosAgendados.length)}
                    subtitle="Chamados em andamento"
                    icon={ClipboardList}
                    variant="primary"
                />

                <StatCard
                    title="Valor Total"
                    value={loadingChamados ? "..." : formatCurrency(totalFaturado)}
                    subtitle="Valor faturado"
                    icon={DollarSign}
                    variant="warning"
                />

                <StatCard
                    title="Valor Pago"
                    value={loadingChamados ? "..." : formatCurrency(totalPagoTecnico)}
                    subtitle="Pago ao técnico"
                    icon={Wallet}
                    variant="info"
                />

                <StatCard
                    title="Valor Ganho"
                    value={loadingChamados ? "..." : formatCurrency(lucroTotal)}
                    subtitle="Lucro da operação"
                    icon={TrendingUp}
                    variant="success"
                />
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <div className="rounded-xl border border-border bg-card p-6">
                    <div className="mb-4 flex items-center gap-2">
                        <ClipboardList className="h-5 w-5 text-primary" />
                        <h2 className="text-lg font-semibold text-foreground">
                            Chamados Agendados
                        </h2>
                    </div>

                    <div className="space-y-3">
                        {loadingChamados && (
                            <p className="text-sm text-muted-foreground">
                                Carregando chamados...
                            </p>
                        )}

                        {!loadingChamados && chamadosAgendados.length === 0 && (
                            <p className="text-sm text-muted-foreground">
                                Nenhum chamado em andamento encontrado.
                            </p>
                        )}

                        {!loadingChamados &&
                            chamadosAgendadosPaginados.map((chamado) => (
                                <div
                                    key={chamado.id}
                                    className="flex items-center justify-between rounded-lg bg-muted/50 px-4 py-3"
                                >
                                    <div>
                                        <p className="text-sm font-medium text-foreground">
                                            {chamado.numero_chamado || "Sem número"}
                                        </p>

                                        <p className="text-xs text-muted-foreground">
                                            {chamado.empresa || "Empresa não informada"}
                                        </p>

                                        
                                    </div>

                                    <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                                        Em andamento
                                    </span>
                                </div>
                            ))}
                    </div>

                    {!loadingChamados && totalPagesChamados > 1 && (
                        <div className="mt-5 flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
                            <span className="text-sm text-muted-foreground">
                                Mostrando{" "}
                                <span className="font-medium text-foreground">
                                    {(pageChamados - 1) * limit + 1}
                                </span>{" "}
                                a{" "}
                                <span className="font-medium text-foreground">
                                    {Math.min(pageChamados * limit, totalChamados)}
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
                                    disabled={pageChamados === 1}
                                    onClick={() => setPageChamados((p) => Math.max(1, p - 1))}
                                    className="h-8 w-8 p-0"
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>

                                {Array.from({ length: totalPagesChamados }, (_, i) => i + 1).map(
                                    (page) => (
                                        <Button
                                            key={page}
                                            variant={page === pageChamados ? "default" : "outline"}
                                            size="sm"
                                            onClick={() => setPageChamados(page)}
                                            className="h-8 w-8 p-0 text-xs"
                                        >
                                            {page}
                                        </Button>
                                    )
                                )}

                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={pageChamados === totalPagesChamados}
                                    onClick={() =>
                                        setPageChamados((p) => Math.min(totalPagesChamados, p + 1))
                                    }
                                    className="h-8 w-8 p-0"
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    )}
                </div>

                <div className="rounded-xl border border-border bg-card p-6">
                    <div className="mb-4 flex items-center gap-2">
                        <Building2 className="h-5 w-5 text-primary" />
                        <h2 className="text-lg font-semibold text-foreground">
                            Chamados por Empresa
                        </h2>
                    </div>

                    <div className="space-y-3">
                        {loadingEmpresas && (
                            <p className="text-sm text-muted-foreground">
                                Carregando empresas...
                            </p>
                        )}

                        {!loadingEmpresas && empresas.length === 0 && (
                            <p className="text-sm text-muted-foreground">
                                Nenhuma empresa encontrada.
                            </p>
                        )}

                        {!loadingEmpresas &&
                            empresas.map((empresa) => (
                                <div
                                    key={empresa.empresa}
                                    className="flex items-center justify-between rounded-lg bg-muted/50 px-4 py-3"
                                >
                                    <span className="text-sm font-medium text-foreground">
                                        {empresa.empresa}
                                    </span>

                                    <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                                        {empresa.chamados} chamados
                                    </span>
                                </div>
                            ))}
                    </div>

                    {!loadingEmpresas && totalPagesEmpresas > 1 && (
                        <div className="mt-5 flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
                            <span className="text-sm text-muted-foreground">
                                Mostrando{" "}
                                <span className="font-medium text-foreground">
                                    {(pageEmpresas - 1) * limit + 1}
                                </span>{" "}
                                a{" "}
                                <span className="font-medium text-foreground">
                                    {Math.min(pageEmpresas * limit, totalEmpresas)}
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
                                    disabled={pageEmpresas === 1}
                                    onClick={() => setPageEmpresas((p) => Math.max(1, p - 1))}
                                    className="h-8 w-8 p-0"
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>

                                {Array.from({ length: totalPagesEmpresas }, (_, i) => i + 1).map(
                                    (page) => (
                                        <Button
                                            key={page}
                                            variant={page === pageEmpresas ? "default" : "outline"}
                                            size="sm"
                                            onClick={() => setPageEmpresas(page)}
                                            className="h-8 w-8 p-0 text-xs"
                                        >
                                            {page}
                                        </Button>
                                    )
                                )}

                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={pageEmpresas === totalPagesEmpresas}
                                    onClick={() =>
                                        setPageEmpresas((p) => Math.min(totalPagesEmpresas, p + 1))
                                    }
                                    className="h-8 w-8 p-0"
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    )}
                </div>

                <div className="rounded-xl border border-border bg-card p-6 lg:col-span-2">
                    <div className="mb-4 flex items-center gap-2">
                        <Users className="h-5 w-5 text-primary" />
                        <h2 className="text-lg font-semibold text-foreground">
                            Desempenho dos Técnicos
                        </h2>
                    </div>

                    <div className="space-y-3">
                        {loadingTecnicos && (
                            <p className="text-sm text-muted-foreground">
                                Carregando técnicos...
                            </p>
                        )}

                        {!loadingTecnicos && tecnicos.length === 0 && (
                            <p className="text-sm text-muted-foreground">
                                Nenhum técnico encontrado.
                            </p>
                        )}

                        {!loadingTecnicos &&
                            tecnicos.map((tecnico) => (
                                <div
                                    key={tecnico.tecnico_id}
                                    className="flex items-center justify-between rounded-lg bg-muted/50 px-4 py-3"
                                >
                                    <div>
                                        <p className="text-sm font-medium text-foreground">
                                            {tecnico.nome}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {tecnico.estado} · {tecnico.chamados} chamados
                                        </p>
                                    </div>

                                    <div className="text-right">
                                        <p className="text-sm font-bold text-success">
                                            {formatCurrency(tecnico.lucro)}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            Faturado: {formatCurrency(tecnico.faturado)}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            Pago: {formatCurrency(tecnico.pago)}
                                        </p>
                                    </div>
                                </div>
                            ))}
                    </div>

                    {!loadingTecnicos && totalPagesTecnicos > 1 && (
                        <div className="mt-5 flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
                            <span className="text-sm text-muted-foreground">
                                Mostrando{" "}
                                <span className="font-medium text-foreground">
                                    {(pageTecnicos - 1) * limit + 1}
                                </span>{" "}
                                a{" "}
                                <span className="font-medium text-foreground">
                                    {Math.min(pageTecnicos * limit, totalTecnicos)}
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
                                    disabled={pageTecnicos === 1}
                                    onClick={() => setPageTecnicos((p) => Math.max(1, p - 1))}
                                    className="h-8 w-8 p-0"
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>

                                {Array.from({ length: totalPagesTecnicos }, (_, i) => i + 1).map(
                                    (page) => (
                                        <Button
                                            key={page}
                                            variant={page === pageTecnicos ? "default" : "outline"}
                                            size="sm"
                                            onClick={() => setPageTecnicos(page)}
                                            className="h-8 w-8 p-0 text-xs"
                                        >
                                            {page}
                                        </Button>
                                    )
                                )}

                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={pageTecnicos === totalPagesTecnicos}
                                    onClick={() =>
                                        setPageTecnicos((p) => Math.min(totalPagesTecnicos, p + 1))
                                    }
                                    className="h-8 w-8 p-0"
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminHome;