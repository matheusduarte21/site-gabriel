import supabase from "../../lib/supabase";

export async function uploadDocumento(file: File): Promise<string> {
    try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}-${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
            .from('documentos_chamados')
            .upload(filePath, file);

        if (uploadError) {
            throw uploadError;
        }

        const { data } = supabase.storage
            .from('documentos_chamados')
            .getPublicUrl(filePath);

        return data.publicUrl;
    } catch (error: any) {
        console.error('Erro ao fazer upload:', error.message);
        throw error;
    }
}