import { Bell, User } from "lucide-react";

type AdminHeaderProps =  {
    title: string;
    subtitle?: string;
}

const AdminHeader = ({ title, subtitle }: AdminHeaderProps) => {
    return (
        <header className="rounded-xl p-6 text-primary-foreground" style={{ background: "var(--gradient-header)" }}>
        <div className="flex items-center justify-between">
            <div>
                <h1 className="text-2xl font-bold">{title}</h1>
                {subtitle && <p className="mt-1 text-sm opacity-80">{subtitle}</p>}
            </div>
            <div className="flex items-center gap-3">
                <button className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-foreground/20 transition-colors hover:bg-primary-foreground/30">
                    <Bell className="h-5 w-5" />
                </button>
                <div className="flex items-center gap-2 rounded-full bg-primary-foreground/20 px-3 py-2">
                    <User className="h-5 w-5" />
                    <span className="text-sm font-medium">Admin</span>
                </div>
            </div>
        </div>
        </header>
    );
};

export default AdminHeader;