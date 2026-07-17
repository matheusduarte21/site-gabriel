import {
    Loader2,
    Trash2,
    X,
} from "lucide-react";

interface ConfirmarExclusaoBibliotecaModalProps {
    titulo: string;
    descricao: string;
    excluindo: boolean;
    onClose: () => void;
    onConfirm: () => Promise<void>;
}

const ConfirmarExclusaoBibliotecaModal = ({
    titulo,
    descricao,
    excluindo,
    onClose,
    onConfirm,
}: ConfirmarExclusaoBibliotecaModalProps) => {
    return (
        <div
            className="fixed inset-0 z-[120] flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center sm:p-4"
            role="dialog"
            aria-modal="true"
        >
            <div className="w-full rounded-t-2xl border border-border bg-card p-5 shadow-2xl sm:max-w-md sm:rounded-2xl sm:p-6">
                <div className="flex items-start justify-between gap-4">
                    <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-300">
                        <Trash2 className="h-5 w-5" />
                    </span>

                    <button
                        type="button"
                        onClick={onClose}
                        disabled={excluindo}
                        className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <h2 className="mt-5 text-lg font-bold text-foreground">
                    {titulo}
                </h2>

                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {descricao}
                </p>

                <div className="mt-6 grid grid-cols-2 gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={excluindo}
                        className="h-11 rounded-lg border border-border bg-background px-4 text-sm font-bold text-foreground hover:bg-secondary disabled:opacity-50"
                    >
                        Cancelar
                    </button>

                    <button
                        type="button"
                        onClick={() =>
                            void onConfirm()
                        }
                        disabled={excluindo}
                        className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-red-600 px-4 text-sm font-bold text-white hover:bg-red-700 disabled:opacity-50"
                    >
                        {excluindo && (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        )}

                        {excluindo
                            ? "Excluindo..."
                            : "Excluir"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmarExclusaoBibliotecaModal;