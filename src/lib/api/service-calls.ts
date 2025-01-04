import supabase from '../supabase';

export async function getServiceCalls() {
  const { data, error } = await supabase
    .from('service_call')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

