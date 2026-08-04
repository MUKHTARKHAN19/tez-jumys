import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { supabase } from '@/lib/supabase';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

function getProjectId(): string | undefined {
  return Constants.expoConfig?.extra?.eas?.projectId;
}

export async function registerForPushNotifications(userId: string): Promise<boolean> {
  if (!Device.isDevice) return false;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  if (finalStatus !== 'granted') return false;

  const projectId = getProjectId();
  if (!projectId) return false;

  const tokenResponse = await Notifications.getExpoPushTokenAsync({ projectId });

  const { error } = await supabase
    .from('push_tokens')
    .upsert(
      { user_id: userId, token: tokenResponse.data, platform: Platform.OS, updated_at: new Date().toISOString() },
      { onConflict: 'token' }
    );

  return !error;
}

export async function unregisterPushNotifications(userId: string): Promise<void> {
  const projectId = getProjectId();

  if (Device.isDevice && projectId) {
    try {
      const tokenResponse = await Notifications.getExpoPushTokenAsync({ projectId });
      await supabase.from('push_tokens').delete().eq('token', tokenResponse.data);
      return;
    } catch {
      // Токенді ала алмасақ, сол пайдаланушының барлық токенін өшіреміз (төменде).
    }
  }

  await supabase.from('push_tokens').delete().eq('user_id', userId);
}

export async function hasPushToken(userId: string): Promise<boolean> {
  const { data } = await supabase.from('push_tokens').select('id').eq('user_id', userId).limit(1);
  return !!data && data.length > 0;
}
