import AsyncStorage from '@react-native-async-storage/async-storage';

import { supabase } from '@/lib/supabase';

const CACHE_KEY_PREFIX = 'eula_accepted:';

export async function hasAcceptedEula(userId: string): Promise<boolean> {
  const cached = await AsyncStorage.getItem(`${CACHE_KEY_PREFIX}${userId}`);
  if (cached === '1') return true;

  const { data } = await supabase
    .from('eula_acceptances')
    .select('user_id')
    .eq('user_id', userId)
    .maybeSingle();

  if (data) {
    await AsyncStorage.setItem(`${CACHE_KEY_PREFIX}${userId}`, '1');
    return true;
  }
  return false;
}

export async function acceptEula(userId: string): Promise<void> {
  await supabase.from('eula_acceptances').insert({ user_id: userId });
  await AsyncStorage.setItem(`${CACHE_KEY_PREFIX}${userId}`, '1');
}
