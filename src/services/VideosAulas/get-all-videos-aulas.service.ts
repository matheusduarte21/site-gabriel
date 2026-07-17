import supabase from "../../lib/supabase";
import { VideoAula } from "../../types/biblioteca-video.type";

const obterRelacaoUnica = <T>(
    valor: T | T[] | null | undefined
): T | null => {
    if (Array.isArray(valor)) {
        return valor[0] || null;
    }

    return valor || null;
};

export async function getTodosVideosAulas(): Promise<
    VideoAula[]
> {
    const { data, error } =
        await supabase
            .from("video_aula")
            .select(`
                id,
                categoria_id,
                titulo,
                descricao,
                youtube_url,
                criado_em,
                atualizado_em,
                categoria:categoria_video (
                    id,
                    nome,
                    descricao
                )
            `)
            .order("criado_em", {
                ascending: false,
            });

    if (error) {
        console.error(
            "Erro ao buscar vídeos:",
            error.message
        );

        throw new Error(error.message);
    }

    return (data || []).map(
        (video: any) => ({
            ...video,
            categoria:
                obterRelacaoUnica(
                    video.categoria
                ),
        })
    ) as VideoAula[];
}