import {
    AlertTriangle,
    Loader2,
    Trash2,
} from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "../ui/dialog";
import { Button } from "../ui/Button";

interface ConfirmDeleteModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void | Promise<void>;
    loading?: boolean;
}

export const ConfirmDeleteModal = ({
    isOpen,
    onClose,
    onConfirm,
    loading = false,
}: ConfirmDeleteModalProps) => {
    const handleConfirm = () => {
        if (loading) {
            return;
        }

        void onConfirm();
    };

    return (
        <Dialog
            open={isOpen}
            onOpenChange={(open) => {
                if (!open && !loading) {
                    onClose();
                }
            }}
        >
            <DialogContent
                className="max-w-md overflow-hidden rounded-xl border border-border bg-card p-0 shadow-2xl"
                aria-busy={loading}
            >
                <div className="border-b border-red-200 bg-red-50 px-6 py-5">
                    <DialogHeader className="space-y-0 text-left sm:text-left">
                        <div className="flex items-start gap-4">
                            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-red-200 bg-red-100 text-red-600">
                                <AlertTriangle className="h-5 w-5" />
                            </span>

                            <div className="min-w-0">
                                <DialogTitle className="text-lg font-bold text-foreground">
                                    Excluir registro?
                                </DialogTitle>

                                <DialogDescription className="mt-1.5 text-sm leading-6 text-muted-foreground">
                                    Confirme a exclusão permanente deste
                                    registro.
                                </DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>
                </div>

                <div className="space-y-5 px-6 py-5">
                    <div className="rounded-lg border border-red-200 bg-red-50/60 p-4">
                        <div className="flex items-start gap-3">
                            <Trash2 className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />

                            <div>
                                <p className="text-sm font-semibold text-red-700">
                                    Esta ação não pode ser desfeita
                                </p>

                                <p className="mt-1 text-sm leading-6 text-red-700/80">
                                    Os dados serão removidos permanentemente
                                    do sistema e não poderão ser recuperados.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col-reverse gap-3 border-t border-border pt-5 sm:flex-row sm:justify-end">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            disabled={loading}
                            className="sm:min-w-[110px]"
                        >
                            Cancelar
                        </Button>

                        <Button
                            type="button"
                            onClick={handleConfirm}
                            disabled={loading}
                            className="gap-2 border-transparent bg-red-600 text-white shadow-sm hover:bg-red-700 sm:min-w-[150px]"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Excluindo...
                                </>
                            ) : (
                                <>
                                    <Trash2 className="h-4 w-4" />
                                    Sim, excluir
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};