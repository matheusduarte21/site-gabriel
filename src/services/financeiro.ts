import { supabase } from '../lib/supabase';

export const financeiroService = {
    async getResumoFinanceiro() {
        const { data, error } = await supabase
            .from('chamado')
            .select('valor_faturado, valor_pago, valor_ganho');
        
        if (error) throw error;
        
        const totalFaturado = data.reduce((acc, curr) => acc + (curr.valor_faturado || 0), 0);
        const totalPago = data.reduce((acc, curr) => acc + (curr.valor_pago || 0), 0);
        const lucroTotal = data.reduce((acc, curr) => acc + (curr.valor_ganho || 0), 0);

        return {
            faturado: totalFaturado,
            recebido: totalPago,
            lucro: lucroTotal
        };
    }
};