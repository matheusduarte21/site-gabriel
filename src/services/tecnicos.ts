import { supabase } from '../lib/supabase';

export const tecnicosService = {
    async getAll() {
        const { data, error } = await supabase
        .from('tecnico')
        .select('*')
        .order('nome', { ascending: true });

        if (error) throw error;
        return data;
    }
};