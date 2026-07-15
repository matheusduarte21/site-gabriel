type AdminHeaderProps = {
    title: string;
    subtitle?: string;
}

const AdminHeader = ({ title, subtitle }: AdminHeaderProps) => {
    return (
        <header className="mb-6 rounded-xl bg-card p-6 shadow-sm border border-border">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">{title}</h1>
                    {subtitle && (
                        <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
                    )}
                </div>
            </div>
        </header>
    );
};

export default AdminHeader;