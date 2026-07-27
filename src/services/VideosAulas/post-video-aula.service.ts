import supabase from "../../lib/supabase";
import {
    VideoAula,
    VideoAulaPayload,
} from "../../types/biblioteca-video.type";

export async function criarVideoAula(
    payload: VideoAulaPayload
): Promise<VideoAula> {
    const { data, error } =
        await supabase
            .from("video_aula")
            .insert({
                categoria_id:
                    payload.categoria_id,
                titulo:
                    payload.titulo.trim(),
                descricao:
                    payload.descricao.trim(),
                youtube_url:
                    payload.youtube_url.trim(),
            })
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
            .single();

    if (error) {
        console.error(
            "Erro ao criar vídeo:",
            error.message
        );

        if (error.code === "23505") {
            throw new Error(
                "Já existe um vídeo com esse título nesta categoria."
            );
        }

        throw new Error(error.message);
    }

    return data as unknown as VideoAula;
}