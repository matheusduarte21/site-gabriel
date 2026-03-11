import {
    ClipboardList,
    Clock,
    DollarSign,
    CheckCircle,
    Building2,
    Users,
} from "lucide-react";
import AdminHeader from "./AdminHeader";
import StatCard from "./StatCard";

const mockTecnicos = [
    { nome: "Gabriel Oliveira", estado: "SP", chamados: 45, faturado: "R$ 12.350,00" },
    { nome: "Lucas Santos", estado: "RJ", chamados: 38, faturado: "R$ 9.800,00" },
    { nome: "Pedro Lima", estado: "MG", chamados: 32, faturado: "R$ 8.200,00" },
];

const mockEmpresas = [
    { nome: "TechCorp", chamados: 28 },
    { nome: "InfoServ", chamados: 22 },
    { nome: "DataPro", chamados: 18 },
    { nome: "NetSys", chamados: 15 },
];

const AdminHome = () => {
    return (
        <div className="space-y-6">
        <AdminHeader
            title="Dashboard Administrativo"
            subtitle="Visão geral da operação e métricas de desempenho"
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
                title="Total de Chamados"
                value="115"
                subtitle="Chamados atendidos até o momento"
                icon={ClipboardList}
                variant="primary"
            />
            <StatCard
                title="Atendimentos Realizados"
                value="108"
                subtitle="Chamados finalizados com sucesso"
                icon={CheckCircle}
                variant="success"
            />
            <StatCard
                title="Horas de Serviço"
                value="342h"
                subtitle="Total de horas trabalhadas"
                icon={Clock}
                variant="info"
            />
            <StatCard
                title="Valor Faturado"
                value="R$ 30.350,00"
                subtitle="Faturamento total acumulado"
                icon={DollarSign}
                variant="warning"
            />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="rounded-xl border border-border bg-card p-6">
                <div className="mb-4 flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-primary" />
                    <h2 className="text-lg font-semibold text-foreground">Chamados por Empresa</h2>
                </div>
                <div className="space-y-3">
                    {mockEmpresas.map((empresa) => (
                    <div
                        key={empresa.nome}
                        className="flex items-center justify-between rounded-lg bg-muted/50 px-4 py-3"
                    >
                        <span className="text-sm font-medium text-foreground">{empresa.nome}</span>
                        <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                            {empresa.chamados} chamados
                        </span>
                    </div>
                    ))}
                </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-6">
            <div className="mb-4 flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-semibold text-foreground">Desempenho dos Técnicos</h2>
            </div>
            <div className="space-y-3">
                {mockTecnicos.map((tecnico) => (
                <div
                    key={tecnico.nome}
                    className="flex items-center justify-between rounded-lg bg-muted/50 px-4 py-3"
                >
                    <div>
                        <p className="text-sm font-medium text-foreground">{tecnico.nome}</p>
                        <p className="text-xs text-muted-foreground">
                            {tecnico.estado} · {tecnico.chamados} chamados
                        </p>
                    </div>
                    <span className="text-sm font-bold text-success">{tecnico.faturado}</span>
                </div>
                ))}
            </div>
            </div>
        </div>
        </div>
    );
};

export default AdminHome;