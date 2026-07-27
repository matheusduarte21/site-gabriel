import supabase from "../../lib/supabase";
import { CategoriaVideo } from "../../types/biblioteca-video.type";

export async function getTodasCategoriasVideos(): Promise<
    CategoriaVideo[]
> {
    const [
        categoriasResponse,
        videosResponse,
    ] = await Promise.all([
        supabase
            .from("categoria_video")
            .select("*")
            .order("nome", {
                ascending: true,
            }),
        supabase
            .from("video_aula")
            .select(
                "id, categoria_id"
            ),
    ]);

    if (categoriasResponse.error) {
        console.error(
            "Erro ao buscar categorias:",
            categoriasResponse.error
                .message
        );

        throw new Error(
            categoriasResponse.error
                .message
        );
    }

    if (videosResponse.error) {
        console.error(
            "Erro ao contar vídeos:",
            videosResponse.error.message
        );

        throw new Error(
            videosResponse.error.message
        );
    }

    const totais = new Map<
        string,
        number
    >();

    for (
        const video of
        videosResponse.data || []
    ) {
        const categoriaId = String(
            video.categoria_id
        );

        totais.set(
            categoriaId,
            (totais.get(categoriaId) ||
                0) + 1
        );
    }

    return (
        categoriasResponse.data || []
    ).map((categoria) => ({
        ...categoria,
        total_videos:
            totais.get(
                String(categoria.id)
            ) || 0,
    })) as CategoriaVideo[];
}