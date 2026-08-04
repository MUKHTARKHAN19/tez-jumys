import { File } from 'expo-file-system';

import { supabase } from '@/lib/supabase';

const BUCKET = 'tez-jumys';

export async function uploadImageAsync(localUri: string, pathPrefix: string): Promise<string> {
  // Ескерту: fetch(localUri).blob() react native-де кейде 0 байт қайтарады
  // (белгілі шектеу), сондықтан файлды expo-file-system арқылы тікелей оқимыз.
  const file = new File(localUri);
  const arrayBuffer = await file.arrayBuffer();
  const extension = file.extension || '.jpg';
  const path = `${pathPrefix}-${Date.now()}${extension.startsWith('.') ? extension : `.${extension}`}`;

  const { error } = await supabase.storage.from(BUCKET).upload(path, arrayBuffer, {
    contentType: file.type || 'image/jpeg',
    upsert: true,
  });

  if (error) throw error;

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}
