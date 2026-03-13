export type Cliente = {
    cliente_id: number;
    nome: string;
    cpf_cnpj?: string;
    grupo_id?: number | null;
    created_at?: string;
}