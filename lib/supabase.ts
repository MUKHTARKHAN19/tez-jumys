import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  // .env файлы толтырылмаса, қосымша UI-мен жұмыс істей береді, бірақ Supabase сұраныстары сәтсіз аяқталады.
  console.warn(
    '[supabase] EXPO_PUBLIC_SUPABASE_URL / EXPO_PUBLIC_SUPABASE_ANON_KEY табылмады. .env файлын толтырыңыз (README.md қараңыз).'
  );
}

// Клиент Database generic-імен параметрленбеген, сондықтан сұраныс нәтижелерін
// экрандарда types/database.ts типтерімен қолмен (as ...) типтейміз.
export const supabase = createClient(supabaseUrl ?? '', supabaseAnonKey ?? '', {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
