import supabase from "../../lib/supabase";
import {
    VideoAula,
    VideoAulaPayload,
} from "../../types/biblioteca-video.type";

export async function atualizarVideoAula(
    id: string,
    payload: VideoAulaPayload
): Promise<VideoAula> {
    const { data, error } =
        await supabase
            .from("video_aula")
            .update({
                categoria_id:
                    payload.categoria_id,
                titulo:
                    payload.titulo.trim(),
                descricao:
                    payload.descricao.trim(),
                youtube_url:
                    payload.youtube_url.trim(),
            })
            .eq("id", id)
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
            "Erro ao atualizar vídeo:",
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