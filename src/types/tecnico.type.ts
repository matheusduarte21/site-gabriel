export type Tecnico = {
    id: string;                  
    usuario_id: string;          
    nome: string;                
    estado_id?: number | null;  
    telefone?: string | null;    
    endereco?: string | null;    
    data_criacao?: string | null;
    municipio_id?: number | null;
    cpf?: string | null;         
    rg?: string | null;          
    data_nascimento?: string | null; 
    email_contato?: string | null;  
}