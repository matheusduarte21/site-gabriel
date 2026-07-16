import { ReactNode } from "react";

interface StaffHeaderProps {
    title: string;
    subtitle?: string;
    action?: ReactNode;
}

const StaffHeader = ({
    title,
    subtitle,
    action,
}: StaffHeaderProps) => {
    return (
        <header className="mb-6 rounded-xl border border-border bg-card p-5 shadow-sm sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                    <h1 className="break-words text-xl font-bold text-foreground sm:text-2xl">
                        {title}
                    </h1>

                    {subtitle && (
                        <p className="mt-1 max-w-3xl text-sm leading-5 text-muted-foreground">
                            {subtitle}
                        </p>
                    )}
                </div>

                {action && (
                    <div className="flex w-full shrink-0 items-center sm:w-auto">
                        {action}
                    </div>
                )}
            </div>
        </header>
    );
};

export default StaffHeader;