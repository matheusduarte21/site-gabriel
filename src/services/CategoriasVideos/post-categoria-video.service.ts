import supabase from "../../lib/supabase";
import {
    CategoriaVideo,
    CategoriaVideoPayload,
} from "../../types/biblioteca-video.type";

export async function criarCategoriaVideo(
    payload: CategoriaVideoPayload
): Promise<CategoriaVideo> {
    const { data, error } =
        await supabase
            .from("categoria_video")
            .insert({
                nome: payload.nome.trim(),
                descricao:
                    payload.descricao
                        ?.trim() || null,
            })
            .select()
            .single();

    if (error) {
        console.error(
            "Erro ao criar categoria:",
            error.message
        );

        if (error.code === "23505") {
            throw new Error(
                "Já existe uma categoria com esse nome."
            );
        }

        throw new Error(error.message);
    }

    return {
        ...data,
        total_videos: 0,
    } as CategoriaVideo;
}