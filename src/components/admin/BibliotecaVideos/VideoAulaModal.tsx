import {
    useEffect,
    useMemo,
    useState,
} from "react";
import type { FormEvent } from "react";
import {
    Loader2,
    PlayCircle,
    X,
    Youtube,
} from "lucide-react";
import { CategoriaVideo, VideoAula, VideoAulaPayload } from "../../../types/biblioteca-video.type";
import { criarThumbnailYoutube, obterDadosYoutube, validarUrlYoutube } from "../Utils/youtube";

interface VideoAulaModalProps {
    video?: VideoAula | null;
    categorias: CategoriaVideo[];
    salvando: boolean;
    onClose: () => void;
    onSubmit: (
        payload: VideoAulaPayload
    ) => Promise<void>;
}

const VideoAulaModal = ({
    video,
    categorias,
    salvando,
    onClose,
    onSubmit,
}: VideoAulaModalProps) => {
    const [titulo, setTitulo] =
        useState("");

    const [descricao, setDescricao] =
        useState("");

    const [
        categoriaId,
        setCategoriaId,
    ] = useState("");

    const [
        youtubeUrl,
        setYoutubeUrl,
    ] = useState("");

    const [erro, setErro] =
        useState("");

    useEffect(() => {
        setTitulo(video?.titulo || "");
        setDescricao(
            video?.descricao || ""
        );
        setCategoriaId(
            video?.categoria_id ||
                categorias[0]?.id ||
                ""
        );
        setYoutubeUrl(
            video?.youtube_url || ""
        );
        setErro("");
    }, [video, categorias]);

    const dadosYoutube = useMemo(
        () =>
            obterDadosYoutube(
                youtubeUrl
            ),
        [youtubeUrl]
    );

    const handleSubmit = async (
        event: FormEvent
    ) => {
        event.preventDefault();

        if (titulo.trim().length < 3) {
            setErro(
                "Informe um título válido."
            );

            return;
        }

        if (
            descricao.trim().length < 3
        ) {
            setErro(
                "Informe uma descrição para o vídeo."
            );

            return;
        }

        if (!categoriaId) {
            setErro(
                "Selecione uma categoria."
            );

            return;
        }

        if (
            !validarUrlYoutube(
                youtubeUrl
            )
        ) {
            setErro(
                "Informe um link válido do YouTube."
            );

            return;
        }

        setErro("");

        await onSubmit({
            titulo: titulo.trim(),
            descricao:
                descricao.trim(),
            categoria_id:
                categoriaId,
            youtube_url:
                youtubeUrl.trim(),
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
            <div className="flex max-h-[95vh] w-full flex-col overflow-hidden rounded-t-2xl border border-border bg-card shadow-2xl sm:max-w-2xl sm:rounded-2xl">
                <div className="flex items-start justify-between gap-4 border-b border-border p-5 sm:p-6">
                    <div className="flex items-start gap-3">
                        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-300">
                            <Youtube className="h-5 w-5" />
                        </span>

                        <div>
                            <h2 className="text-lg font-bold text-foreground">
                                {video
                                    ? "Editar vídeo"
                                    : "Novo vídeo"}
                            </h2>

                            <p className="mt-1 text-sm text-muted-foreground">
                                Cadastre um treinamento para os técnicos.
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
                    className="overflow-y-auto p-5 sm:p-6"
                >
                    <div className="space-y-5">
                        {erro && (
                            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                                {erro}
                            </div>
                        )}

                        {categorias.length ===
                            0 && (
                            <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-700">
                                Crie uma categoria antes de cadastrar um vídeo.
                            </div>
                        )}

                        <div className="space-y-1.5">
                            <label
                                htmlFor="video-titulo"
                                className="text-sm font-semibold text-foreground"
                            >
                                Título
                            </label>

                            <input
                                id="video-titulo"
                                type="text"
                                value={titulo}
                                onChange={(
                                    event
                                ) =>
                                    setTitulo(
                                        event
                                            .target
                                            .value
                                    )
                                }
                                required
                                maxLength={180}
                                placeholder="Exemplo: Como crimpar um cabo de rede"
                                className="h-11 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label
                                htmlFor="video-categoria"
                                className="text-sm font-semibold text-foreground"
                            >
                                Categoria
                            </label>

                            <select
                                id="video-categoria"
                                value={
                                    categoriaId
                                }
                                onChange={(
                                    event
                                ) =>
                                    setCategoriaId(
                                        event
                                            .target
                                            .value
                                    )
                                }
                                required
                                className="h-11 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                            >
                                <option value="">
                                    Selecione uma categoria
                                </option>

                                {categorias.map(
                                    (
                                        categoria
                                    ) => (
                                        <option
                                            key={
                                                categoria.id
                                            }
                                            value={
                                                categoria.id
                                            }
                                        >
                                            {
                                                categoria.nome
                                            }
                                        </option>
                                    )
                                )}
                            </select>
                        </div>

                        <div className="space-y-1.5">
                            <label
                                htmlFor="video-link"
                                className="text-sm font-semibold text-foreground"
                            >
                                Link do YouTube
                            </label>

                            <input
                                id="video-link"
                                type="url"
                                value={
                                    youtubeUrl
                                }
                                onChange={(
                                    event
                                ) =>
                                    setYoutubeUrl(
                                        event
                                            .target
                                            .value
                                    )
                                }
                                required
                                placeholder="https://www.youtube.com/watch?v=..."
                                className="h-11 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                            />
                        </div>

                        {dadosYoutube.videoId && (
                            <div className="overflow-hidden rounded-xl border border-border bg-slate-950">
                                <div className="relative aspect-video">
                                    <img
                                        src={criarThumbnailYoutube(
                                            dadosYoutube.videoId
                                        )}
                                        alt="Prévia do vídeo"
                                        className="h-full w-full object-cover"
                                    />

                                    <span className="absolute inset-0 bg-black/20" />

                                    <span className="absolute left-1/2 top-1/2 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-red-600 text-white shadow-xl">
                                        <PlayCircle className="h-7 w-7" />
                                    </span>
                                </div>
                            </div>
                        )}

                        <div className="space-y-1.5">
                            <label
                                htmlFor="video-descricao"
                                className="text-sm font-semibold text-foreground"
                            >
                                Descrição
                            </label>

                            <textarea
                                id="video-descricao"
                                value={descricao}
                                onChange={(
                                    event
                                ) =>
                                    setDescricao(
                                        event
                                            .target
                                            .value
                                    )
                                }
                                required
                                rows={5}
                                placeholder="Explique o conteúdo apresentado no treinamento."
                                className="w-full resize-none rounded-lg border border-border bg-background p-3 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                            />
                        </div>
                    </div>

                    <div className="mt-6 grid grid-cols-2 gap-3">
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
                            disabled={
                                salvando ||
                                categorias.length ===
                                    0
                            }
                            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-bold text-primary-foreground hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {salvando && (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            )}

                            {salvando
                                ? "Salvando..."
                                : "Salvar vídeo"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default VideoAulaModal;