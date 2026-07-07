import { NavLink, useNavigate } from "react-router-dom";
import {
    LayoutDashboard,
    Users,
    Wrench,
    ClipboardList,
    User2,
    UserCircle,
    LogOut
} from "lucide-react";
import { logoutUsuario } from "../../services/auth/auth-logout.service";

const navItems = [
    { to: "/admin", icon: LayoutDashboard, label: "Dashboard", end: true },
    { to: "/admin/clientes", icon: Users, label: "Clientes" },
    { to: "/admin/tecnicos", icon: Wrench, label: "Técnicos" },
    { to: "/admin/chamados", icon: ClipboardList, label: "Chamados" },
    { to: "/admin/usuarios", icon: User2, label: "Usuários" },
    { to: "/admin/perfil", icon: UserCircle, label: "Perfil" },
];

const AdminSidebar = ({ fecharMenu }: { fecharMenu?: () => void }) => {
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await logoutUsuario();
            navigate("/admin/login");
        } catch (error) {
            console.error("Falha ao encerrar a sessão:", error);
        }
    };

    return (
        <aside className="flex h-screen w-64 flex-col border-r border-border bg-card text-foreground shadow-xl lg:shadow-none">
            
            <div className="flex h-16 shrink-0 items-center gap-3 border-b border-border px-6">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
                    <Wrench className="h-5 w-5 text-primary-foreground" />
                </div>
                <div>
                    <h1 className="text-sm font-bold text-foreground">Teccorp</h1>
                    <p className="text-xs text-muted-foreground/70">Campo & Tecnologia</p>
                </div>
            </div>
            
            <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
                {navItems.map((item) => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        end={item.end}
                        onClick={fecharMenu}
                        className={({ isActive }) =>
                            `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                                isActive 
                                ? "bg-secondary text-secondary-foreground" 
                                : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                            }`
                        }
                    >
                        <item.icon className="h-5 w-5" />
                        {item.label}
                    </NavLink>
                ))}
            </nav>

            <div className="border-t border-border p-4 mt-auto">
                <button 
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
                >
                    <LogOut className="h-5 w-5" />
                    Sair
                </button>
            </div>
        </aside>
    );
};

export default AdminSidebar;