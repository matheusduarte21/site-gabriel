import supabase from "../../lib/supabase";

export async function deletarCategoriaVideo(
    id: string
): Promise<void> {
    const {
        count,
        error: countError,
    } = await supabase
        .from("video_aula")
        .select("id", {
            count: "exact",
            head: true,
        })
        .eq("categoria_id", id);

    if (countError) {
        console.error(
            "Erro ao verificar vídeos da categoria:",
            countError.message
        );

        throw new Error(
            countError.message
        );
    }

    if ((count || 0) > 0) {
        throw new Error(
            "Não é possível excluir uma categoria que possui vídeos. Exclua ou mova os vídeos primeiro."
        );
    }

    const { error } = await supabase
        .from("categoria_video")
        .delete()
        .eq("id", id);

    if (error) {
        console.error(
            "Erro ao excluir categoria:",
            error.message
        );

        throw new Error(error.message);
    }
}