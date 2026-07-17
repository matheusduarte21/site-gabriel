import {
    useEffect,
    useState,
} from "react";
import type { FormEvent } from "react";
import {
    FolderPlus,
    Loader2,
    X,
} from "lucide-react";
import { CategoriaVideo, CategoriaVideoPayload } from "../../../types/biblioteca-video.type";

interface CategoriaVideoModalProps {
    categoria?: CategoriaVideo | null;
    salvando: boolean;
    onClose: () => void;
    onSubmit: (
        payload: CategoriaVideoPayload
    ) => Promise<void>;
}

const CategoriaVideoModal = ({
    categoria,
    salvando,
    onClose,
    onSubmit,
}: CategoriaVideoModalProps) => {
    const [nome, setNome] =
        useState("");

    const [descricao, setDescricao] =
        useState("");

    const [erro, setErro] =
        useState("");

    useEffect(() => {
        setNome(categoria?.nome || "");
        setDescricao(
            categoria?.descricao || ""
        );
        setErro("");
    }, [categoria]);

    const handleSubmit = async (
        event: FormEvent
    ) => {
        event.preventDefault();

        if (nome.trim().length < 2) {
            setErro(
                "Informe um nome válido para a categoria."
            );

            return;
        }

        setErro("");

        await onSubmit({
            nome: nome.trim(),
            descricao:
                descricao.trim() || null,
        });
    };

    return (
        <div
            className="fixed inset-0 z-[100] flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center sm:p-4"
            role="dialog"
            aria-modal="true"
            onMouseDown={(event) => {
                if (
                    event.target ===
                    event.currentTarget &&
                    !salvando
                ) {
                    onClose();
                }
            }}
        >
            <div className="w-full rounded-t-2xl border border-border bg-card p-5 shadow-2xl sm:max-w-lg sm:rounded-2xl sm:p-6">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">
                            <FolderPlus className="h-5 w-5" />
                        </span>

                        <div>
                            <h2 className="text-lg font-bold text-foreground">
                                {categoria
                                    ? "Editar categoria"
                                    : "Nova categoria"}
                            </h2>

                            <p className="mt-1 text-sm text-muted-foreground">
                                Organize os vídeos por assunto.
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        disabled={salvando}
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground disabled:opacity-50"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <form
                    onSubmit={handleSubmit}
                    className="mt-6 space-y-5"
                >
                    {erro && (
                        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                            {erro}
                        </div>
                    )}

                    <div className="space-y-1.5">
                        <label
                            htmlFor="categoria-nome"
                            className="text-sm font-semibold text-foreground"
                        >
                            Nome da categoria
                        </label>

                        <input
                            id="categoria-nome"
                            type="text"
                            value={nome}
                            onChange={(event) =>
                                setNome(
                                    event.target.value
                                )
                            }
                            required
                            maxLength={100}
                            placeholder="Exemplo: Redes"
                            className="h-11 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label
                            htmlFor="categoria-descricao"
                            className="text-sm font-semibold text-foreground"
                        >
                            Descrição
                        </label>

                        <textarea
                            id="categoria-descricao"
                            value={descricao}
                            onChange={(event) =>
                                setDescricao(
                                    event.target
                                        .value
                                )
                            }
                            rows={4}
                            placeholder="Descreva os tipos de vídeos desta categoria."
                            className="w-full resize-none rounded-lg border border-border bg-background p-3 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={salvando}
                            className="h-11 rounded-lg border border-border bg-background px-4 text-sm font-bold text-foreground hover:bg-secondary disabled:opacity-50"
                        >
                            Cancelar
                        </button>

                        <button
                            type="submit"
                            disabled={salvando}
                            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-bold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                        >
                            {salvando && (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            )}

                            {salvando
                                ? "Salvando..."
                                : "Salvar"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CategoriaVideoModal;