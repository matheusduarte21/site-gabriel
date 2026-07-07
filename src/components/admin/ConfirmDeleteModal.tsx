import { AlertTriangle, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../ui/dialog";
import { Button } from "../ui/Button";

interface ConfirmDeleteModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    loading?: boolean;
}

export const ConfirmDeleteModal = ({ isOpen, onClose, onConfirm, loading = false }: ConfirmDeleteModalProps) => {
    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && !loading && onClose()}>
        <DialogContent className="max-w-md rounded-none">
            <DialogHeader className="flex flex-col items-center text-center sm:text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <DialogTitle className="text-xl">Excluir registro?</DialogTitle>
            <DialogDescription className="text-center pt-2">
                Tem certeza que deseja excluir este registro? Esta ação não pode ser desfeita e os dados serão removidos permanentemente.
            </DialogDescription>
            </DialogHeader>

            <div className="flex flex-col-reverse sm:flex-row justify-center gap-3 mt-6">
            <Button variant="outline" onClick={onClose} disabled={loading} className="w-full sm:w-auto">
                Cancelar
            </Button>
            <Button 
                onClick={onConfirm} 
                disabled={loading}
                className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white border-transparent"
            >
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                {loading ? "Excluindo..." : "Sim, excluir"}
            </Button>
            </div>
        </DialogContent>
        </Dialog>
    );
};