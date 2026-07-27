export interface CategoriaVideoResumo {
    id: string;
    nome: string;
    descricao?: string | null;
}

export interface CategoriaVideo
    extends CategoriaVideoResumo {
    criado_em?: string | null;
    atualizado_em?: string | null;
    total_videos: number;
}

export interface CategoriaVideoPayload {
    nome: string;
    descricao?: string | null;
}

export interface VideoAula {
    id: string;
    categoria_id: string;
    titulo: string;
    descricao: string;
    youtube_url: string;
    criado_em?: string | null;
    atualizado_em?: string | null;
    categoria?: CategoriaVideoResumo | null;
}

export interface VideoAulaPayload {
    categoria_id: string;
    titulo: string;
    descricao: string;
    youtube_url: string;
}