import * as Updates from 'expo-updates';

// Тек нақты (development емес) build-та жұмыс істейді — Expo Go/dev серверде
// Updates бос болады, тексерудің қажеті жоқ.
export async function checkForUpdatesAsync() {
  if (__DEV__ || !Updates.isEnabled) return;

  try {
    const result = await Updates.checkForUpdateAsync();
    if (result.isAvailable) {
      await Updates.fetchUpdateAsync();
      await Updates.reloadAsync();
    }
  } catch (err) {
    console.warn('[updates] тексеру сәтсіз аяқталды:', err);
  }
}
