import supabase from "../../lib/supabase";

export async function deletarVideoAula(
    id: string
): Promise<void> {
    const { error } = await supabase
        .from("video_aula")
        .delete()
        .eq("id", id);

    if (error) {
        console.error(
            "Erro ao excluir vídeo:",
            error.message
        );

        throw new Error(error.message);
    }
}