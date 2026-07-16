import {
    ChamadoTecnicoPortal,
    TecnicoLogado,
} from "../types/portal-tecnico.type";

export interface DashboardStats {
    totalChamados: number;
    pendentesValidacao: number;
    aprovados: number;
    reprovados: number;
    aguardando: number;
    emDeslocamento: number;
    noLocal: number;
    emAtendimento: number;
    finalizados: number;
    valorBruto: number;
    adiantamentos: number;
    saldoReceber: number;
}

export const mockServiceCalls:
    ChamadoTecnicoPortal[] = [];

export const MOCK_SERVICE_CALLS:
    ChamadoTecnicoPortal[] =
    mockServiceCalls;

export const serviceCalls:
    ChamadoTecnicoPortal[] =
    mockServiceCalls;

export const mockCalls:
    ChamadoTecnicoPortal[] =
    mockServiceCalls;

export const mockDashboardStats: DashboardStats = {
    totalChamados: 0,
    pendentesValidacao: 0,
    aprovados: 0,
    reprovados: 0,
    aguardando: 0,
    emDeslocamento: 0,
    noLocal: 0,
    emAtendimento: 0,
    finalizados: 0,
    valorBruto: 0,
    adiantamentos: 0,
    saldoReceber: 0,
};

export const MOCK_DASHBOARD_STATS =
    mockDashboardStats;

export const dashboardStats =
    mockDashboardStats;

export const mockTechnician:
    TecnicoLogado | null = null;

export const MOCK_TECHNICIAN =
    mockTechnician;

export const technician =
    mockTechnician;