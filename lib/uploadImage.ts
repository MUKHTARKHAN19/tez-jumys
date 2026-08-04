import { File } from 'expo-file-system';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import { Image } from 'react-native';

import { supabase } from '@/lib/supabase';

const BUCKET = 'tez-jumys';
const MAX_DIMENSION = 1280;
const JPEG_QUALITY = 0.7;

function getImageSize(uri: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    Image.getSize(uri, (width, height) => resolve({ width, height }), reject);
  });
}

// Жүктеу алдында суретті кішірейтіп/сықыстырамыз: ұзын қабырғасы max 1280px,
// JPEG сапасы 0.7. Бұл жүктеу жылдамдығын және Storage орнын үнемдейді.
async function optimizeImage(localUri: string): Promise<string> {
  try {
    const { width, height } = await getImageSize(localUri);
    const context = ImageManipulator.manipulate(localUri);

    if (Math.max(width, height) > MAX_DIMENSION) {
      if (width >= height) {
        context.resize({ width: MAX_DIMENSION });
      } else {
        context.resize({ height: MAX_DIMENSION });
      }
    }

    const rendered = await context.renderAsync();
    const saved = await rendered.saveAsync({ compress: JPEG_QUALITY, format: SaveFormat.JPEG });
    return saved.uri;
  } catch {
    // Оптимизация сәтсіз болса, түпнұсқа суретті жүктей береміз.
    return localUri;
  }
}

export async function uploadImageAsync(localUri: string, pathPrefix: string): Promise<string> {
  const optimizedUri = await optimizeImage(localUri);

  // Ескерту: fetch(localUri).blob() react native-де кейде 0 байт қайтарады
  // (белгілі шектеу), сондықтан файлды expo-file-system арқылы тікелей оқимыз.
  const file = new File(optimizedUri);
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
