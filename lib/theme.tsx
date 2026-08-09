import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react';

import { darkColors, lightColors, type ColorTokens, type ThemeMode } from '@/constants/theme';

export type { ColorTokens, ThemeMode };

const STORAGE_KEY = 'app_theme';

type ThemeContextValue = {
  mode: ThemeMode;
  colors: ColorTokens;
  isDark: boolean;
  toggleTheme: () => void;
  setThemeMode: (mode: ThemeMode) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

// Әдепкі мән — Түнгі (қараңғы), яғни бар пайдаланушылар өзгеріс байқамайды.
// Таңдау AsyncStorage-те сақталады, қосымша қайта ашылғанда қалпына келеді.
export function ThemeProvider({ children }: PropsWithChildren) {
  const [mode, setMode] = useState<ThemeMode>('dark');

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((saved) => {
      if (saved === 'light' || saved === 'dark') setMode(saved);
    });
  }, []);

  const setThemeMode = (next: ThemeMode) => {
    setMode(next);
    AsyncStorage.setItem(STORAGE_KEY, next);
  };

  const toggleTheme = () => {
    setThemeMode(mode === 'dark' ? 'light' : 'dark');
  };

  const value = useMemo<ThemeContextValue>(
    () => ({
      mode,
      colors: mode === 'dark' ? darkColors : lightColors,
      isDark: mode === 'dark',
      toggleTheme,
      setThemeMode,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [mode]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme ThemeProvider ішінде ғана қолданылады.');
  return ctx;
}
