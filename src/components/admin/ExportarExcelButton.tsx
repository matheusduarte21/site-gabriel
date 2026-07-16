import { useState } from "react";
import {
    FileSpreadsheet,
    Loader2,
} from "lucide-react";
import { Button } from "../ui/Button";

interface ExportarExcelButtonProps {
    onExport: () => Promise<void>;
    disabled?: boolean;
    label?: string;
    className?: string;
}

const ExportarExcelButton = ({
    onExport,
    disabled = false,
    label = "Exportar Excel",
    className = "",
}: ExportarExcelButtonProps) => {
    const [exportando, setExportando] =
        useState(false);

    const handleExportar = async () => {
        if (exportando || disabled) {
            return;
        }

        try {
            setExportando(true);
            await onExport();
        } finally {
            setExportando(false);
        }
    };

    return (
        <Button
            type="button"
            variant="outline"
            onClick={handleExportar}
            disabled={disabled || exportando}
            className={`gap-2 border-emerald-200 bg-emerald-50 text-emerald-700 shadow-sm hover:bg-emerald-100 hover:text-emerald-800 ${className}`}
        >
            {exportando ? (
                <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
                <FileSpreadsheet className="h-4 w-4" />
            )}

            {exportando
                ? "Gerando planilha..."
                : label}
        </Button>
    );
};

export default ExportarExcelButton;