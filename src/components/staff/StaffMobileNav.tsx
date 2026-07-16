import { NavLink } from "react-router-dom";
import {
    ClipboardList,
    LayoutDashboard,
    UserCircle,
    Wallet,
} from "lucide-react";

const navItems = [
    {
        to: "/staff/dashboard",
        icon: LayoutDashboard,
        label: "Início",
    },
    {
        to: "/staff/chamados",
        icon: ClipboardList,
        label: "Chamados",
    },
    {
        to: "/staff/adiantamentos",
        icon: Wallet,
        label: "Adiantamentos",
    },
    {
        to: "/staff/perfil",
        icon: UserCircle,
        label: "Perfil",
    },
];

const StaffMobileNav = () => {
    return (
        <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-card/95 px-2 pb-[env(safe-area-inset-bottom)] shadow-[0_-8px_30px_rgba(0,0,0,0.08)] backdrop-blur lg:hidden">
            <div className="grid h-16 grid-cols-4">
                {navItems.map((item) => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        className={({ isActive }) =>
                            `flex flex-col items-center justify-center gap-1 rounded-lg text-[10px] font-semibold transition-colors ${
                                isActive
                                    ? "text-primary"
                                    : "text-muted-foreground"
                            }`
                        }
                    >
                        {({ isActive }) => (
                            <>
                                <span
                                    className={`flex h-8 w-10 items-center justify-center rounded-xl transition-colors ${
                                        isActive
                                            ? "bg-primary/10 text-primary"
                                            : ""
                                    }`}
                                >
                                    <item.icon className="h-5 w-5" />
                                </span>

                                <span>
                                    {item.label}
                                </span>
                            </>
                        )}
                    </NavLink>
                ))}
            </div>
        </nav>
    );
};

export default StaffMobileNav;