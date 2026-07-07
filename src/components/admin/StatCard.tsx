import { LucideIcon } from "lucide-react";

interface StatCardProps {
    title: string;
    value: string;
    subtitle: string;
    icon: LucideIcon;
    variant?: "warning" | "info" | "success" | "primary";
}

const variantStyles = {
    warning: "border-warning/30 bg-warning/5",
    info: "border-info/30 bg-info/5",
    success: "border-success/30 bg-success/5",
    primary: "border-primary/30 bg-primary/5",
};

const iconStyles = {
    warning: "bg-warning/10 text-warning",
    info: "bg-info/10 text-info",
    success: "bg-success/10 text-success",
    primary: "bg-primary/10 text-primary",
};

const valueStyles = {
    warning: "text-warning",
    info: "text-info",
    success: "text-success",
    primary: "text-primary",
};

const StatCard = ({ title, value, subtitle, icon: Icon, variant = "primary" }: StatCardProps) => {
    const cardBase = "rounded-xl border-2 p-5 transition-shadow hover:shadow-md";
    const iconContainerBase = "flex h-10 w-10 items-center justify-center rounded-lg";
    const valueBase = "mt-3 text-2xl font-bold";

    return (
        <div className={`${cardBase} ${variantStyles[variant]}`}>
        <div className="flex items-center gap-3">
            <div className={`${iconContainerBase} ${iconStyles[variant]}`}>
            <Icon className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-medium text-foreground">{title}</h3>
        </div>
        
        <p className={`${valueBase} ${valueStyles[variant]}`}>
            {value}
        </p>
        
        <p className="mt-1 text-xs text-muted-foreground">
            {subtitle}
        </p>
        </div>
    );
};

export default StatCard;