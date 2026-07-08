import supabase from "../../lib/supabase";
import { Chamado } from "../../types/chamado.type";

export type ChamadosPorEmpresa = {
    empresa: string;
    chamados: number;
    total_registros: number;
};

export type DesempenhoTecnico = {
    tecnico_id: string;
    nome: string;
    estado: string;
    chamados: number;
    faturado: number;
    pago: number;
    lucro: number;
    total_registros: number;
};

export async function getChamadosPorEmpresa(
    page = 1,
    limit = 5
): Promise<ChamadosPorEmpresa[]> {
    const offset = (page - 1) * limit;

    const { data, error } = await supabase.rpc("get_chamados_por_empresa", {
        p_limit: limit,
        p_offset: offset,
    });

    if (error) {
        console.error("Erro ao buscar chamados por empresa:", error.message);
        throw new Error(error.message);
    }

    return data || [];
}

export async function getDesempenhoTecnicos(
    page = 1,
    limit = 5
): Promise<DesempenhoTecnico[]> {
    const offset = (page - 1) * limit;

    const { data, error } = await supabase.rpc("get_desempenho_tecnicos", {
        p_limit: limit,
        p_offset: offset,
    });

    if (error) {
        console.error("Erro ao buscar desempenho dos técnicos:", error.message);
        throw new Error(error.message);
    }

    return data || [];
}

export async function getChamadosAgendados(): Promise<Chamado[]> {
    const { data, error } = await supabase
        .from("chamado")
        .select("*")
        .eq("status_id", 2);

    if (error) {
        console.error("Erro ao buscar chamados agendados:", error.message);
        throw new Error(error.message);
    }

    return data || [];
}