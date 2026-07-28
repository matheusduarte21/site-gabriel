import {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";
import {
    AlertCircle,
    BookOpen,
    ChevronLeft,
    ChevronRight,
    GraduationCap,
    Loader2,
    Play,
    PlayCircle,
    RefreshCw,
    Search,
    Video,
    X,
} from "lucide-react";
import LiteYouTubeEmbed from "react-lite-youtube-embed";
import "react-lite-youtube-embed/dist/LiteYouTubeEmbed.css";
import StaffHeader from "./staffHeader";
import {
    CategoriaVideo,
    VideoAula,
} from "../../types/biblioteca-video.type";
import { getTodosVideosAulas } from "../../services/VideosAulas/get-all-videos-aulas.service";
import { getTodasCategoriasVideos } from "../../services/CategoriasVideos/get-all-categorias-videos.service";
import { criarThumbnailYoutube, obterDadosYoutube } from "../admin/Utils/youtube";

const ITENS_POR_PAGINA = 6;

const criarPaginasVisiveis = (
    paginaAtual: number,
    totalPaginas: number
): number[] => {
    const limite = 5;

    if (totalPaginas <= limite) {
        return Array.from(
            {
                length: totalPaginas,
            },
            (_, index) => index + 1
        );
    }

    let inicio = Math.max(
        1,
        paginaAtual - 2
    );

    let fim = Math.min(
        totalPaginas,
        inicio + limite - 1
    );

    inicio = Math.max(
        1,
        fim - limite + 1
    );

    return Array.from(
        {
            length: fim - inicio + 1,
        },
        (_, index) => inicio + index
    );
};

const StaffVideos = () => {
    const [videos, setVideos] =
        useState<VideoAula[]>([]);

    const [categorias, setCategorias] =
        useState<CategoriaVideo[]>([]);

    const [loading, setLoading] =
        useState(true);

    const [erro, setErro] =
        useState<string | null>(null);

    const [busca, setBusca] =
        useState("");

    const [categoriaId, setCategoriaId] =
        useState("todas");

    const [
        paginaAtual,
        setPaginaAtual,
    ] = useState(1);

    const [
        videoSelecionado,
        setVideoSelecionado,
    ] = useState<VideoAula | null>(
        null
    );

    const carregarDados =
        useCallback(async () => {
            try {
                setLoading(true);
                setErro(null);

                const [
                    videosDb,
                    categoriasDb,
                ] = await Promise.all([
                    getTodosVideosAulas(),
                    getTodasCategoriasVideos(),
                ]);

                setVideos(videosDb);
                setCategorias(categoriasDb);
            } catch (error) {
                const mensagem =
                    error instanceof Error
                        ? error.message
                        : "Não foi possível carregar os vídeos.";

                setErro(mensagem);
            } finally {
                setLoading(false);
            }
        }, []);

    useEffect(() => {
        void carregarDados();
    }, [carregarDados]);

    useEffect(() => {
        setPaginaAtual(1);
    }, [busca, categoriaId]);

    const videosFiltrados =
        useMemo(() => {
            const termo = busca
                .trim()
                .toLocaleLowerCase(
                    "pt-BR"
                );

            return videos.filter(
                (video) => {
                    const correspondeCategoria =
                        categoriaId ===
                            "todas" ||
                        video.categoria_id ===
                            categoriaId;

                    const titulo =
                        video.titulo.toLocaleLowerCase(
                            "pt-BR"
                        );

                    const descricao =
                        video.descricao.toLocaleLowerCase(
                            "pt-BR"
                        );

                    const categoria =
                        video.categoria?.nome
                            ?.toLocaleLowerCase(
                                "pt-BR"
                            ) || "";

                    const correspondeBusca =
                        !termo ||
                        titulo.includes(
                            termo
                        ) ||
                        descricao.includes(
                            termo
                        ) ||
                        categoria.includes(
                            termo
                        );

                    return (
                        correspondeCategoria &&
                        correspondeBusca
                    );
                }
            );
        }, [
            videos,
            busca,
            categoriaId,
        ]);

    const totalPaginas = Math.max(
        1,
        Math.ceil(
            videosFiltrados.length /
                ITENS_POR_PAGINA
        )
    );

    useEffect(() => {
        if (
            paginaAtual > totalPaginas
        ) {
            setPaginaAtual(
                totalPaginas
            );
        }
    }, [
        paginaAtual,
        totalPaginas,
    ]);

    useEffect(() => {
        if (!videoSelecionado) {
            return;
        }

        const overflowAnterior =
            document.body.style.overflow;

        const fecharComEscape = (
            event: KeyboardEvent
        ) => {
            if (event.key === "Escape") {
                setVideoSelecionado(
                    null
                );
            }
        };

        document.body.style.overflow =
            "hidden";

        window.addEventListener(
            "keydown",
            fecharComEscape
        );

        return () => {
            document.body.style.overflow =
                overflowAnterior;

            window.removeEventListener(
                "keydown",
                fecharComEscape
            );
        };
    }, [videoSelecionado]);

    const videosPaginados =
        useMemo(() => {
            const inicio =
                (paginaAtual - 1) *
                ITENS_POR_PAGINA;

            return videosFiltrados.slice(
                inicio,
                inicio +
                    ITENS_POR_PAGINA
            );
        }, [
            videosFiltrados,
            paginaAtual,
        ]);

    const paginasVisiveis =
        criarPaginasVisiveis(
            paginaAtual,
            totalPaginas
        );

    const inicioRegistro =
        videosFiltrados.length === 0
            ? 0
            : (paginaAtual - 1) *
                  ITENS_POR_PAGINA +
              1;

    const fimRegistro = Math.min(
        paginaAtual *
            ITENS_POR_PAGINA,
        videosFiltrados.length
    );

    const handleAlterarPagina = (
        pagina: number
    ) => {
        if (
            pagina < 1 ||
            pagina > totalPaginas
        ) {
            return;
        }

        setPaginaAtual(pagina);

        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };

    const abrirVideo = (
        video: VideoAula
    ) => {
        const dadosYoutube =
            obterDadosYoutube(
                video.youtube_url
            );

        if (!dadosYoutube.videoId) {
            return;
        }

        setVideoSelecionado(video);
    };

    const fecharVideo = () => {
        setVideoSelecionado(null);
    };

    const dadosVideoSelecionado =
        videoSelecionado
            ? obterDadosYoutube(
                  videoSelecionado.youtube_url
              )
            : null;

    return (
        <div>
            <StaffHeader
                title="Vídeos e aulas"
                subtitle="Consulte treinamentos rápidos para utilizar durante os atendimentos."
                action={
                    <div className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 text-sm font-bold text-blue-700 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-300 sm:w-auto">
                        <PlayCircle className="h-4 w-4" />

                        {videos.length}{" "}
                        {videos.length === 1
                            ? "treinamento"
                            : "treinamentos"}
                    </div>
                }
            />

            <section className="mb-6 rounded-xl border border-border bg-card p-4 shadow-sm">
                <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_240px]">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />

                        <input
                            type="search"
                            value={busca}
                            onChange={(event) =>
                                setBusca(
                                    event.target
                                        .value
                                )
                            }
                            placeholder="Buscar treinamento"
                            className="h-11 w-full rounded-lg border border-border bg-background pl-10 pr-4 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/10"
                        />
                    </div>

                    <select
                        value={categoriaId}
                        onChange={(event) =>
                            setCategoriaId(
                                event.target
                                    .value
                            )
                        }
                        className="h-11 rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/10"
                    >
                        <option value="todas">
                            Todas as categorias
                        </option>

                        {categorias.map(
                            (categoria) => (
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
            </section>

            {erro && (
                <div className="mb-6 flex flex-col gap-4 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-start gap-3">
                        <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />

                        <p className="text-sm">
                            {erro}
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() =>
                            void carregarDados()
                        }
                        className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-red-200 bg-white px-4 text-sm font-bold text-red-700 transition-colors hover:bg-red-100"
                    >
                        <RefreshCw className="h-4 w-4" />
                        Tentar novamente
                    </button>
                </div>
            )}

            {loading ? (
                <div className="flex min-h-[300px] items-center justify-center rounded-xl border border-border bg-card">
                    <div className="flex flex-col items-center gap-3">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />

                        <p className="text-sm text-muted-foreground">
                            Carregando treinamentos...
                        </p>
                    </div>
                </div>
            ) : videosFiltrados.length ===
              0 ? (
                <div className="rounded-xl border border-border bg-card p-10 text-center shadow-sm">
                    <BookOpen className="mx-auto h-10 w-10 text-muted-foreground/50" />

                    <h3 className="mt-4 font-bold text-foreground">
                        Nenhum vídeo encontrado
                    </h3>

                    <p className="mt-1 text-sm text-muted-foreground">
                        Não existem treinamentos para
                        os filtros selecionados.
                    </p>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 2xl:grid-cols-3">
                        {videosPaginados.map(
                            (video) => {
                                const dadosYoutube =
                                    obterDadosYoutube(
                                        video.youtube_url
                                    );

                                const videoValido =
                                    Boolean(
                                        dadosYoutube.videoId
                                    );

                                return (
                                    <article
                                        key={
                                            video.id
                                        }
                                        className="flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
                                    >
                                        <button
                                            type="button"
                                            onClick={() =>
                                                abrirVideo(
                                                    video
                                                )
                                            }
                                            disabled={
                                                !videoValido
                                            }
                                            aria-label={`Assistir ${video.titulo}`}
                                            className="group relative block aspect-video w-full overflow-hidden bg-slate-950 disabled:cursor-not-allowed"
                                        >
                                            {dadosYoutube.videoId ? (
                                                <img
                                                    src={criarThumbnailYoutube(
                                                        dadosYoutube.videoId
                                                    )}
                                                    alt={`Capa do vídeo ${video.titulo}`}
                                                    loading="lazy"
                                                    decoding="async"
                                                    className="h-full w-full object-cover transition duration-300 group-hover:scale-105 group-hover:opacity-80"
                                                />
                                            ) : (
                                                <div className="flex h-full w-full items-center justify-center bg-slate-900 p-5 text-center text-slate-300">
                                                    <div>
                                                        <AlertCircle className="mx-auto h-8 w-8 text-red-400" />

                                                        <p className="mt-3 text-sm font-bold">
                                                            Vídeo indisponível
                                                        </p>
                                                    </div>
                                                </div>
                                            )}

                                            {videoValido && (
                                                <>
                                                    <span className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/5 to-black/10" />

                                                    <span className="absolute left-1/2 top-1/2 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-red-600 text-white shadow-xl transition-transform duration-200 group-hover:scale-110 sm:h-16 sm:w-16">
                                                        <Play className="ml-1 h-6 w-6 fill-current sm:h-7 sm:w-7" />
                                                    </span>

                                                    <span className="absolute bottom-3 left-3 rounded-md bg-black/75 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
                                                        Assistir no sistema
                                                    </span>
                                                </>
                                            )}
                                        </button>

                                        <div className="flex flex-1 flex-col p-4 sm:p-5">
                                            <div className="flex flex-wrap items-center justify-between gap-2">
                                                <span className="rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-blue-700 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-300">
                                                    {video
                                                        .categoria
                                                        ?.nome ||
                                                        "Sem categoria"}
                                                </span>

                                                <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                                    <Video className="h-3.5 w-3.5" />
                                                    Aula técnica
                                                </span>
                                            </div>

                                            <h3 className="mt-4 text-lg font-bold leading-6 text-foreground">
                                                {
                                                    video.titulo
                                                }
                                            </h3>

                                            <p className="mt-2 flex-1 text-sm leading-6 text-muted-foreground">
                                                {
                                                    video.descricao
                                                }
                                            </p>

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    abrirVideo(
                                                        video
                                                    )
                                                }
                                                disabled={
                                                    !videoValido
                                                }
                                                className="mt-5 inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground"
                                            >
                                                {videoValido ? (
                                                    <>
                                                        <Play className="h-4 w-4 fill-current" />
                                                        Assistir aula
                                                    </>
                                                ) : (
                                                    <>
                                                        <AlertCircle className="h-4 w-4" />
                                                        Vídeo indisponível
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </article>
                                );
                            }
                        )}
                    </div>

                    {videosFiltrados.length >
                        ITENS_POR_PAGINA && (
                        <div className="mt-6 flex flex-col gap-4 rounded-xl border border-border bg-card p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
                            <p className="text-center text-xs text-muted-foreground sm:text-left sm:text-sm">
                                Mostrando{" "}
                                <span className="font-bold text-foreground">
                                    {
                                        inicioRegistro
                                    }
                                </span>{" "}
                                até{" "}
                                <span className="font-bold text-foreground">
                                    {
                                        fimRegistro
                                    }
                                </span>{" "}
                                de{" "}
                                <span className="font-bold text-foreground">
                                    {
                                        videosFiltrados.length
                                    }
                                </span>{" "}
                                vídeos
                            </p>

                            <div className="flex items-center justify-center gap-1">
                                <button
                                    type="button"
                                    onClick={() =>
                                        handleAlterarPagina(
                                            paginaAtual -
                                                1
                                        )
                                    }
                                    disabled={
                                        paginaAtual ===
                                        1
                                    }
                                    aria-label="Página anterior"
                                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </button>

                                {paginasVisiveis.map(
                                    (
                                        pagina
                                    ) => (
                                        <button
                                            key={
                                                pagina
                                            }
                                            type="button"
                                            onClick={() =>
                                                handleAlterarPagina(
                                                    pagina
                                                )
                                            }
                                            aria-current={
                                                pagina ===
                                                paginaAtual
                                                    ? "page"
                                                    : undefined
                                            }
                                            className={`flex h-9 min-w-9 items-center justify-center rounded-lg px-2 text-xs font-bold transition-colors ${
                                                pagina ===
                                                paginaAtual
                                                    ? "bg-primary text-primary-foreground shadow-sm"
                                                    : "border border-border bg-background text-muted-foreground hover:bg-secondary hover:text-foreground"
                                            }`}
                                        >
                                            {
                                                pagina
                                            }
                                        </button>
                                    )
                                )}

                                <button
                                    type="button"
                                    onClick={() =>
                                        handleAlterarPagina(
                                            paginaAtual +
                                                1
                                        )
                                    }
                                    disabled={
                                        paginaAtual ===
                                        totalPaginas
                                    }
                                    aria-label="Próxima página"
                                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    )}
                </>
            )}

            {videoSelecionado &&
                dadosVideoSelecionado
                    ?.videoId && (
                    <div
                        className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm sm:flex sm:items-center sm:justify-center sm:p-5"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="titulo-video-aula"
                        onMouseDown={(
                            event
                        ) => {
                            if (
                                event.target ===
                                event.currentTarget
                            ) {
                                fecharVideo();
                            }
                        }}
                    >
                        <div className="flex h-[100dvh] w-full flex-col overflow-hidden bg-card sm:h-auto sm:max-h-[92vh] sm:max-w-5xl sm:rounded-2xl sm:border sm:border-border sm:shadow-2xl">
                            <div className="flex shrink-0 items-start justify-between gap-4 border-b border-border px-4 pb-4 pt-[calc(env(safe-area-inset-top)+1rem)] sm:p-5">
                                <div className="min-w-0">
                                    <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-primary">
                                        {videoSelecionado
                                            .categoria
                                            ?.nome ||
                                            "Treinamento"}
                                    </p>

                                    <h3
                                        id="titulo-video-aula"
                                        className="mt-1 line-clamp-2 text-lg font-bold leading-6 text-foreground sm:text-xl"
                                    >
                                        {
                                            videoSelecionado.titulo
                                        }
                                    </h3>
                                </div>

                                <button
                                    type="button"
                                    onClick={
                                        fecharVideo
                                    }
                                    aria-label="Fechar vídeo"
                                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border bg-background text-muted-foreground shadow-sm transition-colors hover:bg-secondary hover:text-foreground"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            <div className="shrink-0 bg-black">
                                <div className="aspect-video w-full overflow-hidden">
                                    <LiteYouTubeEmbed
                                        id={
                                            dadosVideoSelecionado.videoId
                                        }
                                        title={
                                            videoSelecionado.titulo
                                        }
                                        autoplay
                                        lazyLoad
                                        poster="hqdefault"
                                        cookie={
                                            false
                                        }
                                        hideButtonOnActivate
                                        focusOnLoad
                                        params={{
                                            start: String(
                                                dadosVideoSelecionado.inicio
                                            ),
                                            rel: "0",
                                            playsinline:
                                                "1",
                                            modestbranding:
                                                "1",
                                        }}
                                        referrerPolicy="strict-origin-when-cross-origin"
                                        wrapperClass="yt-lite h-full w-full"
                                        iframeClass="h-full w-full"
                                    />
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto p-4 sm:p-5">
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className="rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-blue-700 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-300">
                                        {videoSelecionado
                                            .categoria
                                            ?.nome ||
                                            "Sem categoria"}
                                    </span>

                                    <span className="flex items-center gap-1.5 rounded-full border border-border bg-background px-2.5 py-1 text-xs text-muted-foreground">
                                        <GraduationCap className="h-3.5 w-3.5" />
                                        Aula técnica
                                    </span>
                                </div>

                                <h4 className="mt-4 text-base font-bold text-foreground">
                                    Sobre esta aula
                                </h4>

                                <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
                                    {
                                        videoSelecionado.descricao
                                    }
                                </p>
                            </div>

                            <div className="shrink-0 border-t border-border bg-card px-4 pb-[calc(env(safe-area-inset-bottom)+1rem)] pt-4 sm:p-5">
                                <button
                                    type="button"
                                    onClick={
                                        fecharVideo
                                    }
                                    className="h-11 w-full rounded-lg border border-border bg-background px-4 text-sm font-bold text-foreground transition-colors hover:bg-secondary sm:ml-auto sm:block sm:w-auto sm:min-w-32"
                                >
                                    Fechar aula
                                </button>
                            </div>
                        </div>
                    </div>
                )}
        </div>
    );
};

export default StaffVideos;