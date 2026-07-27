export interface DadosYoutube {
    videoId: string | null;
    inicio: number;
}

const converterTempoParaSegundos = (
    valor: string | null | undefined
): number => {
    if (!valor) {
        return 0;
    }

    if (/^\d+$/.test(valor)) {
        return Number(valor);
    }

    const horas = Number(
        valor.match(/(\d+)h/)?.[1] || 0
    );

    const minutos = Number(
        valor.match(/(\d+)m/)?.[1] || 0
    );

    const segundos = Number(
        valor.match(/(\d+)s/)?.[1] || 0
    );

    return (
        horas * 3600 +
        minutos * 60 +
        segundos
    );
};

export const obterDadosYoutube = (
    url: string
): DadosYoutube => {
    if (!url.trim()) {
        return {
            videoId: null,
            inicio: 0,
        };
    }

    try {
        const endereco = new URL(
            url.trim()
        );

        let videoId: string | null = null;

        const hostname =
            endereco.hostname
                .replace("www.", "")
                .toLocaleLowerCase();

        if (hostname === "youtu.be") {
            videoId =
                endereco.pathname
                    .split("/")
                    .filter(Boolean)[0] ||
                null;
        }

        if (
            hostname === "youtube.com" ||
            hostname ===
                "m.youtube.com" ||
            hostname ===
                "youtube-nocookie.com"
        ) {
            videoId =
                endereco.searchParams.get("v");

            if (!videoId) {
                const partes =
                    endereco.pathname
                        .split("/")
                        .filter(Boolean);

                const marcadores = [
                    "embed",
                    "shorts",
                    "live",
                ];

                for (
                    const marcador of marcadores
                ) {
                    const indice =
                        partes.indexOf(
                            marcador
                        );

                    if (
                        indice >= 0 &&
                        partes[indice + 1]
                    ) {
                        videoId =
                            partes[indice + 1];

                        break;
                    }
                }
            }
        }

        const tempo =
            endereco.searchParams.get("t") ||
            endereco.searchParams.get(
                "start"
            );

        return {
            videoId,
            inicio:
                converterTempoParaSegundos(
                    tempo
                ),
        };
    } catch {
        const videoResultado = url.match(
            /(?:v=|youtu\.be\/|embed\/|shorts\/|live\/)([a-zA-Z0-9_-]{6,})/
        );

        const tempoResultado = url.match(
            /[?&](?:t|start)=([^&]+)/
        );

        return {
            videoId:
                videoResultado?.[1] ||
                null,
            inicio:
                converterTempoParaSegundos(
                    tempoResultado?.[1]
                ),
        };
    }
};

export const validarUrlYoutube = (
    url: string
): boolean => {
    return Boolean(
        obterDadosYoutube(url).videoId
    );
};

export const criarThumbnailYoutube = (
    videoId: string
): string => {
    return `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
};