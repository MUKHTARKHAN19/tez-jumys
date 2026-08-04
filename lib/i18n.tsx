import { createContext, useContext, useEffect, useState, type PropsWithChildren } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { translations, type TranslationKey } from '@/constants/translations';

export type AppLanguage = 'kk' | 'ru';

type NamedEntity = { name_kk: string; name_ru: string };

type LanguageContextValue = {
  language: AppLanguage;
  setLanguage: (language: AppLanguage) => void;
  t: (key: TranslationKey) => string;
  localize: (entity: NamedEntity) => string;
};

const STORAGE_KEY = 'tez-jumys-language';

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: PropsWithChildren) {
  const [language, setLanguageState] = useState<AppLanguage>('kk');

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((stored) => {
      if (stored === 'kk' || stored === 'ru') setLanguageState(stored);
    });
  }, []);

  const setLanguage = (next: AppLanguage) => {
    setLanguageState(next);
    AsyncStorage.setItem(STORAGE_KEY, next);
  };

  const t = (key: TranslationKey) => translations[language][key];
  const localize = (entity: NamedEntity) => (language === 'ru' ? entity.name_ru : entity.name_kk);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, localize }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage LanguageProvider ішінде ғана қолданылады.');
  return ctx;
}
