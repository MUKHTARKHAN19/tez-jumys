import { createContext, useContext, useEffect, useState, type PropsWithChildren } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'tez-jumys-favorites';

type FavoritesContextValue = {
  favoriteIds: string[];
  isFavorite: (id: string) => boolean;
  toggleFavorite: (id: string) => void;
};

const FavoritesContext = createContext<FavoritesContextValue | null>(null);

// Таңдаулы вакансиялар тіркелусіз-ақ, тек құрылғының жадында сақталады.
export function FavoritesProvider({ children }: PropsWithChildren) {
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((stored) => {
      if (!stored) return;
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) setFavoriteIds(parsed);
      } catch {
        // елеусіз қалдырамыз — сақталған дерек бүлінген болса, бос тізіммен бастаймыз
      }
    });
  }, []);

  const persist = (ids: string[]) => {
    setFavoriteIds(ids);
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  };

  const isFavorite = (id: string) => favoriteIds.includes(id);

  const toggleFavorite = (id: string) => {
    persist(favoriteIds.includes(id) ? favoriteIds.filter((x) => x !== id) : [...favoriteIds, id]);
  };

  return (
    <FavoritesContext.Provider value={{ favoriteIds, isFavorite, toggleFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error('useFavorites FavoritesProvider ішінде ғана қолданылады.');
  return ctx;
}
