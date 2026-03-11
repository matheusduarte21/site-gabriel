import { NavLink } from "react-router-dom";
import {
    LayoutDashboard,
    CalendarRange,
    Building2,
    Users,
    Wrench,
    Settings,
    LogOut,
} from "lucide-react";

const navItems = [
    { to: "/admin", icon: LayoutDashboard, label: "Dashboard", end: true },
    { to: "/admin/empresas", icon: Building2, label: "Empresas" },
    { to: "/admin/clientes", icon: Users, label: "Clientes" },
    { to: "/admin/tecnicos", icon: Wrench, label: "Técnicos" },
];

const AdminSidebar = () => {
    const baseItemClass = "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors";
    return (
            <aside className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground">
    {/* Cabeçalho do Sidebar */}
    <div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <Wrench className="h-5 w-5 text-primary-foreground" />
        </div>
        <div>
            <h1 className="text-sm font-bold text-sidebar-foreground">Flasus Soluções</h1>
            <p className="text-xs text-muted-foreground/70">Field & Tecnologia</p>
        </div>
    </div>

    {/* Navegação */}
    <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map((item) => (
            <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                    `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                        isActive 
                        ? "bg-sidebar-accent text-sidebar-accent-foreground" 
                        : "text-sidebar-foreground/60 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                    }`
                }
            >
                <item.icon className="h-5 w-5" />
                {item.label}
            </NavLink>
        ))}
    </nav>
</aside>
        );
};

export default AdminSidebar;