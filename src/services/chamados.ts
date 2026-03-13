import { supabase } from '../lib/supabase';

export const chamadosService = {
    async getAll() {
        const { data, error} = await supabase
            .from('chamado')
            .select('*, tecnico(nome), cliente(nome');

        if (error) throw error;
        return data;
    },

    async create(payload: any) {
        const { data, error } = await supabase
            .from('chamado')
            .insert(payload)
            .select();

        if (error) throw error;
        return data;
    }
};