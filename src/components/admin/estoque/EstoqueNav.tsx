import { NavLink } from "react-router-dom";
import {
    Boxes,
    History,
    LayoutDashboard,
    RotateCcw,
    Tags,
} from "lucide-react";

const itens = [
    {
        to: "/admin/estoque",
        label: "Painel",
        icon: LayoutDashboard,
        end: true,
    },
    {
        to: "/admin/estoque/equipamentos",
        label: "Equipamentos",
        icon: Boxes,
    },
    {
        to: "/admin/estoque/tipos",
        label: "Tipos",
        icon: Tags,
    },
    {
        to: "/admin/estoque/movimentacoes",
        label: "Movimentar",
        icon: RotateCcw,
    },
    {
        to: "/admin/estoque/devolvidos",
        label: "Devolvidos",
        icon: History,
    },
];

const EstoqueNav = () => {
    return (
        <nav className="overflow-x-auto rounded-xl border border-border bg-card p-2 shadow-sm">
            <div className="flex min-w-max gap-2">
                {itens.map((item) => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        end={item.end}
                        className={({
                            isActive,
                        }) =>
                            `inline-flex h-10 items-center justify-center gap-2 rounded-lg px-4 text-sm font-bold ${
                                isActive
                                    ? "bg-primary text-primary-foreground"
                                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                            }`
                        }
                    >
                        <item.icon className="h-4 w-4" />
                        {item.label}
                    </NavLink>
                ))}
            </div>
        </nav>
    );
};

export default EstoqueNav;
