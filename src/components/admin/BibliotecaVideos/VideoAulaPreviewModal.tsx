import {
    useEffect,
} from "react";
import {
    X,
} from "lucide-react";
import LiteYouTubeEmbed from "react-lite-youtube-embed";
import "react-lite-youtube-embed/dist/LiteYouTubeEmbed.css";
import { VideoAula } from "../../../types/biblioteca-video.type";
import { obterDadosYoutube } from "../Utils/youtube";

interface VideoAulaPreviewModalProps {
    video: VideoAula;
    onClose: () => void;
}

const VideoAulaPreviewModal = ({
    video,
    onClose,
}: VideoAulaPreviewModalProps) => {
    const dadosYoutube =
        obterDadosYoutube(
            video.youtube_url
        );

    useEffect(() => {
        const overflowAnterior =
            document.body.style.overflow;

        const handleKeyDown = (
            event: KeyboardEvent
        ) => {
            if (event.key === "Escape") {
                onClose();
            }
        };

        document.body.style.overflow =
            "hidden";

        window.addEventListener(
            "keydown",
            handleKeyDown
        );

        return () => {
            document.body.style.overflow =
                overflowAnterior;

            window.removeEventListener(
                "keydown",
                handleKeyDown
            );
        };
    }, [onClose]);

    if (!dadosYoutube.videoId) {
        return null;
    }

    return (
        <div
            className="fixed inset-0 z-[110] bg-black/80 backdrop-blur-sm sm:flex sm:items-center sm:justify-center sm:p-5"
            role="dialog"
            aria-modal="true"
            onMouseDown={(event) => {
                if (
                    event.target ===
                    event.currentTarget
                ) {
                    onClose();
                }
            }}
        >
            <div className="flex h-[100dvh] w-full flex-col overflow-hidden bg-card sm:h-auto sm:max-h-[92vh] sm:max-w-5xl sm:rounded-2xl sm:border sm:border-border">
                <div className="flex items-start justify-between gap-4 border-b border-border p-5">
                    <div className="min-w-0">
                        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-primary">
                            {video.categoria
                                ?.nome ||
                                "Vídeo"}
                        </p>

                        <h2 className="mt-1 text-lg font-bold text-foreground sm:text-xl">
                            {video.titulo}
                        </h2>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground hover:bg-secondary hover:text-foreground"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="shrink-0 bg-black">
                    <div className="aspect-video w-full overflow-hidden">
                        <LiteYouTubeEmbed
                            id={
                                dadosYoutube.videoId
                            }
                            title={video.titulo}
                            autoplay
                            lazyLoad
                            cookie={false}
                            poster="hqdefault"
                            hideButtonOnActivate
                            focusOnLoad
                            params={{
                                start: String(
                                    dadosYoutube.inicio
                                ),
                                rel: "0",
                                playsinline:
                                    "1",
                                modestbranding:
                                    "1",
                            }}
                            wrapperClass="yt-lite h-full w-full"
                            iframeClass="h-full w-full"
                            referrerPolicy="strict-origin-when-cross-origin"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-5">
                    <p className="text-sm leading-6 text-muted-foreground">
                        {video.descricao}
                    </p>
                </div>

                <div className="border-t border-border p-4 sm:p-5">
                    <button
                        type="button"
                        onClick={onClose}
                        className="h-11 w-full rounded-lg border border-border bg-background px-4 text-sm font-bold text-foreground hover:bg-secondary sm:ml-auto sm:block sm:w-auto sm:min-w-32"
                    >
                        Fechar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default VideoAulaPreviewModal;