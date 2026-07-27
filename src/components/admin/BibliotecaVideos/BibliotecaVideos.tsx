import {
    useEffect,
    useMemo,
    useState,
} from "react";
import type { ReactNode } from "react";
import {
    BookOpen,
    ChevronLeft,
    ChevronRight,
    FolderOpen,
    Loader2,
    Pencil,
    Play,
    Plus,
    Search,
    Trash2,
    Video,
} from "lucide-react";
import CategoriaVideoModal from "./CategoriaVideoModal";
import VideoAulaModal from "./VideoAulaModal";
import VideoAulaPreviewModal from "./VideoAulaPreviewModal";
import ConfirmarExclusaoBibliotecaModal from "./ConfirmarExclusaoBibliotecaModal";
import { CategoriaVideo, CategoriaVideoPayload, VideoAula, VideoAulaPayload } from "../../../types/biblioteca-video.type";
import { getTodasCategoriasVideos } from "../../../services/CategoriasVideos/get-all-categorias-videos.service";
import { getTodosVideosAulas } from "../../../services/VideosAulas/get-all-videos-aulas.service";
import { deletarVideoAula } from "../../../services/VideosAulas/delete-video-aula.service";
import { showError, showSuccess } from "../../../lib/Utils/toast";
import { deletarCategoriaVideo } from "../../../services/CategoriasVideos/delete-categoria-video.service";
import AdminHeader from "../AdminHeader";
import { criarVideoAula } from "../../../services/VideosAulas/post-video-aula.service";
import { atualizarVideoAula } from "../../../services/VideosAulas/patch-video-aula.service";
import { criarCategoriaVideo } from "../../../services/CategoriasVideos/post-categoria-video.service";
import { atualizarCategoriaVideo } from "../../../services/CategoriasVideos/patch-categoria-video.service";
import { criarThumbnailYoutube, obterDadosYoutube } from "../Utils/youtube";

type AbaBiblioteca =
    | "videos"
    | "categorias";

interface CardResumoProps {
    titulo: string;
    valor: number;
    descricao: string;
    icon: ReactNode;
    className: string;
}

interface ExclusaoSelecionada {
    tipo: "video" | "categoria";
    id: string;
    nome: string;
}

const ITENS_POR_PAGINA = 6;

const CardResumo = ({
    titulo,
    valor,
    descricao,
    icon,
    className,
}: CardResumoProps) => {
    return (
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                        {titulo}
                    </p>

                    <p className="mt-2 text-2xl font-bold text-foreground">
                        {valor}
                    </p>

                    <p className="mt-1 text-xs text-muted-foreground">
                        {descricao}
                    </p>
                </div>

                <span
                    className={`flex h-11 w-11 items-center justify-center rounded-xl ${className}`}
                >
                    {icon}
                </span>
            </div>
        </div>
    );
};

const BibliotecaVideos = () => {
    const [aba, setAba] =
        useState<AbaBiblioteca>(
            "videos"
        );

    const [
        categorias,
        setCategorias,
    ] = useState<CategoriaVideo[]>([]);

    const [videos, setVideos] =
        useState<VideoAula[]>([]);

    const [loading, setLoading] =
        useState(true);

    const [erro, setErro] =
        useState<string | null>(null);

    const [buscaVideo, setBuscaVideo] =
        useState("");

    const [
        filtroCategoria,
        setFiltroCategoria,
    ] = useState("todas");

    const [
        buscaCategoria,
        setBuscaCategoria,
    ] = useState("");

    const [
        paginaVideos,
        setPaginaVideos,
    ] = useState(1);

    const [
        paginaCategorias,
        setPaginaCategorias,
    ] = useState(1);

    const [
        modalCategoriaAberto,
        setModalCategoriaAberto,
    ] = useState(false);

    const [
        categoriaEditando,
        setCategoriaEditando,
    ] =
        useState<CategoriaVideo | null>(
            null
        );

    const [
        modalVideoAberto,
        setModalVideoAberto,
    ] = useState(false);

    const [
        videoEditando,
        setVideoEditando,
    ] =
        useState<VideoAula | null>(
            null
        );

    const [
        videoPreview,
        setVideoPreview,
    ] =
        useState<VideoAula | null>(
            null
        );

    const [
        salvandoCategoria,
        setSalvandoCategoria,
    ] = useState(false);

    const [
        salvandoVideo,
        setSalvandoVideo,
    ] = useState(false);

    const [
        exclusaoSelecionada,
        setExclusaoSelecionada,
    ] =
        useState<ExclusaoSelecionada | null>(
            null
        );

    const [excluindo, setExcluindo] =
        useState(false);

    const carregarDados = async (
        exibirLoading = true
    ) => {
        try {
            if (exibirLoading) {
                setLoading(true);
            }

            setErro(null);

            const [
                categoriasDb,
                videosDb,
            ] = await Promise.all([
                getTodasCategoriasVideos(),
                getTodosVideosAulas(),
            ]);

            setCategorias(categoriasDb);
            setVideos(videosDb);
        } catch (error) {
            const mensagem =
                error instanceof Error
                    ? error.message
                    : "Não foi possível carregar a biblioteca.";

            setErro(mensagem);
        } finally {
            if (exibirLoading) {
                setLoading(false);
            }
        }
    };

    useEffect(() => {
        void carregarDados();
    }, []);

    useEffect(() => {
        setPaginaVideos(1);
    }, [
        buscaVideo,
        filtroCategoria,
    ]);

    useEffect(() => {
        setPaginaCategorias(1);
    }, [buscaCategoria]);

    const videosFiltrados =
        useMemo(() => {
            const termo = buscaVideo
                .trim()
                .toLocaleLowerCase(
                    "pt-BR"
                );

            return videos.filter(
                (video) => {
                    const correspondeCategoria =
                        filtroCategoria ===
                            "todas" ||
                        video.categoria_id ===
                            filtroCategoria;

                    const correspondeBusca =
                        !termo ||
                        video.titulo
                            .toLocaleLowerCase(
                                "pt-BR"
                            )
                            .includes(termo) ||
                        video.descricao
                            .toLocaleLowerCase(
                                "pt-BR"
                            )
                            .includes(termo) ||
                        video.categoria?.nome
                            ?.toLocaleLowerCase(
                                "pt-BR"
                            )
                            .includes(termo);

                    return (
                        correspondeCategoria &&
                        correspondeBusca
                    );
                }
            );
        }, [
            videos,
            buscaVideo,
            filtroCategoria,
        ]);

    const categoriasFiltradas =
        useMemo(() => {
            const termo =
                buscaCategoria
                    .trim()
                    .toLocaleLowerCase(
                        "pt-BR"
                    );

            return categorias.filter(
                (categoria) =>
                    !termo ||
                    categoria.nome
                        .toLocaleLowerCase(
                            "pt-BR"
                        )
                        .includes(termo) ||
                    categoria.descricao
                        ?.toLocaleLowerCase(
                            "pt-BR"
                        )
                        .includes(termo)
            );
        }, [
            categorias,
            buscaCategoria,
        ]);

    const totalPaginasVideos =
        Math.max(
            1,
            Math.ceil(
                videosFiltrados.length /
                    ITENS_POR_PAGINA
            )
        );

    const totalPaginasCategorias =
        Math.max(
            1,
            Math.ceil(
                categoriasFiltradas.length /
                    ITENS_POR_PAGINA
            )
        );

    const videosPaginados =
        useMemo(() => {
            const inicio =
                (paginaVideos - 1) *
                ITENS_POR_PAGINA;

            return videosFiltrados.slice(
                inicio,
                inicio +
                    ITENS_POR_PAGINA
            );
        }, [
            videosFiltrados,
            paginaVideos,
        ]);

    const categoriasPaginadas =
        useMemo(() => {
            const inicio =
                (paginaCategorias - 1) *
                ITENS_POR_PAGINA;

            return categoriasFiltradas.slice(
                inicio,
                inicio +
                    ITENS_POR_PAGINA
            );
        }, [
            categoriasFiltradas,
            paginaCategorias,
        ]);

    const abrirNovaCategoria = () => {
        setCategoriaEditando(null);
        setModalCategoriaAberto(true);
    };

    const abrirEditarCategoria = (
        categoria: CategoriaVideo
    ) => {
        setCategoriaEditando(
            categoria
        );
        setModalCategoriaAberto(true);
    };

    const abrirNovoVideo = () => {
        if (categorias.length === 0) {
            showError(
                "Crie uma categoria antes de cadastrar um vídeo."
            );

            return;
        }

        setVideoEditando(null);
        setModalVideoAberto(true);
    };

    const abrirEditarVideo = (
        video: VideoAula
    ) => {
        setVideoEditando(video);
        setModalVideoAberto(true);
    };

    const handleSalvarCategoria =
        async (
            payload: CategoriaVideoPayload
        ) => {
            try {
                setSalvandoCategoria(
                    true
                );

                if (categoriaEditando) {
                    await atualizarCategoriaVideo(
                        categoriaEditando.id,
                        payload
                    );

                    showSuccess(
                        "Categoria atualizada com sucesso."
                    );
                } else {
                    await criarCategoriaVideo(
                        payload
                    );

                    showSuccess(
                        "Categoria criada com sucesso."
                    );
                }

                setModalCategoriaAberto(
                    false
                );
                setCategoriaEditando(null);

                await carregarDados(false);
            } catch (error) {
                showError(
                    error instanceof Error
                        ? error.message
                        : "Erro ao salvar categoria."
                );
            } finally {
                setSalvandoCategoria(
                    false
                );
            }
        };

    const handleSalvarVideo = async (
        payload: VideoAulaPayload
    ) => {
        try {
            setSalvandoVideo(true);

            if (videoEditando) {
                await atualizarVideoAula(
                    videoEditando.id,
                    payload
                );

                showSuccess(
                    "Vídeo atualizado com sucesso."
                );
            } else {
                await criarVideoAula(
                    payload
                );

                showSuccess(
                    "Vídeo criado com sucesso."
                );
            }

            setModalVideoAberto(false);
            setVideoEditando(null);

            await carregarDados(false);
        } catch (error) {
            showError(
                error instanceof Error
                    ? error.message
                    : "Erro ao salvar vídeo."
            );
        } finally {
            setSalvandoVideo(false);
        }
    };

    const handleExcluir = async () => {
        if (!exclusaoSelecionada) {
            return;
        }

        try {
            setExcluindo(true);

            if (
                exclusaoSelecionada.tipo ===
                "video"
            ) {
                await deletarVideoAula(
                    exclusaoSelecionada.id
                );

                showSuccess(
                    "Vídeo excluído com sucesso."
                );
            } else {
                await deletarCategoriaVideo(
                    exclusaoSelecionada.id
                );

                showSuccess(
                    "Categoria excluída com sucesso."
                );
            }

            setExclusaoSelecionada(
                null
            );

            await carregarDados(false);
        } catch (error) {
            showError(
                error instanceof Error
                    ? error.message
                    : "Erro ao excluir registro."
            );
        } finally {
            setExcluindo(false);
        }
    };

    const renderPaginacao = (
        paginaAtual: number,
        totalPaginas: number,
        onChange: (
            pagina: number
        ) => void
    ) => {
        if (totalPaginas <= 1) {
            return null;
        }

        return (
            <div className="mt-6 flex items-center justify-center gap-2">
                <button
                    type="button"
                    onClick={() =>
                        onChange(
                            paginaAtual - 1
                        )
                    }
                    disabled={
                        paginaAtual === 1
                    }
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground hover:bg-secondary disabled:opacity-40"
                >
                    <ChevronLeft className="h-4 w-4" />
                </button>

                <span className="px-3 text-sm font-semibold text-foreground">
                    {paginaAtual} de{" "}
                    {totalPaginas}
                </span>

                <button
                    type="button"
                    onClick={() =>
                        onChange(
                            paginaAtual + 1
                        )
                    }
                    disabled={
                        paginaAtual ===
                        totalPaginas
                    }
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground hover:bg-secondary disabled:opacity-40"
                >
                    <ChevronRight className="h-4 w-4" />
                </button>
            </div>
        );
    };

    return (
        <div>
            <AdminHeader
                title="Vídeos e aulas"
                subtitle="Gerencie categorias e treinamentos disponíveis para os técnicos."
            />

            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
                <button
                    type="button"
                    onClick={
                        abrirNovaCategoria
                    }
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-border bg-card px-4 text-sm font-bold text-foreground shadow-sm hover:bg-secondary"
                >
                    <FolderOpen className="h-4 w-4" />
                    Nova categoria
                </button>

                <button
                    type="button"
                    onClick={abrirNovoVideo}
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-bold text-primary-foreground shadow-sm hover:bg-primary/90"
                >
                    <Plus className="h-4 w-4" />
                    Novo vídeo
                </button>
            </div>

            <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <CardResumo
                    titulo="Vídeos"
                    valor={videos.length}
                    descricao="Treinamentos cadastrados"
                    icon={
                        <Video className="h-5 w-5" />
                    }
                    className="bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300"
                />

                <CardResumo
                    titulo="Categorias"
                    valor={
                        categorias.length
                    }
                    descricao="Assuntos organizados"
                    icon={
                        <FolderOpen className="h-5 w-5" />
                    }
                    className="bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300"
                />

                <CardResumo
                    titulo="Disponíveis"
                    valor={videos.length}
                    descricao="Materiais para os técnicos"
                    icon={
                        <BookOpen className="h-5 w-5" />
                    }
                    className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                />
            </section>

            <section className="mt-6 rounded-xl border border-border bg-card p-2 shadow-sm">
                <div className="grid grid-cols-2 gap-2">
                    <button
                        type="button"
                        onClick={() =>
                            setAba("videos")
                        }
                        className={`flex h-11 items-center justify-center gap-2 rounded-lg text-sm font-bold ${
                            aba === "videos"
                                ? "bg-primary text-primary-foreground"
                                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                        }`}
                    >
                        <Video className="h-4 w-4" />
                        Vídeos
                    </button>

                    <button
                        type="button"
                        onClick={() =>
                            setAba(
                                "categorias"
                            )
                        }
                        className={`flex h-11 items-center justify-center gap-2 rounded-lg text-sm font-bold ${
                            aba ===
                            "categorias"
                                ? "bg-primary text-primary-foreground"
                                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                        }`}
                    >
                        <FolderOpen className="h-4 w-4" />
                        Categorias
                    </button>
                </div>
            </section>

            {erro && (
                <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
                    {erro}
                </div>
            )}

            {loading ? (
                <div className="mt-6 flex min-h-[300px] items-center justify-center rounded-xl border border-border bg-card">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : aba === "videos" ? (
                <>
                    <section className="mt-6 rounded-xl border border-border bg-card p-4 shadow-sm">
                        <div className="grid gap-3 lg:grid-cols-[1fr_250px]">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />

                                <input
                                    type="search"
                                    value={
                                        buscaVideo
                                    }
                                    onChange={(
                                        event
                                    ) =>
                                        setBuscaVideo(
                                            event
                                                .target
                                                .value
                                        )
                                    }
                                    placeholder="Buscar vídeo"
                                    className="h-11 w-full rounded-lg border border-border bg-background pl-10 pr-4 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                                />
                            </div>

                            <select
                                value={
                                    filtroCategoria
                                }
                                onChange={(
                                    event
                                ) =>
                                    setFiltroCategoria(
                                        event
                                            .target
                                            .value
                                    )
                                }
                                className="h-11 rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                            >
                                <option value="todas">
                                    Todas as categorias
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
                    </section>

                    {videosPaginados.length ===
                    0 ? (
                        <div className="mt-6 rounded-xl border border-border bg-card p-10 text-center">
                            <Video className="mx-auto h-10 w-10 text-muted-foreground/50" />

                            <h3 className="mt-4 font-bold text-foreground">
                                Nenhum vídeo encontrado
                            </h3>
                        </div>
                    ) : (
                        <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2 2xl:grid-cols-3">
                            {videosPaginados.map(
                                (video) => {
                                    const dadosYoutube =
                                        obterDadosYoutube(
                                            video.youtube_url
                                        );

                                    return (
                                        <article
                                            key={
                                                video.id
                                            }
                                            className="flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm"
                                        >
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setVideoPreview(
                                                        video
                                                    )
                                                }
                                                className="group relative aspect-video overflow-hidden bg-slate-950"
                                            >
                                                {dadosYoutube.videoId && (
                                                    <img
                                                        src={criarThumbnailYoutube(
                                                            dadosYoutube.videoId
                                                        )}
                                                        alt={
                                                            video.titulo
                                                        }
                                                        loading="lazy"
                                                        className="h-full w-full object-cover transition-transform group-hover:scale-105"
                                                    />
                                                )}

                                                <span className="absolute inset-0 bg-black/20" />

                                                <span className="absolute left-1/2 top-1/2 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-red-600 text-white shadow-xl">
                                                    <Play className="ml-1 h-6 w-6 fill-current" />
                                                </span>
                                            </button>

                                            <div className="flex flex-1 flex-col p-5">
                                                <span className="w-fit rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-blue-700">
                                                    {video
                                                        .categoria
                                                        ?.nome ||
                                                        "Sem categoria"}
                                                </span>

                                                <h3 className="mt-4 text-lg font-bold text-foreground">
                                                    {
                                                        video.titulo
                                                    }
                                                </h3>

                                                <p className="mt-2 flex-1 text-sm leading-6 text-muted-foreground">
                                                    {
                                                        video.descricao
                                                    }
                                                </p>

                                                <div className="mt-5 grid grid-cols-3 gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setVideoPreview(
                                                                video
                                                            )
                                                        }
                                                        className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-primary text-xs font-bold text-primary-foreground"
                                                    >
                                                        <Play className="h-4 w-4" />
                                                        Assistir
                                                    </button>

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            abrirEditarVideo(
                                                                video
                                                            )
                                                        }
                                                        className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-border bg-background text-xs font-bold text-foreground hover:bg-secondary"
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                        Editar
                                                    </button>

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setExclusaoSelecionada(
                                                                {
                                                                    tipo: "video",
                                                                    id: video.id,
                                                                    nome: video.titulo,
                                                                }
                                                            )
                                                        }
                                                        className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-red-200 bg-red-50 text-xs font-bold text-red-700 hover:bg-red-100"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                        Excluir
                                                    </button>
                                                </div>
                                            </div>
                                        </article>
                                    );
                                }
                            )}
                        </div>
                    )}

                    {renderPaginacao(
                        paginaVideos,
                        totalPaginasVideos,
                        setPaginaVideos
                    )}
                </>
            ) : (
                <>
                    <section className="mt-6 rounded-xl border border-border bg-card p-4 shadow-sm">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />

                            <input
                                type="search"
                                value={
                                    buscaCategoria
                                }
                                onChange={(
                                    event
                                ) =>
                                    setBuscaCategoria(
                                        event
                                            .target
                                            .value
                                    )
                                }
                                placeholder="Buscar categoria"
                                className="h-11 w-full rounded-lg border border-border bg-background pl-10 pr-4 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                            />
                        </div>
                    </section>

                    {categoriasPaginadas.length ===
                    0 ? (
                        <div className="mt-6 rounded-xl border border-border bg-card p-10 text-center">
                            <FolderOpen className="mx-auto h-10 w-10 text-muted-foreground/50" />

                            <h3 className="mt-4 font-bold text-foreground">
                                Nenhuma categoria encontrada
                            </h3>
                        </div>
                    ) : (
                        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                            {categoriasPaginadas.map(
                                (
                                    categoria
                                ) => (
                                    <article
                                        key={
                                            categoria.id
                                        }
                                        className="rounded-xl border border-border bg-card p-5 shadow-sm"
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700">
                                                <FolderOpen className="h-5 w-5" />
                                            </span>

                                            <span className="rounded-full border border-border bg-secondary/50 px-2.5 py-1 text-xs font-bold text-muted-foreground">
                                                {
                                                    categoria.total_videos
                                                }{" "}
                                                vídeos
                                            </span>
                                        </div>

                                        <h3 className="mt-4 text-lg font-bold text-foreground">
                                            {
                                                categoria.nome
                                            }
                                        </h3>

                                        <p className="mt-2 min-h-12 text-sm leading-6 text-muted-foreground">
                                            {categoria.descricao ||
                                                "Sem descrição cadastrada."}
                                        </p>

                                        <div className="mt-5 grid grid-cols-2 gap-2">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    abrirEditarCategoria(
                                                        categoria
                                                    )
                                                }
                                                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-border bg-background text-sm font-bold text-foreground hover:bg-secondary"
                                            >
                                                <Pencil className="h-4 w-4" />
                                                Editar
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setExclusaoSelecionada(
                                                        {
                                                            tipo: "categoria",
                                                            id: categoria.id,
                                                            nome: categoria.nome,
                                                        }
                                                    )
                                                }
                                                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-red-200 bg-red-50 text-sm font-bold text-red-700 hover:bg-red-100"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                                Excluir
                                            </button>
                                        </div>
                                    </article>
                                )
                            )}
                        </div>
                    )}

                    {renderPaginacao(
                        paginaCategorias,
                        totalPaginasCategorias,
                        setPaginaCategorias
                    )}
                </>
            )}

            {modalCategoriaAberto && (
                <CategoriaVideoModal
                    categoria={
                        categoriaEditando
                    }
                    salvando={
                        salvandoCategoria
                    }
                    onClose={() => {
                        setModalCategoriaAberto(
                            false
                        );
                        setCategoriaEditando(
                            null
                        );
                    }}
                    onSubmit={
                        handleSalvarCategoria
                    }
                />
            )}

            {modalVideoAberto && (
                <VideoAulaModal
                    video={videoEditando}
                    categorias={categorias}
                    salvando={
                        salvandoVideo
                    }
                    onClose={() => {
                        setModalVideoAberto(
                            false
                        );
                        setVideoEditando(
                            null
                        );
                    }}
                    onSubmit={
                        handleSalvarVideo
                    }
                />
            )}

            {videoPreview && (
                <VideoAulaPreviewModal
                    video={videoPreview}
                    onClose={() =>
                        setVideoPreview(null)
                    }
                />
            )}

            {exclusaoSelecionada && (
                <ConfirmarExclusaoBibliotecaModal
                    titulo={`Excluir ${
                        exclusaoSelecionada.tipo ===
                        "video"
                            ? "vídeo"
                            : "categoria"
                    }?`}
                    descricao={`O registro "${exclusaoSelecionada.nome}" será removido permanentemente.`}
                    excluindo={excluindo}
                    onClose={() =>
                        setExclusaoSelecionada(
                            null
                        )
                    }
                    onConfirm={
                        handleExcluir
                    }
                />
            )}
        </div>
    );
};

export default BibliotecaVideos;