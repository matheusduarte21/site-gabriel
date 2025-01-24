import supabase from '../supabase';

export async function getServiceCalls() {
  const { data, error } = await supabase
    .from('service_call')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;

  const serviceCallsWithImageUrls = data.map(call => {
    
    const imageUrl = `https://villtmaldgntsecakmvk.supabase.co/storage/v1/object/public/image_rat/${call.file_url}`;
    return {
      ...call,
      imageUrl,
    };
  });
  return serviceCallsWithImageUrls;

}

export async function deleteItem  (itemId: string | number) {
  try {
    const { data, error } = await supabase
      .from('service_call') 
      .delete()
      .eq('id', itemId); 

    if (error) {
      console.error('Erro ao excluir o item:', error.message);
      return;
    }
    
    console.log('Item excluído com sucesso:', data);
  } catch (error) {
    console.error('Erro desconhecido ao excluir o item:', error);
  }
};



export async function UpdateServiceCalls(id: string,  dataUpdate: any ) {
  const { data, error } = await supabase
    .from('service_call')
    .update(dataUpdate)
    .eq('id', id)

  if (error) throw error;
  return data;
}

export async function InsertImageRat(file: any) {

  const cleanFileName = (fileName: string) => {
    return fileName
      .toLowerCase()
      .replace(/\s+/g, '-') 
      .replace(/[^a-z0-9\-_.]/g, '');
  };
  const filePath = `${cleanFileName(file.name)}`;

  const { data, error } = await supabase.storage
    .from('image_rat')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: true, 
    });

  if (error) throw error;

  return data;
}
