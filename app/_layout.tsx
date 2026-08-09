import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useMemo, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import 'react-native-reanimated';

import { AnimatedSplash } from '@/components/AnimatedSplash';
import { AuthProvider } from '@/lib/auth';
import { BrowseFiltersProvider } from '@/lib/browseFilters';
import { FavoritesProvider } from '@/lib/favorites';
import { LanguageProvider, useLanguage } from '@/lib/i18n';
import { LocationSelectionProvider } from '@/lib/locationSelection';
import { Sentry } from '@/lib/sentry';
import { ThemeProvider as AppThemeProvider, useTheme } from '@/lib/theme';
import { checkForUpdatesAsync } from '@/lib/updates';

export { ErrorBoundary } from 'expo-router';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

SplashScreen.preventAutoHideAsync();

function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });
  // Суық қосылғанда бір рет қана көрсетіледі — RootLayout қайта mount
  // болмайынша (яғни қосымша толық қайта ашылмайынша) қайта ойналмайды.
  const [showAnimatedSplash, setShowAnimatedSplash] = useState(true);

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  useEffect(() => {
    checkForUpdatesAsync();
  }, []);

  if (!loaded) {
    return null;
  }

  return (
    <View style={{ flex: 1 }}>
      <AppThemeProvider>
        <AuthProvider>
          <LanguageProvider>
            <LocationSelectionProvider>
              <BrowseFiltersProvider>
                <FavoritesProvider>
                  <AppNavigator />
                </FavoritesProvider>
              </BrowseFiltersProvider>
            </LocationSelectionProvider>
          </LanguageProvider>
        </AuthProvider>
      </AppThemeProvider>
      {showAnimatedSplash && (
        <AnimatedSplash onFinish={() => setShowAnimatedSplash(false)} />
      )}
    </View>
  );
}

export default Sentry.wrap(RootLayout);

function AppNavigator() {
  const { t } = useLanguage();
  const { colors, isDark } = useTheme();

  const navigationTheme = useMemo(
    () => ({
      ...(isDark ? DarkTheme : DefaultTheme),
      colors: {
        ...(isDark ? DarkTheme.colors : DefaultTheme.colors),
        background: colors.background,
        card: colors.backgroundElevated,
        text: colors.text,
        border: colors.border,
        primary: colors.accent,
      },
    }),
    [isDark, colors]
  );

  return (
    <ThemeProvider value={navigationTheme}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.backgroundElevated },
          headerTintColor: colors.text,
          headerTitleStyle: { color: colors.text },
          contentStyle: { backgroundColor: colors.background },
        }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="vacancy/[id]" options={{ title: t('titles.vacancy') }} />
        <Stack.Screen
          name="business-profile"
          options={{ title: t('titles.businessProfile'), presentation: 'modal' }}
        />
        <Stack.Screen name="filter" options={{ title: t('titles.filter'), presentation: 'modal' }} />
        <Stack.Screen
          name="location-filter"
          options={{ title: t('titles.locationFilter'), presentation: 'modal' }}
        />
        <Stack.Screen name="empty-state" options={{ title: t('titles.emptyState') }} />
        <Stack.Screen name="auth" options={{ title: t('titles.auth'), presentation: 'modal' }} />
        <Stack.Screen
          name="seeker-profile"
          options={{ title: t('titles.seekerProfile'), presentation: 'modal' }}
        />
        <Stack.Screen name="candidates" options={{ title: t('titles.candidates') }} />
        <Stack.Screen name="favorites" options={{ title: t('titles.favorites') }} />
        <Stack.Screen
          name="vacancy-edit/[id]"
          options={{ title: t('titles.editVacancy'), presentation: 'modal' }}
        />
        <Stack.Screen name="admin" options={{ headerShown: false }} />
        <Stack.Screen
          name="delete-account"
          options={{ title: t('titles.deleteAccount'), presentation: 'modal' }}
        />
        <Stack.Screen
          name="forgot-password"
          options={{ title: t('titles.forgotPassword'), presentation: 'modal' }}
        />
        <Stack.Screen
          name="reset-password"
          options={{ title: t('titles.resetPassword'), presentation: 'modal' }}
        />
        <Stack.Screen name="blocked-users" options={{ title: t('titles.blockedUsers') }} />
        <Stack.Screen name="saved-searches" options={{ title: t('titles.savedSearches') }} />
        <Stack.Screen
          name="vacancy-applications/[id]"
          options={{ title: t('titles.vacancyApplications') }}
        />
      </Stack>
    </ThemeProvider>
  );
}
